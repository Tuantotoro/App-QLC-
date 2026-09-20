"use client";

import React, { useMemo, useState } from "react";
import { Typography, Row, Col, Card, Statistic, Table, Tag, Alert, Grid } from "antd";
import {
  CarOutlined,
  ShoppingOutlined,
  DollarOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useData, useLookup } from "@/store/DataContext";
import { locChuyenTheoThoiGian } from "@/utils/dateFilter";
import {
  tinhTongGiaTriHangChuyen,
  tinhTongPhaiThuChuyen,
  tinhTongDaThuChuyen,
  tinhTongChiPhiChuyen,
  tinhTongPhaiTraBocHangChuyen,
  tinhTongDaTraBocHangChuyen,
  tinhTongGiaTriHang,
  tinhTongPhaiThu,
  tinhTongDaThu,
  tinhTongChiPhi,
  layCacChieuCuaChuyen,
  formatTien,
  formatSoLuong,
} from "@/utils/calc";
import { tongHopCongNoKhachHang } from "@/utils/aggregate";
import BoLocThoiGian from "@/components/shared/BoLocThoiGian";
import MobileBaoCao from "@/components/bao-cao/MobileBaoCao";
import type { FilterKhoangThoiGian } from "@/types";

const { useBreakpoint } = Grid;

