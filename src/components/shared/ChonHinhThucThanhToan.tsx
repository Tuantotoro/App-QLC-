"use client";

import React from "react";
import Link from "next/link";
import { Segmented, Select, Typography } from "antd";
import { useData } from "@/store/DataContext";
import { nhanTaiKhoan } from "@/utils/calc";
import type { ThongTinHinhThuc } from "@/types";

/** Mặc định là tiền mặt - giữ nguyên cách ghi nhận trước khi có tài khoản ngân hàng. */
export const HINH_THUC_MAC_DINH: ThongTinHinhThuc = { hinhThuc: "tien_mat" };

/** Hình thức hợp lệ: tiền mặt, hoặc chuyển khoản kèm một tài khoản đang được sử dụng. */
export function hinhThucHopLe(
  v: ThongTinHinhThuc,
  taiKhoanDangDung: { id: string }[]
): boolean {
  if (v.hinhThuc === "tien_mat") return true;
  return !!v.taiKhoanId && taiKhoanDangDung.some((t) => t.id === v.taiKhoanId);
}

interface Props {
  value: ThongTinHinhThuc;
  onChange: (v: ThongTinHinhThuc) => void;
  /** "thu": tiền khách trả vào tài khoản. "tra": tiền trả cho người bốc hàng từ tài khoản. */
  huong: "thu" | "tra";
  /** Bố cục gọn (dùng trong dòng hàng của form chuyến). */
  gon?: boolean;
}

/**
 * Chọn tiền được thu/trả bằng tiền mặt hay chuyển khoản; nếu chuyển khoản thì
 * bắt buộc chọn tài khoản ngân hàng (chỉ liệt kê tài khoản đang sử dụng).
 */
export default function ChonHinhThucThanhToan({ value, onChange, huong, gon }: Props) {
  const { data } = useData();
  const dangDung = data.taiKhoanNganHangList.filter((t) => t.dangHoatDong);
  const taiKhoanHopLe = dangDung.some((t) => t.id === value.taiKhoanId);

  function doiHinhThuc(v: string | number) {
    if (v === "tien_mat") {
      onChange({ hinhThuc: "tien_mat" });
      return;
    }
    // Chuyển sang chuyển khoản: giữ tài khoản đã chọn trước đó, nếu chỉ có 1 tài khoản thì tự chọn luôn.
    onChange({
      hinhThuc: "chuyen_khoan",
      taiKhoanId: taiKhoanHopLe ? value.taiKhoanId : dangDung.length === 1 ? dangDung[0].id : undefined,
    });
  }

  const nhanTaiKhoanChon = huong === "thu" ? "Tài khoản nhận tiền" : "Tài khoản trả tiền";

  return (
    <div className={gon ? "chon-hinh-thuc gon" : "chon-hinh-thuc"}>
      <Segmented
        block
        value={value.hinhThuc}
        onChange={doiHinhThuc}
        options={[
          { label: "Tiền mặt", value: "tien_mat" },
          { label: "Chuyển khoản", value: "chuyen_khoan" },
        ]}
      />

      {value.hinhThuc === "chuyen_khoan" &&
        (dangDung.length === 0 ? (
          <Typography.Text type="warning" style={{ display: "block", marginTop: 8, fontSize: 13 }}>
            Chưa có tài khoản ngân hàng nào đang sử dụng.{" "}
            <Link href="/tai-khoan-ngan-hang">Thêm tài khoản</Link>
          </Typography.Text>
        ) : (
          <div style={{ marginTop: 8 }}>
            {!gon && (
              <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
                {nhanTaiKhoanChon}
              </Typography.Text>
            )}
            <Select
              style={{ width: "100%" }}
              placeholder={`Chọn ${nhanTaiKhoanChon.toLowerCase()}`}
              value={taiKhoanHopLe ? value.taiKhoanId : undefined}
              onChange={(id) => onChange({ hinhThuc: "chuyen_khoan", taiKhoanId: id })}
              options={dangDung.map((t) => ({
                value: t.id,
                label: `${nhanTaiKhoan(t)} · ${t.chuTaiKhoan}`,
              }))}
            />
          </div>
        ))}
    </div>
  );
}
