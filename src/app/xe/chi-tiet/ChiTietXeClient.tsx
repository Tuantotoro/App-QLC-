"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Typography, Card, Table, Button, Result, Space, Tag, Row, Col, Statistic } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";
import { useData } from "@/store/DataContext";
import SoTien from "@/components/shared/SoTien";
import { formatTien, formatNgay } from "@/utils/calc";
import {
  tinhBangKhauHao,
  tinhBangTraNo,
  tinhChiPhiCoDinhXeThang,
  type DongKhauHao,
  type DongTraNo,
} from "@/utils/khauHaoVay";
import type { ColumnsType } from "antd/es/table";

const HOM_NAY = dayjs().format("YYYY-MM-DD");

export default function ChiTietXeClient() {
  const params = useSearchParams();
  const xeId = params.get("id");
  const { data } = useData();

  const xe = xeId ? data.xeList.find((x) => x.id === xeId) : undefined;

  const bangKhauHao = useMemo(
    () => (xe?.thongTinMua ? tinhBangKhauHao(xe.thongTinMua) : []),
    [xe]
  );
  const bangTraNo = useMemo(
    () => (xe?.thongTinMua?.vayVon ? tinhBangTraNo(xe.thongTinMua.vayVon) : []),
    [xe]
  );
  const chiPhiThang = useMemo(() => tinhChiPhiCoDinhXeThang(xe?.thongTinMua), [xe]);

  if (!xeId || !xe) {
    return (
      <Result
        status="404"
        title="Không tìm thấy xe"
        extra={
          <Link href="/xe">
            <Button type="primary">Về danh sách xe</Button>
          </Link>
        }
      />
    );
  }

  const mua = xe.thongTinMua;

  const cotKhauHao: ColumnsType<DongKhauHao> = [
    { title: "Tháng", dataIndex: "thang", width: 70 },
    { title: "Đến ngày", dataIndex: "ngay", render: (v) => formatNgay(v) },
    { title: "Khấu hao/tháng", dataIndex: "khauHaoThang", render: (v) => formatTien(v) },
    { title: "Khấu hao lũy kế", dataIndex: "khauHaoLuyKe", render: (v) => formatTien(v) },
    { title: "Giá trị còn lại", dataIndex: "giaTriConLai", render: (v) => formatTien(v) },
  ];

  const cotTraNo: ColumnsType<DongTraNo> = [
    { title: "Kỳ", dataIndex: "thang", width: 60 },
    { title: "Đến hạn", dataIndex: "ngay", render: (v) => formatNgay(v) },
    { title: "Dư nợ đầu kỳ", dataIndex: "duNoDau", render: (v) => formatTien(v) },
    { title: "Trả gốc", dataIndex: "traGoc", render: (v) => formatTien(v) },
    { title: "Trả lãi", dataIndex: "traLai", render: (v) => formatTien(v) },
    {
      title: "Tổng trả",
      key: "tong",
      render: (_, r) => <strong>{formatTien(r.traGoc + r.traLai)}</strong>,
    },
    { title: "Dư nợ cuối kỳ", dataIndex: "duNoCuoi", render: (v) => formatTien(v) },
  ];

  // Kỳ tương ứng thời điểm hiện tại - để tô đậm hàng đang chạy trong bảng.
  const thangKhauHaoHienTai = mua
    ? Math.min(
        Math.max(1, dayjs(HOM_NAY).diff(dayjs(mua.ngayMua), "month") + 1),
        bangKhauHao.length
      )
    : 0;
  const kyTraNoHienTai = mua?.vayVon
    ? Math.min(
        Math.max(1, dayjs(HOM_NAY).diff(dayjs(mua.vayVon.ngayGiaiNgan), "month") + 1),
        bangTraNo.length
      )
    : 0;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link href="/xe">
          <Button icon={<ArrowLeftOutlined />}>Về danh sách xe</Button>
        </Link>
      </Space>

      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {xe.bienSo}
      </Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        {xe.dangHoatDong ? <Tag color="green">Đang hoạt động</Tag> : <Tag>Ngừng hoạt động</Tag>}
      </Space>

      {!mua ? (
        <Result
          status="info"
          title="Xe này chưa nhập thông tin mua xe"
          subTitle="Vào danh sách Xe, bấm sửa để nhập giá mua & khấu hao (và vay vốn nếu có)."
          extra={
            <Link href="/xe">
              <Button type="primary">Đi tới danh sách Xe</Button>
            </Link>
          }
        />
      ) : (
        <>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic title="Giá mua" value={formatTien(mua.giaMua)} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Khấu hao / tháng"
                  value={formatTien(chiPhiThang.khauHaoThang)}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Lãi vay / tháng (hiện tại)"
                  value={chiPhiThang.laiVayThang > 0 ? formatTien(chiPhiThang.laiVayThang) : "—"}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  Tổng chi phí cố định / tháng
                </Typography.Text>
                <div>
                  <SoTien value={chiPhiThang.tongChiPhi} size={20} />
                </div>
              </Col>
            </Row>
          </Card>

          <Card
            size="small"
            title={`Bảng khấu hao (${mua.soNamKhauHao} năm, mua ngày ${formatNgay(mua.ngayMua)})`}
            style={{ marginBottom: 16 }}
          >
            <div className="scroll-ngang">
              <Table
                rowKey="thang"
                dataSource={bangKhauHao}
                columns={cotKhauHao}
                size="small"
                pagination={{ pageSize: 12, defaultCurrent: Math.ceil(thangKhauHaoHienTai / 12) }}
                rowClassName={(r) => (r.thang === thangKhauHaoHienTai ? "hang-hien-tai" : "")}
              />
            </div>
          </Card>

          {mua.vayVon ? (
            <Card
              size="small"
              title={`Bảng trả nợ vay (${
                mua.vayVon.phuongThuc === "tra_deu_hang_thang"
                  ? "trả đều hàng tháng"
                  : "dư nợ giảm dần"
              } - ${mua.vayVon.laiSuatNamPhanTram}%/năm, ${mua.vayVon.soThangVay} tháng)`}
            >
              <div className="scroll-ngang">
                <Table
                  rowKey="thang"
                  dataSource={bangTraNo}
                  columns={cotTraNo}
                  size="small"
                  pagination={{ pageSize: 12, defaultCurrent: Math.ceil(kyTraNoHienTai / 12) }}
                  rowClassName={(r) => (r.thang === kyTraNoHienTai ? "hang-hien-tai" : "")}
                  summary={() => {
                    const tongLai = bangTraNo.reduce((s, r) => s + r.traLai, 0);
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={4}>
                          <strong>Tổng lãi phải trả cả khoản vay</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong>{formatTien(tongLai)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} colSpan={2} />
                      </Table.Summary.Row>
                    );
                  }}
                />
              </div>
            </Card>
          ) : (
            <Typography.Text type="secondary">Xe này không có thông tin vay vốn.</Typography.Text>
          )}
        </>
      )}
    </div>
  );
}
