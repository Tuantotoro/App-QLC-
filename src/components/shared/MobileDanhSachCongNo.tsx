"use client";

import React from "react";
import { Input, Empty, Segmented } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import type { TrangThaiThanhToan } from "@/types";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";

export interface MucCongNo {
  id: string;
  ten: string;
  soChuyenLienQuan: number;
  tongChinh: number; // Tổng phải thu hoặc tổng phải trả
  tongConNo: number;
  trangThai: TrangThaiThanhToan;
}

interface Props {
  danhSach: MucCongNo[];
  kieu: "thu" | "tra";
  hrefPrefix: string; // VD: "/cong-no-phai-thu/chi-tiet?id="
  nhanTongChinh: string; // VD: "Phải thu" | "Phải trả"
  placeholderTimKiem: string;
  tuKhoa: string;
  onChangeTuKhoa: (v: string) => void;
  chiHienConNo: boolean;
  onChangeChiHienConNo: (v: boolean) => void;
}

export default function MobileDanhSachCongNo({
  danhSach,
  kieu,
  hrefPrefix,
  nhanTongChinh,
  placeholderTimKiem,
  tuKhoa,
  onChangeTuKhoa,
  chiHienConNo,
  onChangeChiHienConNo,
}: Props) {
  return (
    <div>
      <div className="mobile-congno-toolbar">
        <Input
          placeholder={placeholderTimKiem}
          prefix={<SearchOutlined style={{ color: "#8a8672" }} />}
          value={tuKhoa}
          onChange={(e) => onChangeTuKhoa(e.target.value)}
          allowClear
          style={{ borderRadius: 10 }}
        />
        <Segmented
          block
          value={chiHienConNo ? "con-no" : "tat-ca"}
          onChange={(v) => onChangeChiHienConNo(v === "con-no")}
          options={[
            { label: "Tất cả", value: "tat-ca" },
            { label: "Còn nợ", value: "con-no" },
          ]}
        />
      </div>

      {danhSach.length === 0 ? (
        <Empty description="Không có dữ liệu công nợ" style={{ margin: "32px 0" }} />
      ) : (
        <div className="mobile-congno-list">
          {danhSach.map((d) => (
            <Link key={d.id} href={`${hrefPrefix}${d.id}`}>
              <div className="mobile-debt-card">
                <div className={`mobile-debt-avatar${kieu === "tra" ? " tra" : ""}`}>
                  {d.ten.charAt(0).toUpperCase()}
                </div>
                <div className="mobile-debt-body">
                  <div className="mobile-debt-name-row">
                    <div className="mobile-debt-name">{d.ten}</div>
                    <TrangThaiTag trangThai={d.trangThai} kieu={kieu} />
                  </div>
                  <div className="mobile-debt-sub">{d.soChuyenLienQuan} chuyến liên quan</div>
                  <div className="mobile-debt-amounts">
                    <div>
                      <div className="mobile-debt-amount-label">{nhanTongChinh}</div>
                      <div className="mobile-debt-amount-value">
                        <SoTien value={d.tongChinh} size={13} />
                      </div>
                    </div>
                    <div>
                      <div className="mobile-debt-amount-label">Còn nợ</div>
                      <div className="mobile-debt-amount-value">
                        <SoTien
                          value={d.tongConNo}
                          mau={d.tongConNo > 0 ? "#C0392B" : "#1B7A43"}
                          size={13}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
