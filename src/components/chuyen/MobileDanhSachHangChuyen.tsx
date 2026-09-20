"use client";

import React, { useState } from "react";
import { Button, Empty } from "antd";
import { DollarOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import {
  tinhDaThuHang,
  tinhConPhaiThuHang,
  tinhTrangThaiThanhToanHang,
  formatTien,
  formatSoLuong,
} from "@/utils/calc";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import LichSuThanhToan from "@/components/shared/LichSuThanhToan";
import type { HangTrenChuyen, KhachHang, LoaiHang } from "@/types";

interface Props {
  danhSachHang: HangTrenChuyen[];
  khachHangMap: Map<string, KhachHang>;
  loaiHangMap: Map<string, LoaiHang>;
  onGhiNhan: (hang: HangTrenChuyen) => void;
  onXoaThanhToan: (hangId: string, thanhToanId: string) => void;
}

/**
 * Danh sách hàng trên xe dạng thẻ dọc, gọn cho màn hình điện thoại -
 * thay cho bảng Table nhiều cột phải cuộn ngang.
 */
export default function MobileDanhSachHangChuyen({
  danhSachHang,
  khachHangMap,
  loaiHangMap,
  onGhiNhan,
  onXoaThanhToan,
}: Props) {
  const [moRong, setMoRong] = useState<Set<string>>(new Set());

  function toggleMoRong(id: string) {
    setMoRong((cu) => {
      const moi = new Set(cu);
      if (moi.has(id)) moi.delete(id);
      else moi.add(id);
      return moi;
    });
  }

  if (danhSachHang.length === 0) {
    return <Empty description="Chưa có hàng nào" style={{ margin: "16px 0" }} />;
  }

  return (
    <div className="mobile-hang-list">
      {danhSachHang.map((h) => {
        const conPhaiThu = tinhConPhaiThuHang(h);
        const daThu = tinhDaThuHang(h);
        const daMoRong = moRong.has(h.id);
        return (
          <div key={h.id} className="mobile-hang-card">
            <div className="mobile-hang-card-top">
              <div className="mobile-hang-card-khach">
                {khachHangMap.get(h.khachHangId)?.hoTen ?? "—"}
              </div>
              <TrangThaiTag trangThai={tinhTrangThaiThanhToanHang(h)} />
            </div>
            <div className="mobile-hang-card-sub">
              {loaiHangMap.get(h.loaiHangId)?.ten ?? "—"} · {formatSoLuong(h.soLuong)} {h.donVi}
              {" · "}Giá trị hàng: {formatTien(h.giaTriHang)}
            </div>

            <div className="mobile-hang-card-divider" />

            <div className="mobile-hang-card-amounts">
              <div>
                <div className="mobile-hang-card-amount-label">Phải thu</div>
                <div className="mobile-hang-card-amount-value">
                  <SoTien value={h.tienKhachPhaiTra} size={13} />
                </div>
              </div>
              <div>
                <div className="mobile-hang-card-amount-label">Đã thu</div>
                <div className="mobile-hang-card-amount-value">
                  <SoTien value={daThu} mau="#1B7A43" size={13} />
                </div>
              </div>
              <div>
                <div className="mobile-hang-card-amount-label">Còn lại</div>
                <div className="mobile-hang-card-amount-value">
                  <SoTien value={conPhaiThu} mau={conPhaiThu > 0 ? "#C0392B" : "#1B7A43"} size={13} />
                </div>
              </div>
            </div>

            {h.ghiChu && <div className="mobile-hang-card-ghichu">Ghi chú: {h.ghiChu}</div>}

            <div className="mobile-hang-card-actions">
              <Button size="small" onClick={() => toggleMoRong(h.id)}>
                Lịch sử ({h.danhSachThanhToan.length}) {daMoRong ? <UpOutlined /> : <DownOutlined />}
              </Button>
              <Button size="small" type="primary" icon={<DollarOutlined />} onClick={() => onGhiNhan(h)}>
                Ghi nhận
              </Button>
            </div>

            {daMoRong && (
              <div className="mobile-hang-card-lichsu">
                <LichSuThanhToan
                  danhSach={h.danhSachThanhToan}
                  onXoa={(thanhToanId) => onXoaThanhToan(h.id, thanhToanId)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
