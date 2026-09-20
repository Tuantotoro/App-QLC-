"use client";

import React from "react";
import { Card, Empty } from "antd";
import {
  CarOutlined,
  ShoppingOutlined,
  DollarOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import type { KhachHang, LoaiHang, TaiXe, Xe } from "@/types";
import { formatTien, formatSoLuong } from "@/utils/calc";

interface TongHop {
  giaTriHang: number;
  phaiThu: number;
  daThu: number;
  chiPhi: number;
  phaiTraBoc: number;
  daTraBoc: number;
}

interface TheoXeItem {
  xeId: string;
  soChuyen: number;
  giaTriHang: number;
  phaiThu: number;
  daThu: number;
  chiPhi: number;
}

interface TheoLoaiHangItem {
  loaiHangId: string;
  donViSoLuong: Map<string, number>;
  giaTriHang: number;
}

interface TopCongNoItem {
  khachHangId: string;
  tongPhaiThu: number;
  tongDaThu: number;
  tongConNo: number;
}

interface Props {
  soChuyen: number;
  tongHop: TongHop;
  theoXe: TheoXeItem[];
  theoLoaiHang: TheoLoaiHangItem[];
  topCongNoKhach: TopCongNoItem[];
  xeMap: Map<string, Xe>;
  taiXeMap: Map<string, TaiXe>;
  khachHangMap: Map<string, KhachHang>;
  loaiHangMap: Map<string, LoaiHang>;
}

export default function MobileBaoCao({
  soChuyen,
  tongHop,
  theoXe,
  theoLoaiHang,
  topCongNoKhach,
  xeMap,
  taiXeMap,
  khachHangMap,
  loaiHangMap,
}: Props) {
  const conPhaiThu = tongHop.phaiThu - tongHop.daThu;
  const conPhaiTraBoc = tongHop.phaiTraBoc - tongHop.daTraBoc;
  const tyLeDaThu = tongHop.phaiThu > 0 ? Math.min(100, Math.round((tongHop.daThu / tongHop.phaiThu) * 100)) : 0;

  return (
    <div>
      {/* Hero: chỉ số quan trọng nhất - còn phải thu, kèm thanh tiến độ đã thu */}
      <div className="mobile-hero-card">
        <div className="mobile-hero-label">Còn phải thu ({soChuyen} chuyến)</div>
        <div className="mobile-hero-value">{formatTien(conPhaiThu)}</div>
        <div className="mobile-hero-bar-track">
          <div className="mobile-hero-bar-fill" style={{ width: `${tyLeDaThu}%` }} />
        </div>
        <div className="mobile-hero-caption">
          <span>Đã thu {formatTien(tongHop.daThu)}</span>
          <span>Tổng {formatTien(tongHop.phaiThu)}</span>
        </div>
      </div>

      {/* Các chỉ số phụ - vuốt ngang, gọn hơn nhiều so với bảng lưới 8 ô */}
      <div className="mobile-stat-scroll">
        <div className="mobile-stat-chip">
          <div className="mobile-stat-chip-label">
            <ShoppingOutlined /> Giá trị hàng
          </div>
          <div className="mobile-stat-chip-value">{formatTien(tongHop.giaTriHang)}</div>
        </div>
        <div className="mobile-stat-chip">
          <div className="mobile-stat-chip-label">
            <DollarOutlined /> Chi phí
          </div>
          <div className="mobile-stat-chip-value" style={{ color: "#C58A00" }}>
            {formatTien(tongHop.chiPhi)}
          </div>
        </div>
        <div className="mobile-stat-chip">
          <div className="mobile-stat-chip-label">
            <WalletOutlined /> Phải trả bốc hàng
          </div>
          <div className="mobile-stat-chip-value">{formatTien(tongHop.phaiTraBoc)}</div>
        </div>
        <div className="mobile-stat-chip">
          <div className="mobile-stat-chip-label">Còn phải trả</div>
          <div className="mobile-stat-chip-value" style={{ color: conPhaiTraBoc > 0 ? "#C0392B" : "#1B7A43" }}>
            {formatTien(conPhaiTraBoc)}
          </div>
        </div>
      </div>

      {/* Theo xe - danh sách thẻ dọc thay cho bảng phải cuộn ngang, dễ nhìn hơn trên điện thoại */}
      <Card title="Theo xe" size="small" style={{ marginTop: 16 }} styles={{ body: { padding: "10px 12px" } }}>
        {theoXe.length === 0 ? (
          <Empty description="Chưa có dữ liệu" style={{ margin: "16px 0" }} />
        ) : (
          <div className="mobile-baocao-xe-list">
            {theoXe.map((e) => {
              const xe = xeMap.get(e.xeId);
              const tenTaiXe = xe?.taiXeMacDinhId ? taiXeMap.get(xe.taiXeMacDinhId)?.hoTen : undefined;
              return (
                <div key={e.xeId} className="mobile-baocao-xe-item">
                  <div className="mobile-baocao-xe-top">
                    <div className="mobile-baocao-xe-plate">
                      <CarOutlined />
                      <span>{xe?.bienSo ?? "—"}</span>
                    </div>
                    <div className="mobile-baocao-xe-badge">{e.soChuyen} chuyến</div>
                  </div>
                  <div className="mobile-baocao-xe-sub">{tenTaiXe ?? "—"}</div>
                  <div className="mobile-baocao-xe-metrics">
                    <div>
                      <div className="mobile-baocao-metric-label">Giá trị hàng</div>
                      <div className="mobile-baocao-metric-value">{formatTien(e.giaTriHang)}</div>
                    </div>
                    <div>
                      <div className="mobile-baocao-metric-label">Phải thu</div>
                      <div className="mobile-baocao-metric-value">{formatTien(e.phaiThu)}</div>
                    </div>
                    <div>
                      <div className="mobile-baocao-metric-label">Đã thu</div>
                      <div className="mobile-baocao-metric-value" style={{ color: "#1B7A43" }}>
                        {formatTien(e.daThu)}
                      </div>
                    </div>
                    <div>
                      <div className="mobile-baocao-metric-label">Chi phí</div>
                      <div className="mobile-baocao-metric-value" style={{ color: "#C58A00" }}>
                        {formatTien(e.chiPhi)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Theo loại hàng - dạng hàng danh sách gọn, giống các mục khác trong app */}
      <Card title="Theo loại hàng" size="small" style={{ marginTop: 12 }} styles={{ body: { padding: "4px 12px" } }}>
        {theoLoaiHang.length === 0 ? (
          <Empty description="Chưa có dữ liệu" style={{ margin: "16px 0" }} />
        ) : (
          theoLoaiHang.map((r) => (
            <div key={r.loaiHangId} className="mobile-list-row">
              <div className="mobile-list-row-icon">
                <ShoppingOutlined />
              </div>
              <div className="mobile-list-row-body">
                <div className="mobile-list-row-title">{loaiHangMap.get(r.loaiHangId)?.ten ?? "—"}</div>
                <div className="mobile-list-row-sub">
                  {Array.from(r.donViSoLuong.entries())
                    .map(([dv, sl]) => `${formatSoLuong(sl)} ${dv}`)
                    .join(", ")}
                </div>
              </div>
              <div className="mobile-list-row-end" style={{ color: "#22261f" }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{formatTien(r.giaTriHang)}</span>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Top công nợ phải thu */}
      <Card
        title="Top công nợ phải thu"
        size="small"
        style={{ marginTop: 12 }}
        styles={{ body: { padding: "4px 12px 8px" } }}
      >
        {topCongNoKhach.length === 0 ? (
          <Empty description="Không có công nợ" style={{ margin: "16px 0" }} />
        ) : (
          topCongNoKhach.map((c) => {
            const ten = khachHangMap.get(c.khachHangId)?.hoTen ?? "—";
            return (
              <div key={c.khachHangId} className="mobile-list-row">
                <div className="mobile-list-row-avatar">{ten.charAt(0).toUpperCase()}</div>
                <div className="mobile-list-row-body">
                  <div className="mobile-list-row-title">{ten}</div>
                  <div className="mobile-list-row-sub">
                    Đã thu {formatTien(c.tongDaThu)} / {formatTien(c.tongPhaiThu)}
                  </div>
                </div>
                <div className="mobile-list-row-end">
                  <span style={{ fontWeight: 700, color: "#C0392B", fontSize: 13 }}>
                    {formatTien(c.tongConNo)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
