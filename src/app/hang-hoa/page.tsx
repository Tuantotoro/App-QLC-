"use client";

import React, { useMemo } from "react";
import { useData } from "@/store/DataContext";
import DanhMucCrud, { GiaTriForm } from "@/components/shared/DanhMucCrud";
import { layCacChieuCuaChuyen } from "@/utils/calc";
import type { CauHinhTheDau } from "@/components/shared/MobileTheDauTrang";
import type { LoaiHang } from "@/types";

export default function HangHoaPage() {
  const { data, themLoaiHang, capNhatLoaiHang, xoaLoaiHang } = useData();

  // Thẻ đầu trang (điện thoại): số loại hàng -> đã dùng/chưa dùng -> loại chở nhiều nhất
  const theDauMobile = useMemo<CauHinhTheDau>(() => {
    const soChuyenTheoLoai = new Map<string, number>();
    data.chuyenList.forEach((c) => {
      const cacLoai = new Set<string>();
      layCacChieuCuaChuyen(c).forEach((ch) =>
        ch.duLieu.danhSachHang.forEach((h) => cacLoai.add(h.loaiHangId))
      );
      cacLoai.forEach((id) => soChuyenTheoLoai.set(id, (soChuyenTheoLoai.get(id) ?? 0) + 1));
    });
    const tong = data.loaiHangList.length;
    const daDung = data.loaiHangList.filter((l) => (soChuyenTheoLoai.get(l.id) ?? 0) > 0).length;
    let nhieuNhat: { ten: string; soChuyen: number } | null = null;
    data.loaiHangList.forEach((l) => {
      const n = soChuyenTheoLoai.get(l.id) ?? 0;
      if (n > 0 && (!nhieuNhat || n > nhieuNhat.soChuyen)) nhieuNhat = { ten: l.ten, soChuyen: n };
    });
    const top = nhieuNhat as { ten: string; soChuyen: number } | null;
    return {
      phuDe: "Các loại hàng thường vận chuyển",
      nhanChinh: "Tổng số loại hàng",
      giaTriChinh: tong,
      donVi: "loại",
      chiSo: [
        { nhan: "Đã dùng trong chuyến", giaTri: daDung },
        { nhan: "Chưa dùng", giaTri: tong - daDung },
        {
          nhan: "Chở nhiều nhất",
          giaTri: top ? top.ten : "—",
          phu: top ? `${top.soChuyen} chuyến` : undefined,
        },
      ],
    };
  }, [data]);

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
      theDauMobile={theDauMobile}
    />
  );
}
