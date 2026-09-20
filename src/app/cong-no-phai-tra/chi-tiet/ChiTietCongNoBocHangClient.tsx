"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Typography, Card, Row, Col, Table, Button, Result, Space, App, Grid } from "antd";
import { ArrowLeftOutlined, DollarOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useData, useLookup } from "@/store/DataContext";
import { tongHopCongNoNguoiBocHang } from "@/utils/aggregate";
import {
  tinhDaTraCongNoBocHang,
  tinhConNoCongNoBocHang,
  tinhTrangThaiCongNoBocHang,
  layChieu,
  formatNgay,
} from "@/utils/calc";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import ModalGhiNhanThanhToan from "@/components/shared/ModalGhiNhanThanhToan";
import LichSuThanhToan from "@/components/shared/LichSuThanhToan";
import MobileChuyenCongNo from "@/components/shared/MobileChuyenCongNo";
import MobileDauTrangCongNo from "@/components/shared/MobileDauTrangCongNo";
import type { Chuyen, CongNoBocHang, LoaiChieu } from "@/types";
import type { ColumnsType } from "antd/es/table";

type DongDuLieu = { chuyen: Chuyen; loai: LoaiChieu; congNo: CongNoBocHang };

const { useBreakpoint } = Grid;

export default function ChiTietCongNoBocHangClient() {
  const params = useSearchParams();
  const nguoiBocHangId = params.get("id");
  const screens = useBreakpoint();
  const isDesktop = screens.md;
  const { data, ghiNhanThanhToanBocHang, xoaThanhToanBocHang } = useData();
  const { nguoiBocHangMap, xeMap, taiXeMap } = useLookup(data);
  const { message } = App.useApp();

  const congNo = useMemo(
    () => tongHopCongNoNguoiBocHang(data).find((c) => c.nguoiBocHangId === nguoiBocHangId),
    [data, nguoiBocHangId]
  );

  const [dangThanhToan, setDangThanhToan] = useState<{ chuyen: Chuyen; congNo: CongNoBocHang } | null>(
    null
  );

  const nguoiBocHang = nguoiBocHangId ? nguoiBocHangMap.get(nguoiBocHangId) : undefined;

  if (!nguoiBocHangId || !nguoiBocHang) {
    return (
      <Result
        status="404"
        title="Không tìm thấy người bốc hàng"
        extra={
          <Link href="/cong-no-phai-tra">
            <Button type="primary">Về danh sách công nợ</Button>
          </Link>
        }
      />
    );
  }

  const dongDuLieu = (congNo?.danhSachDong ?? []).map((d) => {
    const chieuDuLieu = layChieu(d.chuyen, d.loai)!;
    const cn = chieuDuLieu.danhSachCongNoBocHang.find((c) => c.id === d.congNoId)!;
    return { chuyen: d.chuyen, loai: d.loai, congNo: cn };
  });

  const cot: ColumnsType<DongDuLieu> = [
    {
      title: "Ngày",
      render: (_: unknown, r: DongDuLieu) =>
        formatNgay(r.loai === "ve" ? r.chuyen.ngayVe ?? r.chuyen.ngay : r.chuyen.ngay),
    },
    {
      title: "Chiều",
      render: (_: unknown, r: DongDuLieu) => (r.loai === "ve" ? "Chiều về" : "Chiều đi"),
    },
    {
      title: "Xe",
      render: (_: unknown, r: DongDuLieu) =>
        xeMap.get(layChieu(r.chuyen, r.loai)?.xeId ?? "")?.bienSo ?? "—",
    },
    {
      title: "Tài xế",
      render: (_: unknown, r: DongDuLieu) =>
        taiXeMap.get(layChieu(r.chuyen, r.loai)?.taiXeId ?? "")?.hoTen ?? "—",
    },
    {
      title: "Phải trả",
      render: (_: unknown, r: DongDuLieu) => <SoTien value={r.congNo.soTienPhaiTra} />,
    },
    {
      title: "Đã trả",
      render: (_: unknown, r: DongDuLieu) => (
        <SoTien value={tinhDaTraCongNoBocHang(r.congNo)} mau="#1B7A43" />
      ),
    },
    {
      title: "Còn nợ",
      render: (_: unknown, r: DongDuLieu) => {
        const con = tinhConNoCongNoBocHang(r.congNo);
        return <SoTien value={con} mau={con > 0 ? "#C0392B" : "#1B7A43"} />;
      },
    },
    {
      title: "Trạng thái",
      render: (_: unknown, r: DongDuLieu) => (
        <TrangThaiTag trangThai={tinhTrangThaiCongNoBocHang(r.congNo)} kieu="tra" />
      ),
    },
    {
      title: "",
      render: (_: unknown, r: DongDuLieu) => (
        <Space>
          <Button size="small" icon={<DollarOutlined />} onClick={() => setDangThanhToan(r)}>
            Trả tiền
          </Button>
          <Link href={`/chuyen/chi-tiet?id=${r.chuyen.id}`}>Xem chuyến</Link>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link href="/cong-no-phai-tra">
          <Button icon={<ArrowLeftOutlined />}>Danh sách công nợ</Button>
        </Link>
      </Space>

      {!isDesktop ? (
        <MobileDauTrangCongNo
          ten={nguoiBocHang.hoTen}
          soDienThoai={nguoiBocHang.soDienThoai}
          trangThai={congNo?.trangThai}
          kieu="tra"
          tong={[
            { nhan: "Tổng phải trả", value: congNo?.tongPhaiTra ?? 0 },
            { nhan: "Đã trả", value: congNo?.tongDaTra ?? 0, mau: "#1B7A43" },
            {
              nhan: "Còn nợ",
              value: congNo?.tongConNo ?? 0,
              mau: (congNo?.tongConNo ?? 0) > 0 ? "#C0392B" : "#1B7A43",
            },
          ]}
        />
      ) : (
        <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {nguoiBocHang.hoTen}
            </Typography.Title>
            {nguoiBocHang.soDienThoai && (
              <Typography.Text type="secondary">SĐT: {nguoiBocHang.soDienThoai}</Typography.Text>
            )}
          </Col>
          <Col>{congNo && <TrangThaiTag trangThai={congNo.trangThai} kieu="tra" />}</Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={8}>
            <Typography.Text type="secondary">Tổng phải trả</Typography.Text>
            <div>
              <SoTien value={congNo?.tongPhaiTra ?? 0} size={16} />
            </div>
          </Col>
          <Col xs={8}>
            <Typography.Text type="secondary">Đã trả</Typography.Text>
            <div>
              <SoTien value={congNo?.tongDaTra ?? 0} size={16} mau="#1B7A43" />
            </div>
          </Col>
          <Col xs={8}>
            <Typography.Text type="secondary">Còn nợ</Typography.Text>
            <div>
              <SoTien
                value={congNo?.tongConNo ?? 0}
                size={16}
                mau={(congNo?.tongConNo ?? 0) > 0 ? "#C0392B" : "#1B7A43"}
              />
            </div>
          </Col>
        </Row>
        </Card>
      )}

      {!isDesktop ? (
        <div>
          <div className="mobile-khach-section-title">Lịch sử các chuyến ({dongDuLieu.length})</div>
          <MobileChuyenCongNo
            kieu="tra"
            danhSach={dongDuLieu.map((r) => {
              const chieu = layChieu(r.chuyen, r.loai);
              return {
                id: r.congNo.id,
                chuyenId: r.chuyen.id,
                loai: r.loai,
                ngay: r.loai === "ve" ? r.chuyen.ngayVe ?? r.chuyen.ngay : r.chuyen.ngay,
                bienSo: xeMap.get(chieu?.xeId ?? "")?.bienSo ?? "—",
                taiXe: taiXeMap.get(chieu?.taiXeId ?? "")?.hoTen ?? "—",
                ghiChu: r.congNo.ghiChu,
                tongPhaiTra: r.congNo.soTienPhaiTra,
                daThanhToan: tinhDaTraCongNoBocHang(r.congNo),
                conNo: tinhConNoCongNoBocHang(r.congNo),
                trangThai: tinhTrangThaiCongNoBocHang(r.congNo),
                danhSachThanhToan: r.congNo.danhSachThanhToan,
              };
            })}
            onThanhToan={(id) => {
              const dong = dongDuLieu.find((r) => r.congNo.id === id);
              if (dong) setDangThanhToan({ chuyen: dong.chuyen, congNo: dong.congNo });
            }}
            onXoaThanhToan={(chuyenId, congNoId, thanhToanId) => {
              xoaThanhToanBocHang(chuyenId, congNoId, thanhToanId);
              message.success("Đã xóa lần trả tiền.");
            }}
          />
        </div>
      ) : (
        <Card title="Lịch sử các chuyến" size="small">
        <div className="scroll-ngang">
          <Table
            rowKey={(r) => r.congNo.id}
            dataSource={dongDuLieu}
            columns={cot}
            pagination={false}
            size="small"
            expandable={{
              expandedRowRender: (r: DongDuLieu) => (
                <LichSuThanhToan
                  danhSach={r.congNo.danhSachThanhToan}
                  onXoa={(thanhToanId) => {
                    xoaThanhToanBocHang(r.chuyen.id, r.congNo.id, thanhToanId);
                    message.success("Đã xóa lần trả tiền.");
                  }}
                />
              ),
              rowExpandable: () => true,
            }}
          />
        </div>
      </Card>
      )}

      <ModalGhiNhanThanhToan
        open={!!dangThanhToan}
        tieuDe={`Trả tiền - ${nguoiBocHang.hoTen}`}
        moTaConLai="Còn nợ"
        conLai={dangThanhToan ? tinhConNoCongNoBocHang(dangThanhToan.congNo) : 0}
        nhanNutXacNhan="Xác nhận trả tiền"
        huong="tra"
        onDong={() => setDangThanhToan(null)}
        onXacNhan={(soTien, ghiChu, hinhThuc) => {
          if (dangThanhToan) {
            ghiNhanThanhToanBocHang(dangThanhToan.chuyen.id, dangThanhToan.congNo.id, soTien, ghiChu, hinhThuc);
            message.success("Đã ghi nhận trả tiền.");
          }
        }}
      />
    </div>
  );
}
