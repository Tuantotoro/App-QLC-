"use client";

import React, { useMemo, useState } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  DatePicker,
  Button,
  InputNumber,
  Input,
  Space,
  Divider,
  Empty,
  Popconfirm,
  Switch,
  Tag,
  App,
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined, SwapOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { useData } from "@/store/DataContext";
import SelectThemMoi from "@/components/shared/SelectThemMoi";
import ChonHinhThucThanhToan, {
  HINH_THUC_MAC_DINH,
  hinhThucHopLe,
} from "@/components/shared/ChonHinhThucThanhToan";
import { DON_VI_OPTIONS, GOI_Y_TEN_CHI_PHI } from "@/utils/constants";
import { formatTien } from "@/utils/calc";
import type {
  Chuyen,
  ChieuChuyen,
  HangTrenChuyen,
  ChiPhiChuyen,
  CongNoBocHang,
  DonViHang,
  LanThanhToanKhach,
  LanThanhToanNguoiBoc,
  ThongTinHinhThuc,
} from "@/types";

interface HangRow {
  key: string;
  /** Có id nghĩa là dòng hàng đã tồn tại từ trước (đang sửa) - giữ nguyên lịch sử thanh toán. */
  id?: string;
  khachHangId?: string;
  loaiHangId?: string;
  soLuong?: number;
  donVi: DonViHang;
  giaTriHang?: number;
  tienKhachPhaiTra?: number;
  /** Chỉ dùng cho dòng MỚI (chưa có id) - thu ngay khi tạo dòng này. */
  daThuNgay?: number;
  /** Tiền mặt hay chuyển khoản cho khoản thu ngay (mặc định tiền mặt). */
  hinhThucThuNgay?: ThongTinHinhThuc;
  /** Lịch sử thanh toán đã có sẵn (dòng cũ) - hiển thị, không sửa ở đây. */
  danhSachThanhToanHienCo?: LanThanhToanKhach[];
  ghiChu?: string;
}

interface ChiPhiRow {
  key: string;
  tenChiPhi?: string;
  soTien?: number;
  ghiChu?: string;
}

interface BocHangRow {
  key: string;
  id?: string;
  nguoiBocHangId?: string;
  soTienPhaiTra?: number;
  daTraNgay?: number;
  /** Tiền mặt hay chuyển khoản cho khoản trả ngay (mặc định tiền mặt). */
  hinhThucTraNgay?: ThongTinHinhThuc;
  ghiChu?: string;
  danhSachThanhToanHienCo?: LanThanhToanNguoiBoc[];
}

function taoHangRowMoi(): HangRow {
  return { key: uuidv4(), donVi: "bao" };
}

/** Chuẩn hóa hình thức thanh toán để lưu: tiền mặt thì không mang theo tài khoản. */
function hinhThucDeLuu(v?: ThongTinHinhThuc): ThongTinHinhThuc {
  const hinhThuc = v ?? HINH_THUC_MAC_DINH;
  return hinhThuc.hinhThuc === "chuyen_khoan"
    ? { hinhThuc: "chuyen_khoan", taiKhoanId: hinhThuc.taiKhoanId }
    : { hinhThuc: "tien_mat" };
}

function tinhDaThu(danhSach?: LanThanhToanKhach[] | LanThanhToanNguoiBoc[]): number {
  return (danhSach ?? []).reduce((s, lt) => s + lt.soTien, 0);
}

