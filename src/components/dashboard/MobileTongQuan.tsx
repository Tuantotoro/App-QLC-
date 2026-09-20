"use client";

import React, { useState } from "react";
import { Card, Typography, Empty, Segmented, Tag } from "antd";
import {
  CarOutlined,
  ShoppingOutlined,
  DollarOutlined,
  WalletOutlined,
  RightOutlined,
  CalendarOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import type { Dayjs } from "dayjs";
import type { Chuyen, FilterKhoangThoiGian, KhachHang, NguoiBocHang, TaiXe, Xe } from "@/types";
import ChonThoiGianSheet, {
  nhanBoLocThoiGian,
  type KhoangTuyChon,
} from "@/components/dashboard/ChonThoiGianSheet";
import type { CongNoKhachHang, CongNoNguoiBocHang } from "@/utils/aggregate";
import { layCacChieuCuaChuyen, laChuyenKhuHoi, formatTien, formatNgay } from "@/utils/calc";

interface Props {
  tongHop: {
    tongChuyen: number;
    tongGiaTriHang: number;
    tongPhaiThu: number;
    tongDaThu: number;
    tongConPhaiThu: number;
    tongChiPhi: number;
    tongPhaiTraBoc: number;
    tongConPhaiTraBoc: number;
  };
  chuyenGanDay: Chuyen[];
  congNoKhach: CongNoKhachHang[];
  congNoBoc: CongNoNguoiBocHang[];
  xeMap: Map<string, Xe>;
  taiXeMap: Map<string, TaiXe>;
  khachHangMap: Map<string, KhachHang>;
  nguoiBocHangMap: Map<string, NguoiBocHang>;
  /** Bộ lọc thời gian đang áp dụng cho các số trên thẻ. */
  loaiFilter: FilterKhoangThoiGian;
  tuyChon: KhoangTuyChon;
  onChonMocThoiGian: (loai: FilterKhoangThoiGian) => void;
  onChonKhoangTuyChon: (khoang: [Dayjs, Dayjs]) => void;
}

export default function MobileTongQuan({
  tongHop,
  chuyenGanDay,
  congNoKhach,
  congNoBoc,
  xeMap,
  taiXeMap,
  khachHangMap,
  nguoiBocHangMap,
  loaiFilter,
  tuyChon,
  onChonMocThoiGian,
  onChonKhoangTuyChon,
}: Props) {
  const [tabCongNo, setTabCongNo] = useState<"thu" | "tra">("thu");
  const [moChonThoiGian, setMoChonThoiGian] = useState(false);

  const tyLeDaThu =
    tongHop.tongPhaiThu > 0 ? Math.min(100, Math.round((tongHop.tongDaThu / tongHop.tongPhaiThu) * 100)) : 0;

  const danhSachCongNoDangHien = tabCongNo === "thu" ? congNoKhach : congNoBoc;

  return (
    <div>
      {/* Hero: số tiền còn phải thu - chỉ số quan trọng nhất khi liếc nhanh trên điện thoại */}
      <div className="mobile-hero-card">
        {/* Hàng đầu thẻ: "Tổng quan" bên trái, bộ lọc thời gian bên phải */}
        <div className="mobile-hero-top">
          <div>
            <div className="mobile-hero-title">Tổng quan</div>
            <div className="mobile-hero-subtitle">{tongHop.tongChuyen} chuyến trong kỳ</div>
          </div>
          <button
            type="button"
            className="mobile-hero-filter"
            onClick={() => setMoChonThoiGian(true)}
            aria-label="Đổi khoảng thời gian"
          >
            <CalendarOutlined />
            <span>{nhanBoLocThoiGian(loaiFilter, tuyChon)}</span>
            <DownOutlined style={{ fontSize: 10 }} />
          </button>
        </div>
        <div className="mobile-hero-label">Còn phải thu</div>
        <div className="mobile-hero-value">{formatTien(tongHop.tongConPhaiThu)}</div>
        <div className="mobile-hero-bar-track">
          <div className="mobile-hero-bar-fill" style={{ width: `${tyLeDaThu}%` }} />
        </div>
        <div className="mobile-hero-caption">
          <span>Đã thu {formatTien(tongHop.tongDaThu)}</span>
          <span>Tổng {formatTien(tongHop.tongPhaiThu)}</span>
        </div>
      </div>

      {/* Dải chỉ số phụ - lưới 2x2 cố định, không vuốt ngang */}
      <div className="mobile-stat-scroll">
        <div className="mobile-stat-chip">
          <div className="mobile-stat-chip-label">
            <ShoppingOutlined /> Giá trị hàng
          </div>
          <div className="mobile-stat-chip-value">{formatTien(tongHop.tongGiaTriHang)}</div>
        </div>
        <div className="mobile-stat-chip">
          <div className="mobile-stat-chip-label">
            <DollarOutlined /> Chi phí
          </div>
          <div className="mobile-stat-chip-value" style={{ color: "#C58A00" }}>
            {formatTien(tongHop.tongChiPhi)}
          </div>
        </div>
        <div className="mobile-stat-chip">
          <div className="mobile-stat-chip-label">
            <WalletOutlined /> Phải trả bốc hàng
          </div>
          <div className="mobile-stat-chip-value">{formatTien(tongHop.tongPhaiTraBoc)}</div>
        </div>
        <div className="mobile-stat-chip">
          <div className="mobile-stat-chip-label">Còn phải trả</div>
          <div
            className="mobile-stat-chip-value"
            style={{ color: tongHop.tongConPhaiTraBoc > 0 ? "#C0392B" : "#1B7A43" }}
          >
            {formatTien(tongHop.tongConPhaiTraBoc)}
          </div>
        </div>
      </div>

      {/* Chuyến gần đây */}
      <Card
        title="Chuyến gần đây"
        size="small"
        style={{ marginTop: 16 }}
        styles={{ body: { padding: "4px 12px" } }}
        extra={
          <Link href="/chuyen" style={{ fontSize: 13 }}>
            Xem tất cả
          </Link>
        }
      >
        {chuyenGanDay.length === 0 ? (
          <Empty description="Chưa có chuyến nào" style={{ margin: "16px 0" }} />
        ) : (
          chuyenGanDay.map((c) => {
            const soHang = layCacChieuCuaChuyen(c).reduce((s, ch) => s + ch.duLieu.danhSachHang.length, 0);
            return (
              <Link key={c.id} href={`/chuyen/chi-tiet?id=${c.id}`}>
                <div className="mobile-list-row">
                  <div className="mobile-list-row-icon">
                    <CarOutlined />
                  </div>
                  <div className="mobile-list-row-body">
                    <div className="mobile-list-row-title">
                      <span>{xeMap.get(c.chieuDi.xeId)?.bienSo ?? "—"}</span>
                      {laChuyenKhuHoi(c) && (
                        <Tag color="blue" style={{ marginInlineEnd: 0, fontSize: 11, lineHeight: "16px" }}>
                          Khứ hồi
                        </Tag>
                      )}
                    </div>
                    <div className="mobile-list-row-sub">
                      {taiXeMap.get(c.chieuDi.taiXeId)?.hoTen ?? "—"} · {soHang} hàng
                    </div>
                  </div>
                  <div className="mobile-list-row-end">
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {formatNgay(c.ngay)}
                    </Typography.Text>
                    <RightOutlined style={{ fontSize: 11 }} />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </Card>

      {/* Công nợ cần chú ý - gộp phải thu/phải trả vào 1 khối, chuyển bằng tab để đỡ chiếm màn hình */}
      <Card
        title="Công nợ cần chú ý"
        size="small"
        style={{ marginTop: 12 }}
        styles={{ body: { padding: "4px 12px 8px" } }}
        extra={
          <Link href={tabCongNo === "thu" ? "/cong-no-phai-thu" : "/cong-no-phai-tra"} style={{ fontSize: 13 }}>
            Xem tất cả
          </Link>
        }
      >
        <Segmented
          block
          value={tabCongNo}
          onChange={(v) => setTabCongNo(v as "thu" | "tra")}
          options={[
            { label: "Phải thu", value: "thu" },
            { label: "Phải trả", value: "tra" },
          ]}
          style={{ marginBottom: 6 }}
        />
        {danhSachCongNoDangHien.length === 0 ? (
          <Empty description="Không có công nợ" style={{ margin: "16px 0" }} />
        ) : tabCongNo === "thu" ? (
          congNoKhach.map((c) => {
            const ten = khachHangMap.get(c.khachHangId)?.hoTen ?? "—";
            return (
              <Link key={c.khachHangId} href={`/cong-no-phai-thu/chi-tiet?id=${c.khachHangId}`}>
                <div className="mobile-list-row">
                  <div className="mobile-list-row-avatar">{ten.charAt(0).toUpperCase()}</div>
                  <div className="mobile-list-row-body">
                    <div className="mobile-list-row-title">{ten}</div>
                    <div className="mobile-list-row-sub">{c.soChuyenLienQuan} chuyến liên quan</div>
                  </div>
                  <div className="mobile-list-row-end">
                    <Typography.Text strong style={{ color: "#C0392B", fontSize: 13 }}>
                      {formatTien(c.tongConNo)}
                    </Typography.Text>
                    <RightOutlined style={{ fontSize: 11 }} />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          congNoBoc.map((c) => {
            const ten = nguoiBocHangMap.get(c.nguoiBocHangId)?.hoTen ?? "—";
            return (
              <Link key={c.nguoiBocHangId} href={`/cong-no-phai-tra/chi-tiet?id=${c.nguoiBocHangId}`}>
                <div className="mobile-list-row">
                  <div className="mobile-list-row-avatar">{ten.charAt(0).toUpperCase()}</div>
                  <div className="mobile-list-row-body">
                    <div className="mobile-list-row-title">{ten}</div>
                    <div className="mobile-list-row-sub">{c.soChuyenLienQuan} chuyến liên quan</div>
                  </div>
                  <div className="mobile-list-row-end">
                    <Typography.Text strong style={{ color: "#C0392B", fontSize: 13 }}>
                      {formatTien(c.tongConNo)}
                    </Typography.Text>
                    <RightOutlined style={{ fontSize: 11 }} />
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </Card>

      <ChonThoiGianSheet
        open={moChonThoiGian}
        onDong={() => setMoChonThoiGian(false)}
        loai={loaiFilter}
        tuyChon={tuyChon}
        onChonMoc={onChonMocThoiGian}
        onChonKhoang={onChonKhoangTuyChon}
      />
    </div>
  );
}
