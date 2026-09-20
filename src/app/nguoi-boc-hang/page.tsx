"use client";

import React from "react";
import { useData } from "@/store/DataContext";
import DanhMucCrud, { GiaTriForm } from "@/components/shared/DanhMucCrud";
import { layCacChieuCuaChuyen } from "@/utils/calc";
import type { NguoiBocHang } from "@/types";

export default function NguoiBocHangPage() {
  const { data, themNguoiBocHang, capNhatNguoiBocHang, xoaNguoiBocHang } = useData();

  function demSuDung(id: string) {
    return data.chuyenList.filter((c) =>
      layCacChieuCuaChuyen(c).some((ch) =>
        ch.duLieu.danhSachCongNoBocHang.some((cn) => cn.nguoiBocHangId === id)
      )
    ).length;
  }

  return (
    <DanhMucCrud<NguoiBocHang>
      tieuDe="Người bốc hàng"
      moTa="Danh sách người bốc/dỡ hàng cho các chuyến xe"
      duLieu={data.nguoiBocHangList}
      nhanThem="Thêm người bốc hàng"
      truongForm={[
        { key: "hoTen", label: "Họ tên", required: true },
        { key: "soDienThoai", label: "Số điện thoại" },
        { key: "ghiChu", label: "Ghi chú", type: "textarea" },
      ]}
      cotHienThi={[
        { title: "Họ tên", dataIndex: "hoTen" },
        { title: "Số điện thoại", dataIndex: "soDienThoai", render: (v) => v || "—" },
        { title: "Ghi chú", dataIndex: "ghiChu", render: (v) => v || "—" },
      ]}
      onThem={(v: GiaTriForm) =>
        themNguoiBocHang({
          hoTen: (v.hoTen as string) ?? "",
          soDienThoai: v.soDienThoai as string | undefined,
          ghiChu: v.ghiChu as string | undefined,
        })
      }
      onSua={(id, v) => capNhatNguoiBocHang(id, v as Partial<NguoiBocHang>)}
      onXoa={xoaNguoiBocHang}
      demSuDung={demSuDung}
    />
  );
}
