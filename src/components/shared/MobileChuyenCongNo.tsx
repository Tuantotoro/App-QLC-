"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Empty } from "antd";
import { CarOutlined, DollarOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { formatNgay } from "@/utils/calc";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import LichSuThanhToan from "@/components/shared/LichSuThanhToan";
import type {
  LanThanhToanKhach,
  LanThanhToanNguoiBoc,
  LoaiChieu,
  TrangThaiThanhToan,
} from "@/types";

/**
 * Một dòng công nợ trên một chiều của một chuyến, đã chuẩn hóa để dùng chung cho
 * công nợ phải thu (theo khách) và công nợ phải trả (theo người bốc hàng).
 */
export interface DongChuyenCongNo {
  /** id của dòng hàng (phải thu) hoặc khoản công nợ bốc hàng (phải trả). */
  id: string;
  chuyenId: string;
  loai: LoaiChieu;
  ngay: string;
  bienSo: string;
  taiXe: string;
  /** Chỉ có ở công nợ phải thu. */
  loaiHang?: string;
  ghiChu?: string;
  tongPhaiTra: number;
  daThanhToan: number;
  conNo: number;
  trangThai: TrangThaiThanhToan;
  danhSachThanhToan: (LanThanhToanKhach | LanThanhToanNguoiBoc)[];
}

interface Props {
  /** "thu": khách trả cho mình. "tra": mình trả cho người bốc hàng. */
  kieu: "thu" | "tra";
  danhSach: DongChuyenCongNo[];
  onThanhToan: (id: string) => void;
  onXoaThanhToan: (chuyenId: string, id: string, thanhToanId: string) => void;
}

/**
 * Danh sách chuyến liên quan của một khách / một người bốc hàng dạng thẻ dọc cho điện thoại -
 * thay cho bảng nhiều cột phải kéo ngang. Màu viền trái cho biết đã thanh toán đủ hay còn nợ.
 */
export default function MobileChuyenCongNo({ kieu, danhSach, onThanhToan, onXoaThanhToan }: Props) {
  const [moRong, setMoRong] = useState<Set<string>>(new Set());

  function toggleMoRong(id: string) {
    setMoRong((cu) => {
      const moi = new Set(cu);
      if (moi.has(id)) moi.delete(id);
      else moi.add(id);
      return moi;
    });
  }

  if (danhSach.length === 0) {
    return <Empty description="Chưa có chuyến nào" style={{ margin: "16px 0" }} />;
  }

  const nhanDaThanhToan = kieu === "thu" ? "Đã thu" : "Đã trả";
  const nhanNut = kieu === "thu" ? "Ghi nhận" : "Trả tiền";

  return (
    <div className="mobile-khach-chuyen-list">
      {danhSach.map((d) => {
        const daMoRong = moRong.has(d.id);
        const lopMau =
          d.trangThai === "da_thu_du"
            ? "card-da-thu-du"
            : d.trangThai === "mot_phan"
            ? "card-mot-phan"
            : "card-chua-thu";

        return (
          <div key={d.id} className={`mobile-trip-card mobile-khach-chuyen-card ${lopMau}`}>
            <div className="mobile-trip-card-top">
              <div className="mobile-trip-card-plate">
                <CarOutlined />
                <span className="mobile-khach-chuyen-bienso">{d.bienSo}</span>
              </div>
              <TrangThaiTag trangThai={d.trangThai} kieu={kieu} />
            </div>

            <div className="mobile-khach-chuyen-meta">
              <span>{formatNgay(d.ngay)}</span>
              <span className="mobile-khach-chuyen-chieu">
                {d.loai === "ve" ? "Chiều về" : "Chiều đi"}
              </span>
              <span>{d.taiXe}</span>
            </div>
            {d.loaiHang && (
              <div className="mobile-khach-chuyen-hang">
                Loại hàng: <strong>{d.loaiHang}</strong>
              </div>
            )}
            {d.ghiChu && <div className="mobile-khach-chuyen-ghichu">Ghi chú: {d.ghiChu}</div>}

            <div className="mobile-trip-card-divider" />

            <div className="mobile-khach-chuyen-amounts">
              <div>
                <div className="mobile-trip-card-metric-label">Phải trả</div>
                <div className="mobile-trip-card-metric-value">
                  <SoTien value={d.tongPhaiTra} size={13} />
                </div>
              </div>
              <div>
                <div className="mobile-trip-card-metric-label">{nhanDaThanhToan}</div>
                <div className="mobile-trip-card-metric-value">
                  <SoTien value={d.daThanhToan} mau="#1B7A43" size={13} />
                </div>
              </div>
              <div>
                <div className="mobile-trip-card-metric-label">Còn nợ</div>
                <div className="mobile-trip-card-metric-value">
                  <SoTien value={d.conNo} mau={d.conNo > 0 ? "#C0392B" : "#1B7A43"} size={13} />
                </div>
              </div>
            </div>

            <div className="mobile-khach-chuyen-actions">
              <Link href={`/chuyen/chi-tiet?id=${d.chuyenId}`}>
                <Button block>Xem chuyến</Button>
              </Link>
              <Button type="primary" block icon={<DollarOutlined />} onClick={() => onThanhToan(d.id)}>
                {nhanNut}
              </Button>
            </div>
            <Button
              type="text"
              block
              className="mobile-khach-chuyen-lichsu-btn"
              onClick={() => toggleMoRong(d.id)}
            >
              Lịch sử thanh toán ({d.danhSachThanhToan.length}){" "}
              {daMoRong ? <UpOutlined /> : <DownOutlined />}
            </Button>

            {daMoRong && (
              <div className="mobile-hang-card-lichsu">
                <LichSuThanhToan
                  danhSach={d.danhSachThanhToan}
                  onXoa={(thanhToanId) => onXoaThanhToan(d.chuyenId, d.id, thanhToanId)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
