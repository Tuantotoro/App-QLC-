"use client";

import React from "react";
import { useData } from "@/store/DataContext";
import DanhMucCrud, { GiaTriForm } from "@/components/shared/DanhMucCrud";
import { layCacChieuCuaChuyen } from "@/utils/calc";
import type { LoaiHang } from "@/types";

export default function HangHoaPage() {
  const { data, themLoaiHang, capNhatLoaiHang, xoaLoaiHang } = useData();

  function demSuDung(id: string) {
    return data.chuyenList.filter((c) =>
      layCacChieuCuaChuyen(c).some((ch) => ch.duLieu.danhSachHang.some((h) => h.loaiHangId === id))
    ).length;
  }

  return (
    <DanhMucCrud<LoaiHang>
      tieuDe="Hàng hóa"
      moTa="Danh mục các loại hàng thường vận chuyển"
      duLieu={data.loaiHangList}
      nhanThem="Thêm loại hàng"
      truongForm={[
        { key: "ten", label: "Tên loại hàng", required: true },
        { key: "ghiChu", label: "Ghi chú", type: "textarea" },
      ]}
      cotHienThi={[
        { title: "Tên loại hàng", dataIndex: "ten" },
        { title: "Ghi chú", dataIndex: "ghiChu", render: (v) => v || "—" },
      ]}
      onThem={(v: GiaTriForm) =>
        themLoaiHang({ ten: (v.ten as string) ?? "", ghiChu: v.ghiChu as string | undefined })
      }
      onSua={(id, v) => capNhatLoaiHang(id, v as Partial<LoaiHang>)}
      onXoa={xoaLoaiHang}
      demSuDung={demSuDung}
    />
  );
}
