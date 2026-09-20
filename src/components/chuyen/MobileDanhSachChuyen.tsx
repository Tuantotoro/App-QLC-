"use client";

import React, { useState } from "react";
import { Input, Drawer, Select, Button, Empty, Space } from "antd";
import { SearchOutlined, FilterOutlined, CarOutlined, SwapOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Link from "next/link";
import type { Chuyen, TaiXe, Xe, FilterKhoangThoiGian } from "@/types";
import {
  tinhTongGiaTriHangChuyen,
  tinhTongPhaiThuChuyen,
  tinhTongDaThuChuyen,
  tinhTongConPhaiThuChuyen,
  tinhTongChiPhiChuyen,
  tinhLoiNhuanChuyen,
  tinhTrangThaiChuyen,
  layCacChieuCuaChuyen,
  laChuyenKhuHoi,
  formatNgay,
  formatTongHopSoLuong,
  formatTien,
} from "@/utils/calc";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import BoLocThoiGian from "@/components/shared/BoLocThoiGian";
import { nhanBoLocThoiGian } from "@/components/dashboard/ChonThoiGianSheet";

interface Props {
  danhSach: Chuyen[];
  xeMap: Map<string, Xe>;
  taiXeMap: Map<string, TaiXe>;
  xeList: Xe[];
  taiXeList: TaiXe[];
  tuKhoa: string;
  onChangeTuKhoa: (v: string) => void;
  xeLoc: string | undefined;
  onChangeXeLoc: (v: string | undefined) => void;
  taiXeLoc: string | undefined;
  onChangeTaiXeLoc: (v: string | undefined) => void;
  loaiFilter: FilterKhoangThoiGian;
  onChangeLoaiFilter: (v: FilterKhoangThoiGian) => void;
  tuyChon: [dayjs.Dayjs, dayjs.Dayjs] | null;
  onChangeTuyChon: (v: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
}

export default function MobileDanhSachChuyen({
  danhSach,
  xeMap,
  taiXeMap,
  xeList,
  taiXeList,
  tuKhoa,
  onChangeTuKhoa,
  xeLoc,
  onChangeXeLoc,
  taiXeLoc,
  onChangeTaiXeLoc,
  loaiFilter,
  onChangeLoaiFilter,
  tuyChon,
  onChangeTuyChon,
}: Props) {
  const [openLoc, setOpenLoc] = useState(false);
  const soLuongDangLoc = (xeLoc ? 1 : 0) + (taiXeLoc ? 1 : 0) + (loaiFilter !== "tat_ca" ? 1 : 0);

  return (
    <div>
      {/* Thẻ đầu trang: cùng kiểu thẻ "Tổng quan" nhưng nội dung là chuyến đi, số chuyến và ô tìm kiếm */}
      <div className="mobile-hero-card mobile-chuyen-hero">
        <div className="mobile-hero-top">
          <div>
            <div className="mobile-hero-title">Chuyến đi</div>
            <div className="mobile-hero-subtitle">{nhanBoLocThoiGian(loaiFilter, tuyChon)}</div>
          </div>
          <button
            type="button"
            className="mobile-chuyen-hero-filter"
            aria-label="Bộ lọc"
            onClick={() => setOpenLoc(true)}
          >
            <FilterOutlined />
            {soLuongDangLoc > 0 && <span className="mobile-chuyen-filter-dot" />}
          </button>
        </div>
        <div className="mobile-hero-label">Số chuyến</div>
        <div className="mobile-hero-value mobile-chuyen-hero-value">
          {danhSach.length}
          <span className="mobile-chuyen-hero-unit">chuyến</span>
        </div>
        <Input
          placeholder="Tìm theo biển số, tài xế..."
          prefix={<SearchOutlined style={{ color: "#8a8672" }} />}
          value={tuKhoa}
          onChange={(e) => onChangeTuKhoa(e.target.value)}
          allowClear
          style={{ borderRadius: 12, height: 40 }}
        />
      </div>

      {danhSach.length === 0 ? (
        <Empty description="Không tìm thấy chuyến nào" style={{ margin: "32px 0" }} />
      ) : (
        <div className="mobile-chuyen-list">
          {danhSach.map((c) => {
            const soHang = layCacChieuCuaChuyen(c).reduce(
              (s, ch) => s + ch.duLieu.danhSachHang.length,
              0
            );
            const conPhaiThu = tinhTongConPhaiThuChuyen(c);
            const loiNhuan = tinhLoiNhuanChuyen(c);
            const trangThai = tinhTrangThaiChuyen(c);
            const lopMauThe =
              trangThai === "da_thu_du"
                ? "card-da-thu-du"
                : trangThai === "mot_phan"
                ? "card-mot-phan"
                : "card-chua-thu";
            return (
              <Link key={c.id} href={`/chuyen/chi-tiet?id=${c.id}`}>
                <div className={`mobile-trip-card ${lopMauThe}`}>
                  <div className="mobile-trip-card-top">
                    <div className="mobile-trip-card-plate">
                      {laChuyenKhuHoi(c) ? <SwapOutlined /> : <CarOutlined />}
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {xeMap.get(c.chieuDi.xeId)?.bienSo ?? "—"}
                      </span>
                    </div>
                    <div className="mobile-trip-card-date">{formatNgay(c.ngay)}</div>
                  </div>
                  <div className="mobile-trip-card-sub">
                    {taiXeMap.get(c.chieuDi.taiXeId)?.hoTen ?? "—"}
                    {laChuyenKhuHoi(c) &&
                      c.chieuVe &&
                      c.chieuVe.taiXeId !== c.chieuDi.taiXeId &&
                      ` · Về: ${taiXeMap.get(c.chieuVe.taiXeId)?.hoTen ?? "—"}`}
                    {" · "}
                    {formatTongHopSoLuong(
                      layCacChieuCuaChuyen(c).flatMap((ch) => ch.duLieu.danhSachHang)
                    )}{" "}
                    ({soHang} loại)
                  </div>

                  <div className="mobile-trip-card-divider" />

                  <div className="mobile-trip-card-metrics">
                    <div>
                      <div className="mobile-trip-card-metric-label">Giá trị hàng</div>
                      <div className="mobile-trip-card-metric-value">
                        <SoTien value={tinhTongGiaTriHangChuyen(c)} size={13.5} />
                      </div>
                    </div>
                    <div>
                      <div className="mobile-trip-card-metric-label">Khách phải trả</div>
                      <div className="mobile-trip-card-metric-value">
                        <SoTien value={tinhTongPhaiThuChuyen(c)} size={13.5} />
                      </div>
                    </div>
                    <div>
                      <div className="mobile-trip-card-metric-label">Còn phải thu</div>
                      <div className="mobile-trip-card-metric-value">
                        <SoTien
                          value={conPhaiThu}
                          mau={conPhaiThu > 0 ? "#C0392B" : "#1B7A43"}
                          size={13.5}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mobile-trip-card-metric-label">Chi phí</div>
                      <div className="mobile-trip-card-metric-value">
                        <SoTien value={tinhTongChiPhiChuyen(c)} size={13.5} />
                      </div>
                    </div>
                  </div>

                  <div className="mobile-trip-card-bottom">
                    <Space size={6}>
                      <TrangThaiTag trangThai={tinhTrangThaiChuyen(c)} kieu="thu" />
                      {laChuyenKhuHoi(c) && (
                        <span style={{ fontSize: 11.5, color: "#1B7A43", fontWeight: 600 }}>
                          Khứ hồi
                        </span>
                      )}
                    </Space>
                    <span
                      className="mobile-trip-card-profit"
                      style={{ color: loiNhuan >= 0 ? "#1B7A43" : "#C0392B" }}
                    >
                      {loiNhuan >= 0 ? "Lãi" : "Lỗ"}: {formatTien(Math.abs(loiNhuan))}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Drawer
        title="Bộ lọc chuyến"
        placement="bottom"
        open={openLoc}
        onClose={() => setOpenLoc(false)}
        height="auto"
        styles={{ body: { paddingBottom: 24 } }}
      >
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <div>
            <div style={{ fontSize: 12, color: "#8a8672", marginBottom: 6 }}>Thời gian</div>
            <BoLocThoiGian value={loaiFilter} onChange={onChangeLoaiFilter} onChangeKhoangTuyChon={onChangeTuyChon} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#8a8672", marginBottom: 6 }}>Xe</div>
            <Select
              placeholder="Tất cả xe"
              style={{ width: "100%" }}
              allowClear
              value={xeLoc}
              onChange={onChangeXeLoc}
              options={xeList.map((x) => ({ value: x.id, label: x.bienSo }))}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#8a8672", marginBottom: 6 }}>Tài xế</div>
            <Select
              placeholder="Tất cả tài xế"
              style={{ width: "100%" }}
              allowClear
              value={taiXeLoc}
              onChange={onChangeTaiXeLoc}
              options={taiXeList.map((t) => ({ value: t.id, label: t.hoTen }))}
            />
          </div>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Button
              onClick={() => {
                onChangeXeLoc(undefined);
                onChangeTaiXeLoc(undefined);
                onChangeLoaiFilter("tat_ca");
                onChangeTuyChon(null);
              }}
            >
              Xóa lọc
            </Button>
            <Button type="primary" onClick={() => setOpenLoc(false)}>
              Xem kết quả
            </Button>
          </Space>
        </Space>
      </Drawer>
    </div>
  );
}
