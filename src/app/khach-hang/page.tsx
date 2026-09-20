"use client";

import React, { useMemo } from "react";
import { useData } from "@/store/DataContext";
import DanhMucCrud, { GiaTriForm } from "@/components/shared/DanhMucCrud";
import type { CauHinhTheDau } from "@/components/shared/MobileTheDauTrang";
import { tongHopCongNoKhachHang } from "@/utils/aggregate";
import { formatTien, layCacChieuCuaChuyen } from "@/utils/calc";
import type { KhachHang } from "@/types";

export default function KhachHangPage() {
  const { data, themKhachHang, capNhatKhachHang, xoaKhachHang } = useData();

  // Thẻ đầu trang (điện thoại): số khách -> khách đã có chuyến/còn nợ -> tiền đã thu/còn phải thu
  const theDauMobile = useMemo<CauHinhTheDau>(() => {
    const idTrongDanhSach = new Set(data.khachHangList.map((k) => k.id));
    const congNo = tongHopCongNoKhachHang(data).filter((c) => idTrongDanhSach.has(c.khachHangId));
    const dangConNo = congNo.filter((c) => c.tongConNo > 0).length;
    const daThu = congNo.reduce((s, c) => s + c.tongDaThu, 0);
    const conPhaiThu = congNo.reduce((s, c) => s + c.tongConNo, 0);
    return {
      phuDe: "Khách đặt vận chuyển hàng hóa",
      nhanChinh: "Tổng số khách hàng",
      giaTriChinh: data.khachHangList.length,
      donVi: "khách",
      chiSo: [
        { nhan: "Đã có chuyến", giaTri: congNo.length },
        { nhan: "Đang còn nợ", giaTri: dangConNo },
        { nhan: "Đã thu", giaTri: formatTien(daThu) },
        {
          nhan: "Còn phải thu",
          giaTri: formatTien(conPhaiThu),
          tone: conPhaiThu > 0 ? "nguy-hiem" : undefined,
        },
      ],
    };
  }, [data]);

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
      theDauMobile={theDauMobile}
    />
  );
}
