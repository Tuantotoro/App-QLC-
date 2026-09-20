"use client";

import React, { useMemo, useState } from "react";
import {
  Typography,
  Input,
  Select,
  Row,
  Col,
  Card,
  List,
  Button,
  Empty,
  Tag,
  Grid,
} from "antd";
import { PlusOutlined, SearchOutlined, CarOutlined, SwapOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Link from "next/link";
import { useData, useLookup } from "@/store/DataContext";
import { locChuyenTheoThoiGian } from "@/utils/dateFilter";
import {
  tinhTongGiaTriHangChuyen,
  tinhTongPhaiThuChuyen,
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
import MobileDanhSachChuyen from "@/components/chuyen/MobileDanhSachChuyen";
import type { FilterKhoangThoiGian } from "@/types";

const { useBreakpoint } = Grid;

export default function DanhSachChuyenPage() {
  const { data } = useData();
  const { xeMap, taiXeMap } = useLookup(data);
  const [tuKhoa, setTuKhoa] = useState("");
  const [xeLoc, setXeLoc] = useState<string | undefined>(undefined);
  const [taiXeLoc, setTaiXeLoc] = useState<string | undefined>(undefined);
  const [loaiFilter, setLoaiFilter] = useState<FilterKhoangThoiGian>("tat_ca");
  const [tuyChon, setTuyChon] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  const danhSach = useMemo(() => {
    const dsTheoThoiGian = locChuyenTheoThoiGian(data.chuyenList, {
      loai: loaiFilter,
      tuNgay: tuyChon?.[0],
      denNgay: tuyChon?.[1],
    });
    return [...dsTheoThoiGian]
      .filter((c) => (xeLoc ? layCacChieuCuaChuyen(c).some((ch) => ch.duLieu.xeId === xeLoc) : true))
      .filter((c) =>
        taiXeLoc ? layCacChieuCuaChuyen(c).some((ch) => ch.duLieu.taiXeId === taiXeLoc) : true
      )
      .filter((c) => {
        if (!tuKhoa.trim()) return true;
        const tu = tuKhoa.toLowerCase();
        return layCacChieuCuaChuyen(c).some((ch) => {
          const bienSo = xeMap.get(ch.duLieu.xeId)?.bienSo?.toLowerCase() ?? "";
          const taiXe = taiXeMap.get(ch.duLieu.taiXeId)?.hoTen?.toLowerCase() ?? "";
          return bienSo.includes(tu) || taiXe.includes(tu);
        });
      })
      .sort((a, b) => (a.ngay < b.ngay ? 1 : -1));
  }, [data.chuyenList, xeLoc, taiXeLoc, tuKhoa, xeMap, taiXeMap, loaiFilter, tuyChon]);

  return (
    <div>
      <Row justify="space-between" align="middle" gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Chuyến xe
          </Typography.Title>
          <Typography.Text type="secondary">{danhSach.length} chuyến</Typography.Text>
        </Col>
        <Col className="an-tren-mobile">
          <Link href="/chuyen/tao">
            <Button type="primary" icon={<PlusOutlined />}>
              Tạo chuyến
            </Button>
          </Link>
        </Col>
      </Row>

      {!isDesktop ? (
        <MobileDanhSachChuyen
          danhSach={danhSach}
          xeMap={xeMap}
          taiXeMap={taiXeMap}
          xeList={data.xeList}
          taiXeList={data.taiXeList}
          tuKhoa={tuKhoa}
          onChangeTuKhoa={setTuKhoa}
          xeLoc={xeLoc}
          onChangeXeLoc={setXeLoc}
          taiXeLoc={taiXeLoc}
          onChangeTaiXeLoc={setTaiXeLoc}
          loaiFilter={loaiFilter}
          onChangeLoaiFilter={setLoaiFilter}
          tuyChon={tuyChon}
          onChangeTuyChon={setTuyChon}
        />
      ) : (
        <>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[12, 12]}>
              <Col xs={24}>
                <BoLocThoiGian value={loaiFilter} onChange={setLoaiFilter} onChangeKhoangTuyChon={setTuyChon} />
              </Col>
              <Col xs={24} sm={8}>
                <Input
                  placeholder="Tìm theo biển số, tài xế..."
                  prefix={<SearchOutlined />}
                  value={tuKhoa}
                  onChange={(e) => setTuKhoa(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={12} sm={8}>
                <Select
                  placeholder="Lọc theo xe"
                  style={{ width: "100%" }}
                  allowClear
                  value={xeLoc}
                  onChange={setXeLoc}
                  options={data.xeList.map((x) => ({ value: x.id, label: x.bienSo }))}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Select
                  placeholder="Lọc theo tài xế"
                  style={{ width: "100%" }}
                  allowClear
                  value={taiXeLoc}
                  onChange={setTaiXeLoc}
                  options={data.taiXeList.map((t) => ({ value: t.id, label: t.hoTen }))}
                />
              </Col>
            </Row>
          </Card>

          {danhSach.length === 0 ? (
        <Empty description="Không tìm thấy chuyến nào" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}
          dataSource={danhSach}
          renderItem={(c) => {
            const conPhaiThu = tinhTongConPhaiThuChuyen(c);
            const loiNhuan = tinhLoiNhuanChuyen(c);
            const trangThai = tinhTrangThaiChuyen(c);
            const lopMauThe =
              trangThai === "da_thu_du"
                ? "card-da-thu-du"
                : trangThai === "mot_phan"
                ? "card-mot-phan"
                : "card-chua-thu";
            const soHang = layCacChieuCuaChuyen(c).reduce((s, ch) => s + ch.duLieu.danhSachHang.length, 0);
            return (
              <List.Item>
                <Link href={`/chuyen/chi-tiet?id=${c.id}`} className="desktop-trip-card-link">
                  <div className={`desktop-trip-card ${lopMauThe}`}>
                    <div className="desktop-trip-card-top">
                      <div className="desktop-trip-card-plate">
                        {laChuyenKhuHoi(c) ? <SwapOutlined /> : <CarOutlined />}
                        <span>{xeMap.get(c.chieuDi.xeId)?.bienSo ?? "—"}</span>
                        {laChuyenKhuHoi(c) && <Tag color="blue">Khứ hồi</Tag>}
                      </div>
                      <div className="desktop-trip-card-date">{formatNgay(c.ngay)}</div>
                    </div>

                    <div className="desktop-trip-card-sub">
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

                    <div className="desktop-trip-card-divider" />

                    <div className="desktop-trip-card-metrics">
                      <div>
                        <div className="desktop-trip-card-metric-label">Giá trị hàng</div>
                        <SoTien value={tinhTongGiaTriHangChuyen(c)} size={14.5} />
                      </div>
                      <div>
                        <div className="desktop-trip-card-metric-label">Khách phải trả</div>
                        <SoTien value={tinhTongPhaiThuChuyen(c)} size={14.5} />
                      </div>
                      <div>
                        <div className="desktop-trip-card-metric-label">Còn phải thu</div>
                        <SoTien value={conPhaiThu} mau={conPhaiThu > 0 ? "#C0392B" : "#1B7A43"} size={14.5} />
                      </div>
                      <div>
                        <div className="desktop-trip-card-metric-label">Chi phí</div>
                        <SoTien value={tinhTongChiPhiChuyen(c)} size={14.5} />
                      </div>
                    </div>

                    <div className="desktop-trip-card-bottom">
                      <TrangThaiTag trangThai={trangThai} kieu="thu" />
                      <span
                        className="desktop-trip-card-profit"
                        style={{ color: loiNhuan >= 0 ? "#1B7A43" : "#C0392B" }}
                      >
                        Lãi: {formatTien(loiNhuan)}
                      </span>
                    </div>
                  </div>
                </Link>
              </List.Item>
            );
          }}
            />
          )}
        </>
      )}
    </div>
  );
}
