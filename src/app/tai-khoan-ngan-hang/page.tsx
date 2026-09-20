"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Badge, Tag } from "antd";
import { useData } from "@/store/DataContext";
import DanhMucCrud, { GiaTriForm } from "@/components/shared/DanhMucCrud";
import SoTien from "@/components/shared/SoTien";
import { tongHopTheoTaiKhoan } from "@/utils/aggregate";
import { SO_NGAY_QUA_HAN_DOI_CHIEU } from "@/utils/constants";
import type { TaiKhoanNganHang } from "@/types";

export default function TaiKhoanNganHangPage() {
  const { data, themTaiKhoanNganHang, capNhatTaiKhoanNganHang, xoaTaiKhoanNganHang } = useData();
  const tongHop = useMemo(() => tongHopTheoTaiKhoan(data), [data]);

  function demSuDung(id: string) {
    return tongHop.get(id)?.soChuyen ?? 0;
  }

  // Tài khoản đã có giao dịch thì không xóa được - xóa sẽ làm lịch sử thu/trả mất thông tin
  // "tiền đã vào/ra tài khoản nào". Muốn ngừng dùng thì tắt "Đang sử dụng".
  function chanXoa(id: string): string | null {
    const n = demSuDung(id);
    return n > 0
      ? `Tài khoản này đã có giao dịch trong ${n} chuyến nên không thể xóa. Hãy sửa và tắt "Đang sử dụng" để ẩn khỏi danh sách chọn.`
      : null;
  }

  return (
    <DanhMucCrud<TaiKhoanNganHang>
      tieuDe="Tài khoản ngân hàng"
      moTa="Tài khoản dùng để nhận tiền từ khách và trả tiền cho người bốc hàng bằng chuyển khoản"
      duLieu={data.taiKhoanNganHangList}
      nhanThem="Thêm tài khoản"
      truongForm={[
        { key: "tenNganHang", label: "Ngân hàng", required: true },
        { key: "soTaiKhoan", label: "Số tài khoản", required: true },
        { key: "chuTaiKhoan", label: "Chủ tài khoản", required: true },
        { key: "ghiChu", label: "Ghi chú", type: "textarea" },
        { key: "dangHoatDong", label: "Đang sử dụng", type: "switch" },
      ]}
      cotHienThi={[
        {
          title: "Ngân hàng",
          dataIndex: "tenNganHang",
          render: (v: string, t) => {
            const quaHan = tongHop.get(t.id)?.soQuaHan ?? 0;
            return (
              <span>
                {v}
                {quaHan > 0 && (
                  <Badge
                    count={`${quaHan} quá hạn`}
                    color="#C0392B"
                    title={`${quaHan} khoản chuyển khoản quá ${SO_NGAY_QUA_HAN_DOI_CHIEU} ngày chưa đối chiếu sao kê`}
                    style={{ marginLeft: 8, fontSize: 11, fontWeight: 600 }}
                  />
                )}
              </span>
            );
          },
        },
        { title: "Số tài khoản", dataIndex: "soTaiKhoan" },
        { title: "Chủ tài khoản", dataIndex: "chuTaiKhoan" },
        {
          title: "Trạng thái",
          dataIndex: "dangHoatDong",
          render: (v) => (v ? <Tag color="green">Đang sử dụng</Tag> : <Tag>Ngừng sử dụng</Tag>),
        },
        {
          title: "Đã nhận (chuyển khoản)",
          key: "da-nhan",
          render: (_, t) => <SoTien value={tongHop.get(t.id)?.daNhan ?? 0} mau="#1B7A43" size={13} />,
        },
        {
          title: "Đã trả (chuyển khoản)",
          key: "da-tra",
          render: (_, t) => <SoTien value={tongHop.get(t.id)?.daTra ?? 0} size={13} />,
        },
        {
          title: "Đối chiếu sao kê",
          key: "doi-chieu",
          render: (_, t) => {
            const th = tongHop.get(t.id);
            const chua = th?.soChuaDoiChieu ?? 0;
            const quaHan = th?.soQuaHan ?? 0;
            const nhan =
              !th || th.soGiaoDich === 0
                ? "Chưa có giao dịch"
                : chua > 0
                ? `${chua} khoản chưa đối chiếu${quaHan > 0 ? ` (${quaHan} quá hạn)` : ""}`
                : "Đã đối chiếu hết";
            return (
              <Link
                href={`/tai-khoan-ngan-hang/doi-chieu?id=${t.id}`}
                style={{
                  color: quaHan > 0 ? "#C0392B" : chua > 0 ? "#C58A00" : undefined,
                  fontWeight: chua > 0 ? 600 : undefined,
                }}
              >
                {nhan}
              </Link>
            );
          },
        },
        { title: "Ghi chú", dataIndex: "ghiChu", render: (v) => v || "—" },
      ]}
      onThem={(v: GiaTriForm) =>
        themTaiKhoanNganHang({
          tenNganHang: ((v.tenNganHang as string) ?? "").trim(),
          soTaiKhoan: ((v.soTaiKhoan as string) ?? "").trim(),
          chuTaiKhoan: ((v.chuTaiKhoan as string) ?? "").trim(),
          ghiChu: v.ghiChu as string | undefined,
          dangHoatDong: (v.dangHoatDong as boolean) ?? true,
        })
      }
      onSua={(id, v) => capNhatTaiKhoanNganHang(id, v as Partial<TaiKhoanNganHang>)}
      onXoa={xoaTaiKhoanNganHang}
      demSuDung={demSuDung}
      chanXoa={chanXoa}
      giaTriMacDinh={{ dangHoatDong: true }}
    />
  );
}
