"use client";

import React, { useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  List,
  Empty,
  Space,
  Tag,
  Grid,
} from "antd";
import {
  CarOutlined,
  DollarOutlined,
  WalletOutlined,
  ShoppingOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Link from "next/link";
import { useData, useLookup } from "@/store/DataContext";
import { locChuyenTheoThoiGian } from "@/utils/dateFilter";
import {
  tinhTongGiaTriHangChuyen,
  tinhTongPhaiThuChuyen,
  tinhTongDaThuChuyen,
  tinhTongConPhaiThuChuyen,
  tinhTongChiPhiChuyen,
  tinhTongPhaiTraBocHangChuyen,
  tinhTongConPhaiTraBocHangChuyen,
  layCacChieuCuaChuyen,
  laChuyenKhuHoi,
  formatTien,
  formatNgay,
} from "@/utils/calc";
import { tongHopCongNoKhachHang, tongHopCongNoNguoiBocHang } from "@/utils/aggregate";
import SoTien from "@/components/shared/SoTien";
import BoLocThoiGian from "@/components/shared/BoLocThoiGian";
import MobileTongQuan from "@/components/dashboard/MobileTongQuan";
import type { FilterKhoangThoiGian } from "@/types";

const { useBreakpoint } = Grid;

export default function DashboardPage() {
  const { data } = useData();
  const { xeMap, taiXeMap, khachHangMap, nguoiBocHangMap } = useLookup(data);
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
    let tongGiaTriHang = 0;
    let tongPhaiThu = 0;
    let tongDaThu = 0;
    let tongChiPhi = 0;
    let tongPhaiTraBoc = 0;
    let tongConPhaiTraBoc = 0;
    for (const c of chuyenDaLoc) {
      tongGiaTriHang += tinhTongGiaTriHangChuyen(c);
      tongPhaiThu += tinhTongPhaiThuChuyen(c);
      tongDaThu += tinhTongDaThuChuyen(c);
      tongChiPhi += tinhTongChiPhiChuyen(c);
      tongPhaiTraBoc += tinhTongPhaiTraBocHangChuyen(c);
      tongConPhaiTraBoc += tinhTongConPhaiTraBocHangChuyen(c);
    }
    return {
      tongChuyen: chuyenDaLoc.length,
      tongGiaTriHang,
      tongPhaiThu,
      tongDaThu,
      tongConPhaiThu: tongPhaiThu - tongDaThu,
      tongChiPhi,
      tongPhaiTraBoc,
      tongConPhaiTraBoc,
    };
  }, [chuyenDaLoc]);

  const congNoKhach = useMemo(
    () =>
      tongHopCongNoKhachHang(data)
        .filter((c) => c.tongConNo > 0)
        .sort((a, b) => b.tongConNo - a.tongConNo)
        .slice(0, 5),
    [data]
  );

  const congNoBoc = useMemo(
    () =>
      tongHopCongNoNguoiBocHang(data)
        .filter((c) => c.tongConNo > 0)
        .sort((a, b) => b.tongConNo - a.tongConNo)
        .slice(0, 5),
    [data]
  );

  const chuyenGanDay = useMemo(
    () => [...data.chuyenList].sort((a, b) => (a.ngay < b.ngay ? 1 : -1)).slice(0, 5),
    [data.chuyenList]
  );

  return (
    <div>
      {isDesktop && (
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }} gutter={[12, 12]}>
          <Col>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Tổng quan
            </Typography.Title>
            <Typography.Text type="secondary">
              {chuyenDaLoc.length} chuyến trong khoảng đã chọn
            </Typography.Text>
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
      {/* Điện thoại: tiêu đề "Tổng quan" và bộ lọc thời gian nằm chung 1 hàng ngay trong thẻ (xem MobileTongQuan) */}

      {isDesktop ? (
        <>
          <Row gutter={[12, 12]}>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Tổng chuyến"
                  value={tongHop.tongChuyen}
                  prefix={<CarOutlined style={{ color: "#1B7A43" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Tổng giá trị hàng"
                  value={tongHop.tongGiaTriHang}
                  formatter={(v) => formatTien(Number(v))}
                  prefix={<ShoppingOutlined style={{ color: "#1B7A43" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Khách phải trả"
                  value={tongHop.tongPhaiThu}
                  formatter={(v) => formatTien(Number(v))}
                  prefix={<WalletOutlined style={{ color: "#1B7A43" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Đã thu"
                  value={tongHop.tongDaThu}
                  formatter={(v) => formatTien(Number(v))}
                  valueStyle={{ color: "#1B7A43" }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Còn phải thu"
                  value={tongHop.tongConPhaiThu}
                  formatter={(v) => formatTien(Number(v))}
                  valueStyle={{ color: tongHop.tongConPhaiThu > 0 ? "#C0392B" : "#1B7A43" }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Tổng chi phí"
                  value={tongHop.tongChiPhi}
                  formatter={(v) => formatTien(Number(v))}
                  prefix={<DollarOutlined style={{ color: "#C58A00" }} />}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Phải trả người bốc hàng"
                  value={tongHop.tongPhaiTraBoc}
                  formatter={(v) => formatTien(Number(v))}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-thong-ke" size="small">
                <Statistic
                  title="Còn phải trả"
                  value={tongHop.tongConPhaiTraBoc}
                  formatter={(v) => formatTien(Number(v))}
                  valueStyle={{ color: tongHop.tongConPhaiTraBoc > 0 ? "#C0392B" : "#1B7A43" }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[12, 12]} style={{ marginTop: 20 }}>
            <Col xs={24} lg={8}>
              <Card
                title="Chuyến gần đây"
                size="small"
                extra={
                  <Link href="/chuyen">
                    Xem tất cả <ArrowRightOutlined />
                  </Link>
                }
              >
                {chuyenGanDay.length === 0 ? (
                  <Empty description="Chưa có chuyến nào" />
                ) : (
                  <List
                    dataSource={chuyenGanDay}
                    renderItem={(c) => (
                      <List.Item>
                        <Link href={`/chuyen/chi-tiet?id=${c.id}`} style={{ width: "100%" }}>
                          <Space direction="vertical" size={0} style={{ width: "100%" }}>
                            <Space style={{ justifyContent: "space-between", width: "100%" }}>
                              <Space size={6}>
                                <Typography.Text strong>
                                  {xeMap.get(c.chieuDi.xeId)?.bienSo ?? "—"}
                                </Typography.Text>
                                {laChuyenKhuHoi(c) && <Tag color="blue">Khứ hồi</Tag>}
                              </Space>
                              <Typography.Text type="secondary">{formatNgay(c.ngay)}</Typography.Text>
                            </Space>
                            <Typography.Text type="secondary">
                              Tài xế: {taiXeMap.get(c.chieuDi.taiXeId)?.hoTen ?? "—"} ·{" "}
                              {layCacChieuCuaChuyen(c).reduce((s, ch) => s + ch.duLieu.danhSachHang.length, 0)}{" "}
                              hàng
                            </Typography.Text>
                          </Space>
                        </Link>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                title="Công nợ phải thu"
                size="small"
                extra={
                  <Link href="/cong-no-phai-thu">
                    Xem tất cả <ArrowRightOutlined />
                  </Link>
                }
              >
                {congNoKhach.length === 0 ? (
                  <Empty description="Không có công nợ" />
                ) : (
                  <List
                    dataSource={congNoKhach}
                    renderItem={(c) => (
                      <List.Item>
                        <Link href={`/cong-no-phai-thu/chi-tiet?id=${c.khachHangId}`} style={{ width: "100%" }}>
                          <Space style={{ justifyContent: "space-between", width: "100%" }}>
                            <Typography.Text strong>
                              {khachHangMap.get(c.khachHangId)?.hoTen ?? "—"}
                            </Typography.Text>
                            <SoTien value={c.tongConNo} mau="#C0392B" />
                          </Space>
                        </Link>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                title="Công nợ phải trả"
                size="small"
                extra={
                  <Link href="/cong-no-phai-tra">
                    Xem tất cả <ArrowRightOutlined />
                  </Link>
                }
              >
                {congNoBoc.length === 0 ? (
                  <Empty description="Không có công nợ" />
                ) : (
                  <List
                    dataSource={congNoBoc}
                    renderItem={(c) => (
                      <List.Item>
                        <Link href={`/cong-no-phai-tra/chi-tiet?id=${c.nguoiBocHangId}`} style={{ width: "100%" }}>
                          <Space style={{ justifyContent: "space-between", width: "100%" }}>
                            <Typography.Text strong>
                              {nguoiBocHangMap.get(c.nguoiBocHangId)?.hoTen ?? "—"}
                            </Typography.Text>
                            <SoTien value={c.tongConNo} mau="#C0392B" />
                          </Space>
                        </Link>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <MobileTongQuan
          tongHop={tongHop}
          chuyenGanDay={chuyenGanDay}
          congNoKhach={congNoKhach}
          congNoBoc={congNoBoc}
          xeMap={xeMap}
          taiXeMap={taiXeMap}
          khachHangMap={khachHangMap}
          nguoiBocHangMap={nguoiBocHangMap}
          loaiFilter={loaiFilter}
          tuyChon={tuyChon}
          onChonMocThoiGian={setLoaiFilter}
          onChonKhoangTuyChon={(khoang) => {
            setTuyChon(khoang);
            setLoaiFilter("khoang_tuy_chon");
          }}
        />
      )}
    </div>
  );
}
