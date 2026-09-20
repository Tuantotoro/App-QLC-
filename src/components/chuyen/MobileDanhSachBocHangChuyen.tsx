"use client";

import React, { useState } from "react";
import { Button, Empty } from "antd";
import { DollarOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { tinhDaTraCongNoBocHang, tinhConNoCongNoBocHang, tinhTrangThaiCongNoBocHang } from "@/utils/calc";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import LichSuThanhToan from "@/components/shared/LichSuThanhToan";
import type { CongNoBocHang, NguoiBocHang } from "@/types";

interface Props {
  danhSach: CongNoBocHang[];
  nguoiBocHangMap: Map<string, NguoiBocHang>;
  onTraTien: (congNo: CongNoBocHang) => void;
  onXoaThanhToan: (congNoId: string, thanhToanId: string) => void;
}

/**
 * Danh sách công nợ người bốc hàng dạng thẻ dọc, gọn cho màn hình điện thoại -
 * cùng kiểu với MobileDanhSachHangChuyen để đồng bộ giao diện.
 */
export default function MobileDanhSachBocHangChuyen({
  danhSach,
  nguoiBocHangMap,
  onTraTien,
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

  if (danhSach.length === 0) {
    return <Empty description="Chưa có công nợ bốc hàng nào" style={{ margin: "16px 0" }} />;
  }

  return (
    <div className="mobile-hang-list">
      {danhSach.map((cn) => {
        const conNo = tinhConNoCongNoBocHang(cn);
        const daTra = tinhDaTraCongNoBocHang(cn);
        const daMoRong = moRong.has(cn.id);
        return (
          <div key={cn.id} className="mobile-hang-card">
            <div className="mobile-hang-card-top">
              <div className="mobile-hang-card-khach">
                {nguoiBocHangMap.get(cn.nguoiBocHangId)?.hoTen ?? "—"}
              </div>
              <TrangThaiTag trangThai={tinhTrangThaiCongNoBocHang(cn)} kieu="tra" />
            </div>
            {cn.ghiChu && <div className="mobile-hang-card-sub">{cn.ghiChu}</div>}

            <div className="mobile-hang-card-divider" />

            <div className="mobile-hang-card-amounts">
              <div>
                <div className="mobile-hang-card-amount-label">Phải trả</div>
                <div className="mobile-hang-card-amount-value">
                  <SoTien value={cn.soTienPhaiTra} size={13} />
                </div>
              </div>
              <div>
                <div className="mobile-hang-card-amount-label">Đã trả</div>
                <div className="mobile-hang-card-amount-value">
                  <SoTien value={daTra} mau="#1B7A43" size={13} />
                </div>
              </div>
              <div>
                <div className="mobile-hang-card-amount-label">Còn nợ</div>
                <div className="mobile-hang-card-amount-value">
                  <SoTien value={conNo} mau={conNo > 0 ? "#C0392B" : "#1B7A43"} size={13} />
                </div>
              </div>
            </div>

            <div className="mobile-hang-card-actions">
              <Button size="small" onClick={() => toggleMoRong(cn.id)}>
                Lịch sử ({cn.danhSachThanhToan.length}) {daMoRong ? <UpOutlined /> : <DownOutlined />}
              </Button>
              <Button size="small" type="primary" icon={<DollarOutlined />} onClick={() => onTraTien(cn)}>
                Trả tiền
              </Button>
            </div>

            {daMoRong && (
              <div className="mobile-hang-card-lichsu">
                <LichSuThanhToan
                  danhSach={cn.danhSachThanhToan}
                  onXoa={(thanhToanId) => onXoaThanhToan(cn.id, thanhToanId)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
