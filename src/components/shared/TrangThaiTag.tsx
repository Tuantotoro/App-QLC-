import React from "react";
import { Tag } from "antd";
import type { TrangThaiThanhToan } from "@/types";

const CAU_HINH: Record<TrangThaiThanhToan, { label: string; className: string }> = {
  chua_thu: { label: "Chưa thu", className: "the-trang-thai-chua-thu" },
  mot_phan: { label: "Thu một phần", className: "the-trang-thai-mot-phan" },
  da_thu_du: { label: "Đã thu đủ", className: "the-trang-thai-da-thu-du" },
};

/** Nhãn text tùy biến khi ngữ cảnh là "trả" thay vì "thu" (công nợ phải trả). */
const CAU_HINH_TRA: Record<TrangThaiThanhToan, { label: string; className: string }> = {
  chua_thu: { label: "Chưa trả", className: "the-trang-thai-chua-thu" },
  mot_phan: { label: "Trả một phần", className: "the-trang-thai-mot-phan" },
  da_thu_du: { label: "Đã trả đủ", className: "the-trang-thai-da-thu-du" },
};

export default function TrangThaiTag({
  trangThai,
  kieu = "thu",
}: {
  trangThai: TrangThaiThanhToan;
  kieu?: "thu" | "tra";
}) {
  const cfg = (kieu === "tra" ? CAU_HINH_TRA : CAU_HINH)[trangThai];
  return (
    <Tag className={cfg.className} style={{ borderRadius: 999, fontWeight: 600, margin: 0 }}>
      {cfg.label}
    </Tag>
  );
}
