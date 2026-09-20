"use client";

import React, { useMemo } from "react";
import { useData } from "@/store/DataContext";
import DanhMucCrud, { GiaTriForm } from "@/components/shared/DanhMucCrud";
import type { CauHinhTheDau } from "@/components/shared/MobileTheDauTrang";
import { tongHopCongNoNguoiBocHang } from "@/utils/aggregate";
import { formatTien, layCacChieuCuaChuyen } from "@/utils/calc";
import type { NguoiBocHang } from "@/types";

export default function NguoiBocHangPage() {
  const { data, themNguoiBocHang, capNhatNguoiBocHang, xoaNguoiBocHang } = useData();

  // Thẻ đầu trang (điện thoại): số người bốc -> đã có chuyến/còn nợ -> tiền đã trả/còn phải trả
  const theDauMobile = useMemo<CauHinhTheDau>(() => {
    const idTrongDanhSach = new Set(data.nguoiBocHangList.map((n) => n.id));
    const congNo = tongHopCongNoNguoiBocHang(data).filter((c) =>
      idTrongDanhSach.has(c.nguoiBocHangId)
    );
    const dangConNo = congNo.filter((c) => c.tongConNo > 0).length;
    const daTra = congNo.reduce((s, c) => s + c.tongDaTra, 0);
    const conPhaiTra = congNo.reduce((s, c) => s + c.tongConNo, 0);
    return {
      phuDe: "Người bốc/dỡ hàng cho các chuyến xe",
      nhanChinh: "Tổng số người bốc hàng",
      giaTriChinh: data.nguoiBocHangList.length,
      donVi: "người",
      chiSo: [
        { nhan: "Đã có chuyến", giaTri: congNo.length },
        { nhan: "Đang còn nợ", giaTri: dangConNo },
        { nhan: "Đã trả", giaTri: formatTien(daTra) },
        {
          nhan: "Còn phải trả",
          giaTri: formatTien(conPhaiTra),
          tone: conPhaiTra > 0 ? "nguy-hiem" : undefined,
        },
      ],
    };
  }, [data]);

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
      theDauMobile={theDauMobile}
    />
  );
}
