"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Typography, Card, Row, Col, Table, Button, Result, Space, App, Grid } from "antd";
import { ArrowLeftOutlined, DollarOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useData, useLookup } from "@/store/DataContext";
import { tongHopCongNoKhachHang } from "@/utils/aggregate";
import {
  tinhDaThuHang,
  tinhConPhaiThuHang,
  tinhTrangThaiThanhToanHang,
  layChieu,
  formatNgay,
} from "@/utils/calc";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import ModalGhiNhanThanhToan from "@/components/shared/ModalGhiNhanThanhToan";
import MobileChuyenCongNo from "@/components/shared/MobileChuyenCongNo";
import MobileDauTrangCongNo from "@/components/shared/MobileDauTrangCongNo";
import LichSuThanhToan from "@/components/shared/LichSuThanhToan";
import type { Chuyen, HangTrenChuyen, LoaiChieu } from "@/types";
import type { ColumnsType } from "antd/es/table";

type DongDuLieu = { chuyen: Chuyen; loai: LoaiChieu; hang: HangTrenChuyen };

const { useBreakpoint } = Grid;

export default function ChiTietCongNoKhachClient() {
  const params = useSearchParams();
  const khachHangId = params.get("id");
  const screens = useBreakpoint();
  const isDesktop = screens.md;
  const { data, ghiNhanThanhToanKhach, xoaThanhToanKhach } = useData();
  const { khachHangMap, xeMap, taiXeMap, loaiHangMap } = useLookup(data);
  const { message } = App.useApp();

  const congNo = useMemo(
    () => tongHopCongNoKhachHang(data).find((c) => c.khachHangId === khachHangId),
    [data, khachHangId]
  );

  const [dangThanhToan, setDangThanhToan] = useState<{ chuyen: Chuyen; hang: HangTrenChuyen } | null>(
    null
  );

  const khachHang = khachHangId ? khachHangMap.get(khachHangId) : undefined;

  if (!khachHangId || !khachHang) {
    return (
      <Result
        status="404"
        title="Không tìm thấy khách hàng"
        extra={
          <Link href="/cong-no-phai-thu">
            <Button type="primary">Về danh sách công nợ</Button>
          </Link>
        }
      />
    );
  }

  const dongDuLieu = (congNo?.danhSachDong ?? []).map((d) => {
    const chieuDuLieu = layChieu(d.chuyen, d.loai)!;
    const hang = chieuDuLieu.danhSachHang.find((h) => h.id === d.hangId)!;
    return { chuyen: d.chuyen, loai: d.loai, hang };
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
      title: "Loại hàng",
      render: (_: unknown, r: DongDuLieu) => loaiHangMap.get(r.hang.loaiHangId)?.ten ?? "—",
    },
    {
      title: "Phải trả",
      render: (_: unknown, r: DongDuLieu) => <SoTien value={r.hang.tienKhachPhaiTra} />,
    },
    {
      title: "Đã thu",
      render: (_: unknown, r: DongDuLieu) => (
        <SoTien value={tinhDaThuHang(r.hang)} mau="#1B7A43" />
      ),
    },
    {
      title: "Còn nợ",
      render: (_: unknown, r: DongDuLieu) => {
        const con = tinhConPhaiThuHang(r.hang);
        return <SoTien value={con} mau={con > 0 ? "#C0392B" : "#1B7A43"} />;
      },
    },
    {
      title: "Trạng thái",
      render: (_: unknown, r: DongDuLieu) => (
        <TrangThaiTag trangThai={tinhTrangThaiThanhToanHang(r.hang)} />
      ),
    },
    {
      title: "",
      render: (_: unknown, r: DongDuLieu) => (
        <Space>
          <Button size="small" icon={<DollarOutlined />} onClick={() => setDangThanhToan(r)}>
            Ghi nhận
          </Button>
          <Link href={`/chuyen/chi-tiet?id=${r.chuyen.id}`}>Xem chuyến</Link>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link href="/cong-no-phai-thu">
          <Button icon={<ArrowLeftOutlined />}>Danh sách công nợ</Button>
        </Link>
      </Space>

      {!isDesktop ? (
        <MobileDauTrangCongNo
          ten={khachHang.hoTen}
          soDienThoai={khachHang.soDienThoai}
          trangThai={congNo?.trangThai}
          kieu="thu"
          tong={[
            { nhan: "Tổng phải thu", value: congNo?.tongPhaiThu ?? 0 },
            { nhan: "Đã thu", value: congNo?.tongDaThu ?? 0, mau: "#1B7A43" },
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
              {khachHang.hoTen}
            </Typography.Title>
            {khachHang.soDienThoai && (
              <Typography.Text type="secondary">SĐT: {khachHang.soDienThoai}</Typography.Text>
            )}
          </Col>
          <Col>{congNo && <TrangThaiTag trangThai={congNo.trangThai} />}</Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={8}>
            <Typography.Text type="secondary">Tổng phải thu</Typography.Text>
            <div>
              <SoTien value={congNo?.tongPhaiThu ?? 0} size={16} />
            </div>
          </Col>
          <Col xs={8}>
            <Typography.Text type="secondary">Đã thu</Typography.Text>
            <div>
              <SoTien value={congNo?.tongDaThu ?? 0} size={16} mau="#1B7A43" />
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
          <div className="mobile-khach-section-title">
            Các chuyến liên quan ({dongDuLieu.length})
          </div>
          <MobileChuyenCongNo
            kieu="thu"
            danhSach={dongDuLieu.map((r) => {
              const chieu = layChieu(r.chuyen, r.loai);
              return {
                id: r.hang.id,
                chuyenId: r.chuyen.id,
                loai: r.loai,
                ngay: r.loai === "ve" ? r.chuyen.ngayVe ?? r.chuyen.ngay : r.chuyen.ngay,
                bienSo: xeMap.get(chieu?.xeId ?? "")?.bienSo ?? "—",
                taiXe: taiXeMap.get(chieu?.taiXeId ?? "")?.hoTen ?? "—",
                loaiHang: loaiHangMap.get(r.hang.loaiHangId)?.ten ?? "—",
                ghiChu: r.hang.ghiChu,
                tongPhaiTra: r.hang.tienKhachPhaiTra,
                daThanhToan: tinhDaThuHang(r.hang),
                conNo: tinhConPhaiThuHang(r.hang),
                trangThai: tinhTrangThaiThanhToanHang(r.hang),
                danhSachThanhToan: r.hang.danhSachThanhToan,
              };
            })}
            onThanhToan={(id) => {
              const dong = dongDuLieu.find((r) => r.hang.id === id);
              if (dong) setDangThanhToan({ chuyen: dong.chuyen, hang: dong.hang });
            }}
            onXoaThanhToan={(chuyenId, hangId, thanhToanId) => {
              xoaThanhToanKhach(chuyenId, hangId, thanhToanId);
              message.success("Đã xóa lần thanh toán.");
            }}
          />
        </div>
      ) : (
        <Card title="Các chuyến liên quan" size="small">
        <div className="scroll-ngang">
          <Table
            rowKey={(r) => r.hang.id}
            dataSource={dongDuLieu}
            columns={cot}
            pagination={false}
            size="small"
            expandable={{
              expandedRowRender: (r: DongDuLieu) => (
                <LichSuThanhToan
                  danhSach={r.hang.danhSachThanhToan}
                  onXoa={(thanhToanId) => {
                    xoaThanhToanKhach(r.chuyen.id, r.hang.id, thanhToanId);
                    message.success("Đã xóa lần thanh toán.");
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
        tieuDe={`Ghi nhận thanh toán - ${khachHang.hoTen}`}
        moTaConLai="Còn phải thu"
        conLai={dangThanhToan ? tinhConPhaiThuHang(dangThanhToan.hang) : 0}
        onDong={() => setDangThanhToan(null)}
        onXacNhan={(soTien, ghiChu, hinhThuc) => {
          if (dangThanhToan) {
            ghiNhanThanhToanKhach(dangThanhToan.chuyen.id, dangThanhToan.hang.id, soTien, ghiChu, hinhThuc);
            message.success("Đã ghi nhận thanh toán.");
          }
        }}
      />
    </div>
  );
}