export default function BaoCaoPage() {
  const { data } = useData();
  const { xeMap, taiXeMap, khachHangMap, loaiHangMap } = useLookup(data);
  const [loaiFilter, setLoaiFilter] = useState<FilterKhoangThoiGian>("thang_nay");
  const [tuyChon, setTuyChon] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  const chuyenDaLoc = useMemo(
    () =>
      locChuyenTheoThoiGian(data.chuyenList, {
        loai: loaiFilter,
        tuNgay: tuyChon?.[0],
        denNgay: tuyChon?.[1],
      }),
    [data.chuyenList, loaiFilter, tuyChon]
  );

  const tongHop = useMemo(() => {
    let giaTriHang = 0,
      phaiThu = 0,
      daThu = 0,
      chiPhi = 0,
      phaiTraBoc = 0,
      daTraBoc = 0;
    for (const c of chuyenDaLoc) {
      giaTriHang += tinhTongGiaTriHangChuyen(c);
      phaiThu += tinhTongPhaiThuChuyen(c);
      daThu += tinhTongDaThuChuyen(c);
      chiPhi += tinhTongChiPhiChuyen(c);
      phaiTraBoc += tinhTongPhaiTraBocHangChuyen(c);
      daTraBoc += tinhTongDaTraBocHangChuyen(c);
    }
    return { giaTriHang, phaiThu, daThu, chiPhi, phaiTraBoc, daTraBoc };
  }, [chuyenDaLoc]);

  const theoXe = useMemo(() => {
    const map = new Map<
      string,
      {
        xeId: string;
        soChuyenSet: Set<string>;
        giaTriHang: number;
        phaiThu: number;
        daThu: number;
        chiPhi: number;
      }
    >();
    for (const c of chuyenDaLoc) {
      for (const { duLieu } of layCacChieuCuaChuyen(c)) {
        const e = map.get(duLieu.xeId) ?? {
          xeId: duLieu.xeId,
          soChuyenSet: new Set<string>(),
          giaTriHang: 0,
          phaiThu: 0,
          daThu: 0,
          chiPhi: 0,
        };
        e.soChuyenSet.add(c.id);
        e.giaTriHang += tinhTongGiaTriHang(duLieu.danhSachHang);
        e.phaiThu += tinhTongPhaiThu(duLieu.danhSachHang);
        e.daThu += tinhTongDaThu(duLieu.danhSachHang);
        e.chiPhi += tinhTongChiPhi(duLieu.danhSachChiPhi);
        map.set(duLieu.xeId, e);
      }
    }
    return Array.from(map.values())
      .map((e) => ({ ...e, soChuyen: e.soChuyenSet.size }))
      .sort((a, b) => b.soChuyen - a.soChuyen);
  }, [chuyenDaLoc]);

  const theoLoaiHang = useMemo(() => {
    const map = new Map<string, { loaiHangId: string; donViSoLuong: Map<string, number>; giaTriHang: number }>();
    for (const c of chuyenDaLoc) {
      for (const { duLieu } of layCacChieuCuaChuyen(c)) {
        for (const h of duLieu.danhSachHang) {
          const e = map.get(h.loaiHangId) ?? {
            loaiHangId: h.loaiHangId,
            donViSoLuong: new Map<string, number>(),
            giaTriHang: 0,
          };
          e.donViSoLuong.set(h.donVi, (e.donViSoLuong.get(h.donVi) ?? 0) + h.soLuong);
          e.giaTriHang += h.giaTriHang;
          map.set(h.loaiHangId, e);
        }
      }
    }
    return Array.from(map.values());
  }, [chuyenDaLoc]);

  const topCongNoKhach = useMemo(
    () =>
      tongHopCongNoKhachHang(data)
        .filter((c) => c.tongConNo > 0)
        .sort((a, b) => b.tongConNo - a.tongConNo)
        .slice(0, 10),
    [data]
  );

  return (
    <div>
      {isDesktop && (
        <Row justify="space-between" align="middle" gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Báo cáo
            </Typography.Title>
            <Typography.Text type="secondary">{chuyenDaLoc.length} chuyến trong khoảng đã chọn</Typography.Text>
          </Col>
          <Col xs={24} sm="auto">
            <BoLocThoiGian
              value={loaiFilter}
              onChange={setLoaiFilter}
              onChangeKhoangTuyChon={setTuyChon}
            />
          </Col>
        </Row>
      )}

      {!isDesktop ? (
        <MobileBaoCao
          soChuyen={chuyenDaLoc.length}
          tongHop={tongHop}
          theoXe={theoXe}
          theoLoaiHang={theoLoaiHang}
          topCongNoKhach={topCongNoKhach}
          xeMap={xeMap}
          taiXeMap={taiXeMap}
          khachHangMap={khachHangMap}
          loaiHangMap={loaiHangMap}
          loaiFilter={loaiFilter}
          tuyChon={tuyChon}
          onChonMocThoiGian={setLoaiFilter}
          onChonKhoangTuyChon={(khoang) => {
            setTuyChon(khoang);
            setLoaiFilter("khoang_tuy_chon");
          }}
        />
      ) : (
        <>
          <Row gutter={[12, 12]}>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Tổng chuyến"
                  value={chuyenDaLoc.length}
                  prefix={<CarOutlined style={{ color: "#1B7A43" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Tổng giá trị hàng"
                  value={tongHop.giaTriHang}
                  formatter={(v) => formatTien(Number(v))}
                  prefix={<ShoppingOutlined style={{ color: "#1B7A43" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Khách phải trả"
                  value={tongHop.phaiThu}
                  formatter={(v) => formatTien(Number(v))}
                  prefix={<WalletOutlined style={{ color: "#1B7A43" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Đã thu"
                  value={tongHop.daThu}
                  formatter={(v) => formatTien(Number(v))}
                  valueStyle={{ color: "#1B7A43" }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Còn phải thu"
                  value={tongHop.phaiThu - tongHop.daThu}
                  formatter={(v) => formatTien(Number(v))}
                  valueStyle={{ color: tongHop.phaiThu - tongHop.daThu > 0 ? "#C0392B" : "#1B7A43" }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Tổng chi phí"
                  value={tongHop.chiPhi}
                  formatter={(v) => formatTien(Number(v))}
                  prefix={<DollarOutlined style={{ color: "#C58A00" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Phải trả người bốc hàng"
                  value={tongHop.phaiTraBoc}
                  formatter={(v) => formatTien(Number(v))}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Còn phải trả"
                  value={tongHop.phaiTraBoc - tongHop.daTraBoc}
                  formatter={(v) => formatTien(Number(v))}
                  valueStyle={{ color: tongHop.phaiTraBoc - tongHop.daTraBoc > 0 ? "#C0392B" : "#1B7A43" }}
                />
              </Card>
            </Col>
          </Row>

          <Alert
            style={{ marginTop: 16, marginBottom: 16 }}
            type="info"
            showIcon
            message="Lưu ý"
            description="Báo cáo chỉ tổng hợp lại các số liệu người dùng đã nhập (giá trị hàng, tiền khách phải trả, chi phí...). Không có công thức tính lợi nhuận tự động — cần xác nhận thêm với người dùng thực tế nếu muốn bổ sung chỉ số này."
          />

          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <Card title="Theo xe" size="small">
                <div className="scroll-ngang">
                  <Table
                    rowKey="xeId"
                    size="small"
                    pagination={false}
                    dataSource={theoXe}
                    columns={[
                      { title: "Xe", render: (_, r) => xeMap.get(r.xeId)?.bienSo ?? "—" },
                      {
                        title: "Tài xế",
                        render: (_, r) => {
                          const xe = xeMap.get(r.xeId);
                          return xe?.taiXeMacDinhId ? taiXeMap.get(xe.taiXeMacDinhId)?.hoTen ?? "—" : "—";
                        },
                      },
                      { title: "Số chuyến", dataIndex: "soChuyen" },
                      { title: "Giá trị hàng", render: (_, r) => formatTien(r.giaTriHang) },
                      { title: "Phải thu", render: (_, r) => formatTien(r.phaiThu) },
                      { title: "Đã thu", render: (_, r) => formatTien(r.daThu) },
                      { title: "Chi phí", render: (_, r) => formatTien(r.chiPhi) },
                    ]}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Theo loại hàng" size="small">
                <div className="scroll-ngang">
                  <Table
                    rowKey="loaiHangId"
                    size="small"
                    pagination={false}
                    dataSource={theoLoaiHang}
                    columns={[
                      { title: "Loại hàng", render: (_, r) => loaiHangMap.get(r.loaiHangId)?.ten ?? "—" },
                      {
                        title: "Số lượng",
                        render: (_, r) =>
                          Array.from(r.donViSoLuong.entries())
                            .map(([dv, sl]: [string, number]) => `${formatSoLuong(sl)} ${dv}`)
                            .join(", "),
                      },
                      { title: "Tổng giá trị hàng", render: (_, r) => formatTien(r.giaTriHang) },
                    ]}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          <Card title="Top công nợ phải thu" size="small" style={{ marginTop: 12 }}>
            <div className="scroll-ngang">
              <Table
                rowKey="khachHangId"
                size="small"
                pagination={false}
                dataSource={topCongNoKhach}
                columns={[
                  { title: "Khách hàng", render: (_, r) => khachHangMap.get(r.khachHangId)?.hoTen ?? "—" },
                  { title: "Phải thu", render: (_, r) => formatTien(r.tongPhaiThu) },
                  { title: "Đã thu", render: (_, r) => formatTien(r.tongDaThu) },
                  {
                    title: "Còn nợ",
                    render: (_, r) => <Tag color="red">{formatTien(r.tongConNo)}</Tag>,
                  },
                ]}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
