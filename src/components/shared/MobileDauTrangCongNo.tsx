"use client";

import React from "react";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import type { TrangThaiThanhToan } from "@/types";

interface Props {
  ten: string;
  soDienThoai?: string;
  trangThai?: TrangThaiThanhToan;
  kieu: "thu" | "tra";
  /** 3 số tổng kết hiển thị ngang: [tổng phải thu/trả, đã thu/trả, còn nợ]. */
  tong: { nhan: string; value: number; mau?: string }[];
}

/** Đầu trang chi tiết công nợ (khách / người bốc hàng) gọn cho điện thoại. */
export default function MobileDauTrangCongNo({ ten, soDienThoai, trangThai, kieu, tong }: Props) {
  return (
    <div className="mobile-khach-header">
      <div className="mobile-khach-header-top">
        <div className={`mobile-debt-avatar${kieu === "tra" ? " tra" : ""}`}>
          {ten.charAt(0).toUpperCase()}
        </div>
        <div className="mobile-khach-header-info">
          <div className="mobile-khach-header-name">{ten}</div>
          {soDienThoai && <div className="mobile-khach-header-phone">SĐT: {soDienThoai}</div>}
        </div>
        {trangThai && <TrangThaiTag trangThai={trangThai} kieu={kieu} />}
      </div>
      <div className="mobile-khach-header-tong">
        {tong.map((t) => (
          <div key={t.nhan}>
            <div className="mobile-trip-card-metric-label">{t.nhan}</div>
            <div className="mobile-trip-card-metric-value">
              <SoTien value={t.value} size={13.5} mau={t.mau} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
