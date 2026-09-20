"use client";

import React from "react";
import { PlusOutlined } from "@ant-design/icons";

/** Một chỉ số nhỏ nằm ở phần dưới của thẻ. */
export interface ChiSoThe {
  nhan: string;
  giaTri: React.ReactNode;
  /** Dòng chữ nhỏ bên dưới giá trị (VD: tên khách nợ nhiều nhất). */
  phu?: string;
  /** Màu nhấn: "canh-bao" (vàng) hoặc "nguy-hiem" (đỏ nhạt) - chỉ dùng khi thật sự cần chú ý. */
  tone?: "canh-bao" | "nguy-hiem";
}

/** Nội dung riêng của từng mục (tiêu đề và nút thêm do nơi dùng thẻ truyền vào). */
export interface CauHinhTheDau {
  phuDe?: string;
  /** Nhãn của số lớn (VD: "Còn phải thu"). */
  nhanChinh: string;
  giaTriChinh: React.ReactNode;
  donVi?: string;
  /** Thanh tiến độ (VD: đã thu / tổng phải thu). */
  tienDo?: { phanTram: number; trai: string; phai: string };
  /** Tối đa 4 chỉ số, xếp lưới 2 cột. Số lẻ thì chỉ số cuối chiếm cả hàng. */
  chiSo?: ChiSoThe[];
}

interface Props extends CauHinhTheDau {
  tieuDe: string;
  /** Nút "+ Thêm" ở góc phải thẻ. */
  hanhDong?: { nhan: string; onClick: () => void };
  /** Phần dưới cùng của thẻ (ô tìm kiếm, nút lọc...). */
  children?: React.ReactNode;
}

/**
 * Thẻ đầu trang cho giao diện điện thoại - cùng kiểu thẻ "Tổng quan":
 * tiêu đề, một số lớn, (thanh tiến độ), các chỉ số chi tiết và ô tìm kiếm.
 */
export default function MobileTheDauTrang({
  tieuDe,
  phuDe,
  hanhDong,
  nhanChinh,
  giaTriChinh,
  donVi,
  tienDo,
  chiSo,
  children,
}: Props) {
  return (
    <div className="mobile-hero-card mobile-the-dau">
      <div className="mobile-hero-top">
        <div style={{ minWidth: 0 }}>
          <div className="mobile-hero-title">{tieuDe}</div>
          {phuDe && <div className="mobile-hero-subtitle">{phuDe}</div>}
        </div>
        {hanhDong && (
          <button type="button" className="mobile-hero-filter" onClick={hanhDong.onClick}>
            <PlusOutlined />
            <span>{hanhDong.nhan}</span>
          </button>
        )}
      </div>

      <div className="mobile-hero-label">{nhanChinh}</div>
      <div className="mobile-hero-value">
        {giaTriChinh}
        {donVi && <span className="mobile-the-dau-donvi">{donVi}</span>}
      </div>

      {tienDo && (
        <>
          <div className="mobile-hero-bar-track">
            <div
              className="mobile-hero-bar-fill"
              style={{ width: `${Math.max(0, Math.min(100, tienDo.phanTram))}%` }}
            />
          </div>
          <div className="mobile-hero-caption">
            <span>{tienDo.trai}</span>
            <span>{tienDo.phai}</span>
          </div>
        </>
      )}

      {chiSo && chiSo.length > 0 && (
        <div className="mobile-the-chi-so">
          {chiSo.map((c) => (
            <div key={c.nhan}>
              <div className="mobile-the-chi-so-nhan">{c.nhan}</div>
              <div className={`mobile-the-chi-so-gia-tri${c.tone ? ` ${c.tone}` : ""}`}>{c.giaTri}</div>
              {c.phu && <div className="mobile-the-chi-so-phu">{c.phu}</div>}
            </div>
          ))}
        </div>
      )}

      {children && <div className="mobile-the-dau-duoi">{children}</div>}
    </div>
  );
}