// ==========================================================================
// Hook quản lý toàn bộ dữ liệu của MỘT chiều (đi hoặc về): xe, tài xế, hàng,
// chi phí, công nợ bốc hàng. Gọi 2 lần trong ChuyenForm - một cho chiều đi,
// một cho chiều về - để 2 chiều có dữ liệu hoàn toàn độc lập với nhau.
// ==========================================================================
function useChieuState(initial?: ChieuChuyen) {
  const { data: duLieuApp } = useData();
  const taiKhoanDangDung = duLieuApp.taiKhoanNganHangList.filter((t) => t.dangHoatDong);
  const [xeId, setXeId] = useState<string | undefined>(initial?.xeId);
  const [taiXeId, setTaiXeId] = useState<string | undefined>(initial?.taiXeId);
  const [ghiChu, setGhiChu] = useState(initial?.ghiChu ?? "");

  const [hangRows, setHangRows] = useState<HangRow[]>(() =>
    initial
      ? initial.danhSachHang.map((h) => ({
          key: h.id,
          id: h.id,
          khachHangId: h.khachHangId,
          loaiHangId: h.loaiHangId,
          soLuong: h.soLuong,
          donVi: h.donVi,
          giaTriHang: h.giaTriHang,
          tienKhachPhaiTra: h.tienKhachPhaiTra,
          danhSachThanhToanHienCo: h.danhSachThanhToan,
          ghiChu: h.ghiChu,
        }))
      : [taoHangRowMoi()]
  );
  const [chiPhiRows, setChiPhiRows] = useState<ChiPhiRow[]>(
    () => initial?.danhSachChiPhi.map((c) => ({ key: c.id, tenChiPhi: c.tenChiPhi, soTien: c.soTien, ghiChu: c.ghiChu })) ?? []
  );
  const [bocHangRows, setBocHangRows] = useState<BocHangRow[]>(
    () =>
      initial?.danhSachCongNoBocHang.map((b) => ({
        key: b.id,
        id: b.id,
        nguoiBocHangId: b.nguoiBocHangId,
        soTienPhaiTra: b.soTienPhaiTra,
        ghiChu: b.ghiChu,
        danhSachThanhToanHienCo: b.danhSachThanhToan,
      })) ?? []
  );

  function capNhatHangRow(key: string, patch: Partial<HangRow>) {
    setHangRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function xoaHangRow(row: HangRow) {
    setHangRows((rows) => rows.filter((r) => r.key !== row.key));
  }
  function capNhatChiPhiRow(key: string, patch: Partial<ChiPhiRow>) {
    setChiPhiRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function capNhatBocHangRow(key: string, patch: Partial<BocHangRow>) {
    setBocHangRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function xoaBocHangRow(row: BocHangRow) {
    setBocHangRows((rows) => rows.filter((r) => r.key !== row.key));
  }

  const tongKet = useMemo(() => {
    const tongGiaTriHang = hangRows.reduce((s, h) => s + (h.giaTriHang ?? 0), 0);
    const tongPhaiThu = hangRows.reduce((s, h) => s + (h.tienKhachPhaiTra ?? 0), 0);
    const tongDaThu = hangRows.reduce(
      (s, h) => s + (h.id ? tinhDaThu(h.danhSachThanhToanHienCo) : h.daThuNgay ?? 0),
      0
    );
    const tongChiPhi = chiPhiRows.reduce((s, c) => s + (c.soTien ?? 0), 0);
    const tongPhaiTraBoc = bocHangRows.reduce((s, b) => s + (b.soTienPhaiTra ?? 0), 0);
    return {
      tongGiaTriHang,
      tongPhaiThu,
      tongDaThu,
      conPhaiThu: Math.max(0, tongPhaiThu - tongDaThu),
      tongChiPhi,
      tongPhaiTraBoc,
    };
  }, [hangRows, chiPhiRows, bocHangRows]);

  function kiemTraHopLe(): string | null {
    if (!xeId) return "Vui lòng chọn xe.";
    if (!taiXeId) return "Vui lòng chọn tài xế.";
    if (hangRows.length === 0) return "Vui lòng thêm ít nhất một loại hàng.";
    for (const h of hangRows) {
      if (!h.khachHangId) return "Vui lòng chọn khách hàng cho tất cả các dòng hàng.";
      if (!h.loaiHangId) return "Vui lòng chọn loại hàng cho tất cả các dòng hàng.";
      if (!h.soLuong || h.soLuong <= 0) return "Số lượng hàng phải lớn hơn 0.";
      if (h.tienKhachPhaiTra === undefined || h.tienKhachPhaiTra < 0)
        return "Vui lòng nhập tiền khách phải trả (có thể là 0).";
      if (
        !h.id &&
        (h.daThuNgay ?? 0) > 0 &&
        !hinhThucHopLe(h.hinhThucThuNgay ?? HINH_THUC_MAC_DINH, taiKhoanDangDung)
      )
        return "Khoản thu ngay bằng chuyển khoản: vui lòng chọn tài khoản ngân hàng nhận tiền.";
      if (h.giaTriHang === undefined || h.giaTriHang < 0)
        return "Vui lòng nhập giá trị hàng (có thể là 0).";
    }
    for (const b of bocHangRows) {
      if (!b.nguoiBocHangId) return "Vui lòng chọn người bốc hàng cho các dòng công nợ bốc hàng.";
      if (b.soTienPhaiTra === undefined || b.soTienPhaiTra < 0)
        return "Vui lòng nhập số tiền phải trả người bốc hàng.";
      if (
        !b.id &&
        (b.daTraNgay ?? 0) > 0 &&
        !hinhThucHopLe(b.hinhThucTraNgay ?? HINH_THUC_MAC_DINH, taiKhoanDangDung)
      )
        return "Khoản trả ngay bằng chuyển khoản: vui lòng chọn tài khoản ngân hàng trả tiền.";
    }
    return null;
  }

  function xuatDuLieu(): ChieuChuyen {
    const danhSachHang: HangTrenChuyen[] = hangRows.map((h) => ({
      id: h.id ?? uuidv4(),
      khachHangId: h.khachHangId!,
      loaiHangId: h.loaiHangId!,
      soLuong: h.soLuong!,
      donVi: h.donVi,
      giaTriHang: h.giaTriHang ?? 0,
      tienKhachPhaiTra: h.tienKhachPhaiTra ?? 0,
      danhSachThanhToan: h.id
        ? h.danhSachThanhToanHienCo ?? []
        : h.daThuNgay && h.daThuNgay > 0
        ? [
            {
              id: uuidv4(),
              ngayThanhToan: new Date().toISOString(),
              soTien: h.daThuNgay,
              ghiChu: "Thu ngay khi tạo chuyến",
              ...hinhThucDeLuu(h.hinhThucThuNgay),
            },
          ]
        : [],
      ghiChu: h.ghiChu || undefined,
    }));

    const danhSachChiPhi: ChiPhiChuyen[] = chiPhiRows
      .filter((c) => c.tenChiPhi && c.soTien !== undefined)
      .map((c) => ({ id: uuidv4(), tenChiPhi: c.tenChiPhi!, soTien: c.soTien ?? 0, ghiChu: c.ghiChu }));

    const danhSachCongNoBocHang: CongNoBocHang[] = bocHangRows.map((b) => ({
      id: b.id ?? uuidv4(),
      nguoiBocHangId: b.nguoiBocHangId!,
      soTienPhaiTra: b.soTienPhaiTra ?? 0,
      danhSachThanhToan: b.id
        ? b.danhSachThanhToanHienCo ?? []
        : b.daTraNgay && b.daTraNgay > 0
        ? [
            {
              id: uuidv4(),
              ngayThanhToan: new Date().toISOString(),
              soTien: b.daTraNgay,
              ghiChu: "Trả ngay khi tạo chuyến",
              ...hinhThucDeLuu(b.hinhThucTraNgay),
            },
          ]
        : [],
      ghiChu: b.ghiChu,
    }));

    return {
      xeId: xeId!,
      taiXeId: taiXeId!,
      danhSachHang,
      danhSachChiPhi,
      danhSachCongNoBocHang,
      ghiChu: ghiChu || undefined,
    };
  }

  return {
    xeId,
    setXeId,
    taiXeId,
    setTaiXeId,
    ghiChu,
    setGhiChu,
    hangRows,
    setHangRows,
    capNhatHangRow,
    xoaHangRow,
    chiPhiRows,
    setChiPhiRows,
    capNhatChiPhiRow,
    bocHangRows,
    setBocHangRows,
    capNhatBocHangRow,
    xoaBocHangRow,
    tongKet,
    kiemTraHopLe,
    xuatDuLieu,
  };
}

type ChieuState = ReturnType<typeof useChieuState>;

interface OptionsDungChung {
  xeOptions: { value: string; label: string }[];
  taiXeOptions: { value: string; label: string }[];
  khachHangOptions: { value: string; label: string }[];
  loaiHangOptions: { value: string; label: string }[];
  nguoiBocHangOptions: { value: string; label: string }[];
  themXe: ReturnType<typeof useData>["themXe"];
  themTaiXe: ReturnType<typeof useData>["themTaiXe"];
  themKhachHang: ReturnType<typeof useData>["themKhachHang"];
  themLoaiHang: ReturnType<typeof useData>["themLoaiHang"];
  themNguoiBocHang: ReturnType<typeof useData>["themNguoiBocHang"];
}

/**
 * Toàn bộ giao diện cho MỘT chiều (đi hoặc về): xe & tài xế, hàng trên xe,
 * chi phí, công nợ bốc hàng. Dùng chung cho cả 2 chiều - chỉ khác dữ liệu
 * (state) và nhãn hiển thị truyền vào.
 */
function ChieuSection({
  nhan,
  mauTag,
  state,
  options,
  choPhepSaoChepTu,
}: {
  nhan: string;
  mauTag: string;
  state: ChieuState;
  options: OptionsDungChung;
  /** Nếu có, hiện nút "Dùng xe & tài xế giống {nhan đó}" để sao chép nhanh. */
  choPhepSaoChepTu?: { nhan: string; xeId?: string; taiXeId?: string };
}) {
  const {
    xeOptions,
    taiXeOptions,
    khachHangOptions,
    loaiHangOptions,
    nguoiBocHangOptions,
    themXe,
    themTaiXe,
    themKhachHang,
    themLoaiHang,
    themNguoiBocHang,
  } = options;

  return (
    <div style={{ marginBottom: 8 }}>
      <Divider titlePlacement="left">
        <Tag color={mauTag} style={{ fontSize: 13, padding: "2px 10px" }}>
          {nhan}
        </Tag>
      </Divider>

      <Card title={`Xe & tài xế - ${nhan}`} size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={11}>
            <Typography.Text type="secondary">Xe</Typography.Text>
            <SelectThemMoi
              style={{ width: "100%" }}
              placeholder="Chọn xe"
              value={state.xeId}
              options={xeOptions}
              onChange={state.setXeId}
              placeholderThemMoi="Biển số xe mới..."
              onThemMoi={(ten) => {
                const moi = themXe({ bienSo: ten, dangHoatDong: true });
                state.setXeId(moi.id);
              }}
            />
          </Col>
          <Col xs={24} sm={11}>
            <Typography.Text type="secondary">Tài xế</Typography.Text>
            <SelectThemMoi
              style={{ width: "100%" }}
              placeholder="Chọn tài xế"
              value={state.taiXeId}
              options={taiXeOptions}
              onChange={state.setTaiXeId}
              placeholderThemMoi="Tên tài xế mới..."
              onThemMoi={(ten) => {
                const moi = themTaiXe({ hoTen: ten, dangHoatDong: true });
                state.setTaiXeId(moi.id);
              }}
            />
          </Col>
          {choPhepSaoChepTu && (
            <Col xs={24} sm={2} style={{ display: "flex", alignItems: "flex-end" }}>
              <Button
                icon={<SwapOutlined />}
                style={{ width: "100%" }}
                title={`Dùng xe & tài xế giống ${choPhepSaoChepTu.nhan}`}
                onClick={() => {
                  state.setXeId(choPhepSaoChepTu.xeId);
                  state.setTaiXeId(choPhepSaoChepTu.taiXeId);
                }}
              />
            </Col>
          )}
          <Col span={24}>
            <Typography.Text type="secondary">Ghi chú {nhan.toLowerCase()} (tùy chọn)</Typography.Text>
            <Input
              value={state.ghiChu}
              onChange={(e) => state.setGhiChu(e.target.value)}
              placeholder="VD: đổi xe vì xe cũ phải quay đầu gấp..."
            />
          </Col>
        </Row>
      </Card>

      <Card
        title={`Hàng trên xe - ${nhan}`}
        size="small"
        style={{ marginBottom: 16 }}
        extra={
          <Button
            icon={<PlusOutlined />}
            onClick={() => state.setHangRows((rows) => [...rows, taoHangRowMoi()])}
          >
            Thêm hàng
          </Button>
        }
      >
        {state.hangRows.length === 0 && <Empty description="Chưa có hàng nào" />}
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {state.hangRows.map((h, idx) => {
            const coLichSu = h.id && (h.danhSachThanhToanHienCo?.length ?? 0) > 0;
            const nutXoa = (
              <Button danger type="text" icon={<DeleteOutlined />} onClick={() => state.xoaHangRow(h)} />
            );
            return (
              <Card
                key={h.key}
                size="small"
                type="inner"
                title={`Hàng ${idx + 1}`}
                extra={
                  state.hangRows.length > 1 &&
                  (coLichSu ? (
                    <Popconfirm
                      title="Xóa dòng hàng này?"
                      description="Dòng này đã có lịch sử thanh toán - xóa sẽ mất luôn lịch sử đó."
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={() => state.xoaHangRow(h)}
                    >
                      <Button danger type="text" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ) : (
                    nutXoa
                  ))
                }
              >
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12} md={8}>
                    <Typography.Text type="secondary">Khách hàng</Typography.Text>
                    <SelectThemMoi
                      style={{ width: "100%" }}
                      placeholder="Chọn khách hàng"
                      value={h.khachHangId}
                      options={khachHangOptions}
                      onChange={(v) => state.capNhatHangRow(h.key, { khachHangId: v })}
                      placeholderThemMoi="Tên khách hàng mới..."
                      onThemMoi={(ten) => {
                        const moi = themKhachHang({ hoTen: ten });
                        state.capNhatHangRow(h.key, { khachHangId: moi.id });
                      }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Typography.Text type="secondary">Loại hàng</Typography.Text>
                    <SelectThemMoi
                      style={{ width: "100%" }}
                      placeholder="Chọn loại hàng"
                      value={h.loaiHangId}
                      options={loaiHangOptions}
                      onChange={(v) => state.capNhatHangRow(h.key, { loaiHangId: v })}
                      placeholderThemMoi="Tên loại hàng mới..."
                      onThemMoi={(ten) => {
                        const moi = themLoaiHang({ ten });
                        state.capNhatHangRow(h.key, { loaiHangId: moi.id });
                      }}
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <Typography.Text type="secondary">Số lượng</Typography.Text>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      value={h.soLuong}
                      onChange={(v) => state.capNhatHangRow(h.key, { soLuong: v ?? undefined })}
                    />
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <Typography.Text type="secondary">Đơn vị</Typography.Text>
                    <SelectThemMoi
                      style={{ width: "100%" }}
                      value={h.donVi}
                      options={DON_VI_OPTIONS}
                      onChange={(v) => state.capNhatHangRow(h.key, { donVi: v })}
                      placeholderThemMoi="Đơn vị khác..."
                      onThemMoi={(ten) => state.capNhatHangRow(h.key, { donVi: ten })}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Typography.Text type="secondary">Giá trị hàng (không phải doanh thu)</Typography.Text>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      step={100000}
                      value={h.giaTriHang}
                      formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
                      parser={(v) => Number((v ?? "").replace(/\D/g, "")) as unknown as number}
                      onChange={(v) => state.capNhatHangRow(h.key, { giaTriHang: v ?? undefined })}
                      addonAfter="đ"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Typography.Text type="secondary">Tiền khách phải trả</Typography.Text>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      step={50000}
                      value={h.tienKhachPhaiTra}
                      formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
                      parser={(v) => Number((v ?? "").replace(/\D/g, "")) as unknown as number}
                      onChange={(v) => state.capNhatHangRow(h.key, { tienKhachPhaiTra: v ?? undefined })}
                      addonAfter="đ"
                    />
                  </Col>
                  <Col xs={24} sm={24} md={8}>
                    {h.id ? (
                      <>
                        <Typography.Text type="secondary">Đã thu (theo lịch sử thanh toán)</Typography.Text>
                        <div>
                          <Typography.Text strong style={{ color: "#1B7A43" }}>
                            {formatTien(tinhDaThu(h.danhSachThanhToanHienCo))}
                          </Typography.Text>
                          <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                            (sửa ở trang chi tiết chuyến)
                          </Typography.Text>
                        </div>
                      </>
                    ) : (
                      <>
                        <Typography.Text type="secondary">Đã thu ngay (tùy chọn)</Typography.Text>
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          step={50000}
                          value={h.daThuNgay}
                          formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
                          parser={(v) => Number((v ?? "").replace(/\D/g, "")) as unknown as number}
                          onChange={(v) => state.capNhatHangRow(h.key, { daThuNgay: v ?? undefined })}
                          addonAfter="đ"
                        />
                        {(h.daThuNgay ?? 0) > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <ChonHinhThucThanhToan
                              gon
                              huong="thu"
                              value={h.hinhThucThuNgay ?? HINH_THUC_MAC_DINH}
                              onChange={(v) => state.capNhatHangRow(h.key, { hinhThucThuNgay: v })}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </Col>
                  <Col xs={24}>
                    <Typography.Text type="secondary">Ghi chú (tùy chọn)</Typography.Text>
                    <Input
                      placeholder="VD: Giao trước 8h, hàng dễ vỡ..."
                      value={h.ghiChu}
                      onChange={(e) => state.capNhatHangRow(h.key, { ghiChu: e.target.value })}
                    />
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      </Card>

      <Card
        title={`Chi phí - ${nhan}`}
        size="small"
        style={{ marginBottom: 16 }}
        extra={
          <Button
            icon={<PlusOutlined />}
            onClick={() => state.setChiPhiRows((rows) => [...rows, { key: uuidv4() }])}
          >
            Thêm chi phí
          </Button>
        }
      >
        {state.chiPhiRows.length === 0 && <Empty description="Chưa có khoản chi phí nào" />}
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {state.chiPhiRows.map((c, idx) => (
            <Card
              key={c.key}
              size="small"
              type="inner"
              title={`Chi phí ${idx + 1}`}
              extra={
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => state.setChiPhiRows((rows) => rows.filter((r) => r.key !== c.key))}
                />
              }
            >
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={10}>
                  <Typography.Text type="secondary">Tên chi phí</Typography.Text>
                  <SelectThemMoi
                    style={{ width: "100%" }}
                    placeholder="VD: Xăng dầu"
                    value={c.tenChiPhi}
                    options={GOI_Y_TEN_CHI_PHI.map((t) => ({ value: t, label: t }))}
                    onChange={(v) => state.capNhatChiPhiRow(c.key, { tenChiPhi: v })}
                    placeholderThemMoi="Tên chi phí khác..."
                    onThemMoi={(ten) => state.capNhatChiPhiRow(c.key, { tenChiPhi: ten })}
                  />
                </Col>
                <Col xs={24} sm={7}>
                  <Typography.Text type="secondary">Số tiền</Typography.Text>
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    step={50000}
                    placeholder="Số tiền"
                    value={c.soTien}
                    formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
                    parser={(v) => Number((v ?? "").replace(/\D/g, "")) as unknown as number}
                    onChange={(v) => state.capNhatChiPhiRow(c.key, { soTien: v ?? undefined })}
                    addonAfter="đ"
                  />
                </Col>
                <Col xs={24} sm={7}>
                  <Typography.Text type="secondary">Ghi chú (tùy chọn)</Typography.Text>
                  <Input
                    placeholder="Ghi chú"
                    value={c.ghiChu}
                    onChange={(e) => state.capNhatChiPhiRow(c.key, { ghiChu: e.target.value })}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      </Card>

      <Card
        title={`Người bốc hàng (công nợ phải trả) - ${nhan} - tùy chọn`}
        size="small"
        style={{ marginBottom: 16 }}
        extra={
          <Button
            icon={<PlusOutlined />}
            onClick={() => state.setBocHangRows((rows) => [...rows, { key: uuidv4() }])}
          >
            Thêm người bốc hàng
          </Button>
        }
      >
        {state.bocHangRows.length === 0 && <Empty description="Chưa có khoản nào cho chiều này" />}
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {state.bocHangRows.map((b, idx) => {
            const coLichSu = b.id && (b.danhSachThanhToanHienCo?.length ?? 0) > 0;
            return (
              <Card
                key={b.key}
                size="small"
                type="inner"
                title={`Người bốc hàng ${idx + 1}`}
                extra={
                  coLichSu ? (
                    <Popconfirm
                      title="Xóa khoản này?"
                      description="Khoản này đã có lịch sử trả tiền - xóa sẽ mất luôn lịch sử đó."
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={() => state.xoaBocHangRow(b)}
                    >
                      <Button danger type="text" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ) : (
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => state.xoaBocHangRow(b)}
                    />
                  )
                }
              >
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={10}>
                    <Typography.Text type="secondary">Người bốc hàng</Typography.Text>
                    <SelectThemMoi
                      style={{ width: "100%" }}
                      placeholder="Chọn người bốc hàng"
                      value={b.nguoiBocHangId}
                      options={nguoiBocHangOptions}
                      onChange={(v) => state.capNhatBocHangRow(b.key, { nguoiBocHangId: v })}
                      placeholderThemMoi="Tên người bốc hàng mới..."
                      onThemMoi={(ten) => {
                        const moi = themNguoiBocHang({ hoTen: ten });
                        state.capNhatBocHangRow(b.key, { nguoiBocHangId: moi.id });
                      }}
                    />
                  </Col>
                  <Col xs={12} sm={7}>
                    <Typography.Text type="secondary">Số tiền phải trả</Typography.Text>
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      step={50000}
                      value={b.soTienPhaiTra}
                      formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
                      parser={(v) => Number((v ?? "").replace(/\D/g, "")) as unknown as number}
                      onChange={(v) => state.capNhatBocHangRow(b.key, { soTienPhaiTra: v ?? undefined })}
                      addonAfter="đ"
                    />
                  </Col>
                  <Col xs={12} sm={7}>
                    {b.id ? (
                      <>
                        <Typography.Text type="secondary">Đã trả (theo lịch sử)</Typography.Text>
                        <div>
                          <Typography.Text strong style={{ color: "#1B7A43" }}>
                            {formatTien(tinhDaThu(b.danhSachThanhToanHienCo))}
                          </Typography.Text>
                        </div>
                      </>
                    ) : (
                      <>
                        <Typography.Text type="secondary">Đã trả ngay (tùy chọn)</Typography.Text>
                        <InputNumber
                          style={{ width: "100%" }}
                          min={0}
                          step={50000}
                          value={b.daTraNgay}
                          formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
                          parser={(v) => Number((v ?? "").replace(/\D/g, "")) as unknown as number}
                          onChange={(v) => state.capNhatBocHangRow(b.key, { daTraNgay: v ?? undefined })}
                          addonAfter="đ"
                        />
                        {(b.daTraNgay ?? 0) > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <ChonHinhThucThanhToan
                              gon
                              huong="tra"
                              value={b.hinhThucTraNgay ?? HINH_THUC_MAC_DINH}
                              onChange={(v) => state.capNhatBocHangRow(b.key, { hinhThucTraNgay: v })}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </Col>
                  <Col xs={24}>
                    <Typography.Text type="secondary">Ghi chú (tùy chọn)</Typography.Text>
                    <Input
                      placeholder="Ghi chú"
                      value={b.ghiChu}
                      onChange={(e) => state.capNhatBocHangRow(b.key, { ghiChu: e.target.value })}
                    />
                  </Col>
                </Row>
              </Card>
            );
          })}
        </Space>
      </Card>

      <Card size="small" style={{ marginBottom: 24 }}>
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <Typography.Text type="secondary">Giá trị hàng</Typography.Text>
            <div>
              <Typography.Text strong>{formatTien(state.tongKet.tongGiaTriHang)}</Typography.Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Typography.Text type="secondary">Khách phải trả</Typography.Text>
            <div>
              <Typography.Text strong>{formatTien(state.tongKet.tongPhaiThu)}</Typography.Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Typography.Text type="secondary">Chi phí</Typography.Text>
            <div>
              <Typography.Text strong style={{ color: "#C58A00" }}>
                {formatTien(state.tongKet.tongChiPhi)}
              </Typography.Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Typography.Text type="secondary">Phải trả bốc hàng</Typography.Text>
            <div>
              <Typography.Text strong>{formatTien(state.tongKet.tongPhaiTraBoc)}</Typography.Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default function ChuyenForm({ chuyenSua }: { chuyenSua?: Chuyen }) {
  const dangSua = !!chuyenSua;
  const { data, themXe, themTaiXe, themKhachHang, themLoaiHang, themNguoiBocHang, themChuyen, capNhatChuyen } =
    useData();
  const router = useRouter();
  const { message } = App.useApp();

  const [ngay, setNgay] = useState<Dayjs>(() => (chuyenSua ? dayjs(chuyenSua.ngay) : dayjs()));
  const [coChieuVe, setCoChieuVe] = useState<boolean>(!!chuyenSua?.chieuVe);
  const [ngayVe, setNgayVe] = useState<Dayjs>(() =>
    chuyenSua?.ngayVe ? dayjs(chuyenSua.ngayVe) : chuyenSua ? dayjs(chuyenSua.ngay) : dayjs()
  );
  const [ghiChuChuyen, setGhiChuChuyen] = useState(chuyenSua?.ghiChu ?? "");
  const [dangLuu, setDangLuu] = useState(false);

  // Luôn gọi hook cho cả 2 chiều (đúng quy tắc Hook) - chiều về chỉ hiển thị
  // UI và được lưu khi coChieuVe = true.
  const chieuDi = useChieuState(chuyenSua?.chieuDi);
  const chieuVe = useChieuState(chuyenSua?.chieuVe);

  const options: OptionsDungChung = {
    xeOptions: data.xeList.map((x) => ({ value: x.id, label: x.bienSo })),
    taiXeOptions: data.taiXeList.map((t) => ({ value: t.id, label: t.hoTen })),
    khachHangOptions: data.khachHangList.map((k) => ({ value: k.id, label: k.hoTen })),
    loaiHangOptions: data.loaiHangList.map((l) => ({ value: l.id, label: l.ten })),
    nguoiBocHangOptions: data.nguoiBocHangList.map((n) => ({ value: n.id, label: n.hoTen })),
    themXe,
    themTaiXe,
    themKhachHang,
    themLoaiHang,
    themNguoiBocHang,
  };

  const tongKetCaChuyen = useMemo(() => {
    const chieu = coChieuVe ? [chieuDi.tongKet, chieuVe.tongKet] : [chieuDi.tongKet];
    return chieu.reduce(
      (tong, t) => ({
        tongGiaTriHang: tong.tongGiaTriHang + t.tongGiaTriHang,
        tongPhaiThu: tong.tongPhaiThu + t.tongPhaiThu,
        tongDaThu: tong.tongDaThu + t.tongDaThu,
        conPhaiThu: tong.conPhaiThu + t.conPhaiThu,
        tongChiPhi: tong.tongChiPhi + t.tongChiPhi,
        tongPhaiTraBoc: tong.tongPhaiTraBoc + t.tongPhaiTraBoc,
      }),
      { tongGiaTriHang: 0, tongPhaiThu: 0, tongDaThu: 0, conPhaiThu: 0, tongChiPhi: 0, tongPhaiTraBoc: 0 }
    );
  }, [chieuDi.tongKet, chieuVe.tongKet, coChieuVe]);

  function xuLyLuu() {
    const loiDi = chieuDi.kiemTraHopLe();
    if (loiDi) {
      message.error(`Chiều đi: ${loiDi}`);
      return;
    }
    if (coChieuVe) {
      const loiVe = chieuVe.kiemTraHopLe();
      if (loiVe) {
        message.error(`Chiều về: ${loiVe}`);
        return;
      }
    }

    setDangLuu(true);

    const duLieuChieuDi = chieuDi.xuatDuLieu();
    const duLieuChieuVe = coChieuVe ? chieuVe.xuatDuLieu() : undefined;

    const patch = {
      ngay: ngay.toISOString(),
      ngayVe: coChieuVe ? ngayVe.toISOString() : undefined,
      chieuDi: duLieuChieuDi,
      chieuVe: duLieuChieuVe,
      ghiChu: ghiChuChuyen || undefined,
    };

    if (dangSua && chuyenSua) {
      capNhatChuyen(chuyenSua.id, patch);
      message.success("Đã lưu thay đổi.");
      router.push(`/chuyen/chi-tiet?id=${chuyenSua.id}`);
      return;
    }

    const moi = themChuyen(patch);
    message.success("Đã lưu chuyến thành công.");
    router.push(`/chuyen/chi-tiet?id=${moi.id}`);
  }

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {dangSua ? "Sửa chuyến" : "Tạo chuyến mới"}
      </Typography.Title>

      <Card title="Thông tin chuyến" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={coChieuVe ? 8 : 12}>
            <Typography.Text type="secondary">Ngày đi</Typography.Text>
            <DatePicker
              style={{ width: "100%" }}
              value={ngay}
              onChange={(v) => v && setNgay(v)}
              format="DD/MM/YYYY"
              size="large"
              inputReadOnly
            />
          </Col>
          {coChieuVe && (
            <Col xs={24} sm={8}>
              <Typography.Text type="secondary">Ngày về</Typography.Text>
              <DatePicker
                style={{ width: "100%" }}
                value={ngayVe}
                onChange={(v) => v && setNgayVe(v)}
                format="DD/MM/YYYY"
                size="large"
                inputReadOnly
              />
            </Col>
          )}
          <Col xs={24} sm={coChieuVe ? 8 : 12}>
            <Typography.Text type="secondary" style={{ display: "block" }}>
              Chuyến khứ hồi (có chở hàng về)
            </Typography.Text>
            <Switch
              checked={coChieuVe}
              onChange={setCoChieuVe}
              checkedChildren="Có chiều về"
              unCheckedChildren="Chỉ chiều đi"
            />
          </Col>
          <Col span={24}>
            <Typography.Text type="secondary">Ghi chú chung của chuyến (tùy chọn)</Typography.Text>
            <Input
              value={ghiChuChuyen}
              onChange={(e) => setGhiChuChuyen(e.target.value)}
              placeholder="VD: chuyến giao gấp buổi sáng..."
            />
          </Col>
        </Row>
      </Card>

      <ChieuSection nhan="Chiều đi" mauTag="blue" state={chieuDi} options={options} />

      {coChieuVe && (
        <ChieuSection
          nhan="Chiều về"
          mauTag="purple"
          state={chieuVe}
          options={options}
          choPhepSaoChepTu={{ nhan: "chiều đi", xeId: chieuDi.xeId, taiXeId: chieuDi.taiXeId }}
        />
      )}

      <Card title="Tổng kết cả chuyến" size="small" style={{ marginBottom: 24 }}>
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <Typography.Text type="secondary">Tổng giá trị hàng</Typography.Text>
            <div>
              <Typography.Text strong>{formatTien(tongKetCaChuyen.tongGiaTriHang)}</Typography.Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Typography.Text type="secondary">Tổng khách phải trả</Typography.Text>
            <div>
              <Typography.Text strong>{formatTien(tongKetCaChuyen.tongPhaiThu)}</Typography.Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Typography.Text type="secondary">Tổng đã thu</Typography.Text>
            <div>
              <Typography.Text strong style={{ color: "#1B7A43" }}>
                {formatTien(tongKetCaChuyen.tongDaThu)}
              </Typography.Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Typography.Text type="secondary">Còn phải thu</Typography.Text>
            <div>
              <Typography.Text
                strong
                style={{ color: tongKetCaChuyen.conPhaiThu > 0 ? "#C0392B" : "#1B7A43" }}
              >
                {formatTien(tongKetCaChuyen.conPhaiThu)}
              </Typography.Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <Typography.Text type="secondary">Tổng chi phí</Typography.Text>
            <div>
              <Typography.Text strong style={{ color: "#C58A00" }}>
                {formatTien(tongKetCaChuyen.tongChiPhi)}
              </Typography.Text>
            </div>
          </Col>
        </Row>
        <Divider style={{ margin: "12px 0" }} />
        <Button
          type="primary"
          size="large"
          block
          icon={<SaveOutlined />}
          loading={dangLuu}
          onClick={xuLyLuu}
        >
          {dangSua ? "Lưu thay đổi" : "Lưu chuyến"}
        </Button>
      </Card>
    </div>
  );
}
