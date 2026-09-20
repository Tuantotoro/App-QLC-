"use client";

import React from "react";
import { Tag } from "antd";
import { useData } from "@/store/DataContext";
import DanhMucCrud, { GiaTriForm } from "@/components/shared/DanhMucCrud";
import { layCacChieuCuaChuyen } from "@/utils/calc";
import type { TaiXe } from "@/types";

export default function TaiXePage() {
  const { data, themTaiXe, capNhatTaiXe, xoaTaiXe } = useData();

  function demSuDung(id: string) {
    return data.chuyenList.filter((c) =>
      layCacChieuCuaChuyen(c).some((ch) => ch.duLieu.taiXeId === id)
    ).length;
  }

  return (
    <DanhMucCrud<TaiXe>
      tieuDe="Tài xế"
      moTa="Danh sách tài xế phụ trách các chuyến xe"
      duLieu={data.taiXeList}
      nhanThem="Thêm tài xế"
      truongForm={[
        { key: "hoTen", label: "Họ tên", required: true },
        { key: "soDienThoai", label: "Số điện thoại" },
        { key: "ghiChu", label: "Ghi chú", type: "textarea" },
        { key: "dangHoatDong", label: "Đang hoạt động", type: "switch" },
      ]}
      cotHienThi={[
        { title: "Họ tên", dataIndex: "hoTen" },
        { title: "Số điện thoại", dataIndex: "soDienThoai", render: (v) => v || "—" },
        {
          title: "Trạng thái",
          dataIndex: "dangHoatDong",
          render: (v) => (v ? <Tag color="green">Đang hoạt động</Tag> : <Tag>Ngừng hoạt động</Tag>),
        },
      ]}
      onThem={(v: GiaTriForm) =>
        themTaiXe({
          hoTen: (v.hoTen as string) ?? "",
          soDienThoai: v.soDienThoai as string | undefined,
          ghiChu: v.ghiChu as string | undefined,
          dangHoatDong: (v.dangHoatDong as boolean) ?? true,
        })
      }
      onSua={(id, v) => capNhatTaiXe(id, v as Partial<TaiXe>)}
      onXoa={xoaTaiXe}
      demSuDung={demSuDung}
    />
  );
}
