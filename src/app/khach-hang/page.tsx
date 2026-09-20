"use client";

import React from "react";
import { useData } from "@/store/DataContext";
import DanhMucCrud, { GiaTriForm } from "@/components/shared/DanhMucCrud";
import { layCacChieuCuaChuyen } from "@/utils/calc";
import type { KhachHang } from "@/types";

export default function KhachHangPage() {
  const { data, themKhachHang, capNhatKhachHang, xoaKhachHang } = useData();

  function demSuDung(id: string) {
    return data.chuyenList.filter((c) =>
      layCacChieuCuaChuyen(c).some((ch) => ch.duLieu.danhSachHang.some((h) => h.khachHangId === id))
    ).length;
  }

  return (
    <DanhMucCrud<KhachHang>
      tieuDe="Khách hàng"
      moTa="Danh sách khách hàng đặt vận chuyển hàng hóa"
      duLieu={data.khachHangList}
      nhanThem="Thêm khách hàng"
      truongForm={[
        { key: "hoTen", label: "Họ tên", required: true },
        { key: "soDienThoai", label: "Số điện thoại" },
        { key: "diaChi", label: "Địa chỉ" },
        { key: "ghiChu", label: "Ghi chú", type: "textarea" },
      ]}
      cotHienThi={[
        { title: "Họ tên", dataIndex: "hoTen" },
        { title: "Số điện thoại", dataIndex: "soDienThoai", render: (v) => v || "—" },
        { title: "Địa chỉ", dataIndex: "diaChi", render: (v) => v || "—" },
      ]}
      onThem={(v: GiaTriForm) =>
        themKhachHang({
          hoTen: (v.hoTen as string) ?? "",
          soDienThoai: v.soDienThoai as string | undefined,
          diaChi: v.diaChi as string | undefined,
          ghiChu: v.ghiChu as string | undefined,
        })
      }
      onSua={(id, v) => capNhatKhachHang(id, v as Partial<KhachHang>)}
      onXoa={xoaKhachHang}
      demSuDung={demSuDung}
    />
  );
}
