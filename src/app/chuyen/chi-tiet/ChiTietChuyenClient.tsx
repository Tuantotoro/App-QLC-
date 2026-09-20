"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Typography,
  Card,
  Row,
  Col,
  Table,
  Space,
  Button,
  Result,
  Popconfirm,
  Tag,
  Divider,
  App,
  List,
  Grid,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useData, useLookup } from "@/store/DataContext";
import {
  tinhDaThuHang,
  tinhConPhaiThuHang,
  tinhTrangThaiThanhToanHang,
  tinhTongGiaTriHangChuyen,
  tinhTongPhaiThuChuyen,
  tinhTongDaThuChuyen,
  tinhTongConPhaiThuChuyen,
  tinhTongChiPhiChuyen,
  tinhTongPhaiTraBocHangChuyen,
  tinhLoiNhuanChuyen,
  tinhDaTraCongNoBocHang,
  tinhConNoCongNoBocHang,
  tinhTrangThaiCongNoBocHang,
  laChuyenKhuHoi,
  formatNgay,
  formatTien,
} from "@/utils/calc";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import ModalGhiNhanThanhToan from "@/components/shared/ModalGhiNhanThanhToan";
import LichSuThanhToan from "@/components/shared/LichSuThanhToan";
import MobileDanhSachHangChuyen from "@/components/chuyen/MobileDanhSachHangChuyen";
import MobileDanhSachBocHangChuyen from "@/components/chuyen/MobileDanhSachBocHangChuyen";
import type { HangTrenChuyen, CongNoBocHang, ChieuChuyen } from "@/types";

const { useBreakpoint } = Grid;

export default function ChiTietChuyenClient() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const screens = useBreakpoint();
  const isDesktop = screens.md;
  const {
    data,
    xoaChuyen,
    ghiNhanThanhToanKhach,
    xoaThanhToanKhach,
    ghiNhanThanhToanBocHang,
    xoaThanhToanBocHang,
  } = useData();
  const { xeMap, taiXeMap, khachHangMap, loaiHangMap, nguoiBocHangMap } = useLookup(data);
  const { message } = App.useApp();

  const chuyen = useMemo(() => data.chuyenList.find((c) => c.id === id), [data.chuyenList, id]);

  const [hangDangThanhToan, setHangDangThanhToan] = useState<HangTrenChuyen | null>(null);
  const [bocHangDangThanhToan, setBocHangDangThanhToan] = useState<CongNoBocHang | null>(null);

  if (!chuyen) {
    return (
      <Result
        status="404"
        title="Không tìm thấy chuyến"
        subTitle="Chuyến này có thể đã bị xóa hoặc đường dẫn không đúng."
        extra={
          <Link href="/chuyen">
            <Button type="primary">Về danh sách chuyến</Button>
          </Link>
        }
      />
    );
  }

  const cotHang = [
    {
      title: "Khách hàng",
      dataIndex: "khachHangId",
      render: (v: string, h: HangTrenChuyen) => (
        <div>
          <div>{khachHangMap.get(v)?.hoTen ?? "—"}</div>
          {h.ghiChu && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {h.ghiChu}
            </Typography.Text>
          )}
        </div>
      ),
    },
    {
      title: "Loại hàng",
      dataIndex: "loaiHangId",
      render: (v: string) => loaiHangMap.get(v)?.ten ?? "—",
    },
    {
      title: "Số lượng",
      render: (_: unknown, h: HangTrenChuyen) =>
        `${new Intl.NumberFormat("vi-VN").format(h.soLuong)} ${h.donVi}`,
    },
    {
      title: "Giá trị hàng",
      dataIndex: "giaTriHang",
      render: (v: number) => <SoTien value={v} />,
    },
    {
      title: "Khách phải trả",
      dataIndex: "tienKhachPhaiTra",
      render: (v: number) => <SoTien value={v} />,
    },
    {
      title: "Đã thu",
      render: (_: unknown, h: HangTrenChuyen) => <SoTien value={tinhDaThuHang(h)} mau="#1B7A43" />,
    },
    {
      title: "Còn phải thu",
      render: (_: unknown, h: HangTrenChuyen) => {
        const con = tinhConPhaiThuHang(h);
        return <SoTien value={con} mau={con > 0 ? "#C0392B" : "#1B7A43"} />;
      },
    },
    {
      title: "Trạng thái",
      render: (_: unknown, h: HangTrenChuyen) => <TrangThaiTag trangThai={tinhTrangThaiThanhToanHang(h)} />,
    },
    {
      title: "",
      render: (_: unknown, h: HangTrenChuyen) => (
        <Button size="small" icon={<DollarOutlined />} onClick={() => setHangDangThanhToan(h)}>
          Ghi nhận
        </Button>
      ),
    },
  ];

  const laKhuHoi = laChuyenKhuHoi(chuyen);

  function renderChieu(duLieu: ChieuChuyen, nhan: string, mauTag: string, ngay: string) {
    return (
      <div key={nhan} style={{ marginBottom: 8 }}>
        <Divider titlePlacement="left">
          <Space>
            <Tag color={mauTag} style={{ fontSize: 13, padding: "2px 10px" }}>
              {nhan}
            </Tag>
            <Typography.Text strong>{xeMap.get(duLieu.xeId)?.bienSo ?? "—"}</Typography.Text>
            <Typography.Text type="secondary">
              Tài xế: {taiXeMap.get(duLieu.taiXeId)?.hoTen ?? "—"} · Ngày: {formatNgay(ngay)}
            </Typography.Text>
          </Space>
        </Divider>
        {duLieu.ghiChu && (
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            Ghi chú: {duLieu.ghiChu}
          </Typography.Text>
        )}

        <Card title={`Hàng trên xe - ${nhan}`} size="small" style={{ marginBottom: 16 }}>
          {isDesktop ? (
            <div className="scroll-ngang">
              <Table
                rowKey="id"
                dataSource={duLieu.danhSachHang}
                columns={cotHang}
                pagination={false}
                size="small"
                expandable={{
                  expandedRowRender: (h: HangTrenChuyen) => (
                    <LichSuThanhToan
                      danhSach={h.danhSachThanhToan}
                      onXoa={(thanhToanId) => {
                        xoaThanhToanKhach(chuyen!.id, h.id, thanhToanId);
                        message.success("Đã xóa lần thanh toán.");
                      }}
                    />
                  ),
                  rowExpandable: () => true,
                }}
              />
            </div>
          ) : (
            <MobileDanhSachHangChuyen
              danhSachHang={duLieu.danhSachHang}
              khachHangMap={khachHangMap}
              loaiHangMap={loaiHangMap}
              onGhiNhan={(h) => setHangDangThanhToan(h)}
              onXoaThanhToan={(hangId, thanhToanId) => {
                xoaThanhToanKhach(chuyen!.id, hangId, thanhToanId);
                message.success("Đã xóa lần thanh toán.");
              }}
            />
          )}
        </Card>

        <Card title={`Chi phí - ${nhan}`} size="small" style={{ marginBottom: 16 }}>
          {duLieu.danhSachChiPhi.length === 0 ? (
            <Typography.Text type="secondary">Chưa có chi phí nào.</Typography.Text>
          ) : (
            <List
              dataSource={duLieu.danhSachChiPhi}
              renderItem={(cp) => (
                <List.Item>
                  <Space style={{ justifyContent: "space-between", width: "100%" }}>
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{cp.tenChiPhi}</Typography.Text>
                      {cp.ghiChu && <Typography.Text type="secondary">{cp.ghiChu}</Typography.Text>}
                    </Space>
                    <SoTien value={cp.soTien} mau="#C58A00" />
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Card>

        {duLieu.danhSachCongNoBocHang.length > 0 && (
          <Card title={`Người bốc hàng - công nợ phải trả - ${nhan}`} size="small" style={{ marginBottom: 16 }}>
            {isDesktop ? (
              <List
                dataSource={duLieu.danhSachCongNoBocHang}
                renderItem={(cn) => {
                  const conNo = tinhConNoCongNoBocHang(cn);
                  return (
                    <List.Item
                      actions={[
                        <Button
                          key="tra"
                          size="small"
                          icon={<DollarOutlined />}
                          onClick={() => setBocHangDangThanhToan(cn)}
                        >
                          Trả tiền
                        </Button>,
                      ]}
                    >
                      <Space direction="vertical" size={4} style={{ width: "100%" }}>
                        <Space style={{ justifyContent: "space-between", width: "100%" }}>
                          <Typography.Text strong>
                            {nguoiBocHangMap.get(cn.nguoiBocHangId)?.hoTen ?? "—"}
                          </Typography.Text>
                          <TrangThaiTag trangThai={tinhTrangThaiCongNoBocHang(cn)} kieu="tra" />
                        </Space>
                        <Row gutter={12} style={{ width: "100%" }}>
                          <Col>
                            Phải trả: <SoTien value={cn.soTienPhaiTra} />
                          </Col>
                          <Col>
                            Đã trả: <SoTien value={tinhDaTraCongNoBocHang(cn)} mau="#1B7A43" />
                          </Col>
                          <Col>
                            Còn nợ: <SoTien value={conNo} mau={conNo > 0 ? "#C0392B" : "#1B7A43"} />
                          </Col>
                        </Row>
                        {cn.danhSachThanhToan.length > 0 && (
                          <div style={{ width: "100%" }}>
                            <LichSuThanhToan
                              danhSach={cn.danhSachThanhToan}
                              onXoa={(thanhToanId) => {
                                xoaThanhToanBocHang(chuyen!.id, cn.id, thanhToanId);
                                message.success("Đã xóa lần trả tiền.");
                              }}
                            />
                          </div>
                        )}
                      </Space>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <MobileDanhSachBocHangChuyen
                danhSach={duLieu.danhSachCongNoBocHang}
                nguoiBocHangMap={nguoiBocHangMap}
                onTraTien={(cn) => setBocHangDangThanhToan(cn)}
                onXoaThanhToan={(congNoId, thanhToanId) => {
                  xoaThanhToanBocHang(chuyen!.id, congNoId, thanhToanId);
                  message.success("Đã xóa lần trả tiền.");
                }}
              />
            )}
          </Card>
        )}
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link href="/chuyen">
          <Button icon={<ArrowLeftOutlined />}>Danh sách chuyến</Button>
        </Link>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="top" gutter={[12, 12]}>
          <Col>
            <Space align="center">
              <Typography.Title level={4} style={{ margin: 0 }}>
                {xeMap.get(chuyen.chieuDi.xeId)?.bienSo ?? "—"}
              </Typography.Title>
              {laKhuHoi && <Tag color="blue">Chuyến khứ hồi</Tag>}
            </Space>
            <Typography.Text type="secondary">
              Tài xế: {taiXeMap.get(chuyen.chieuDi.taiXeId)?.hoTen ?? "—"} · Ngày đi: {formatNgay(chuyen.ngay)}
              {laKhuHoi && chuyen.ngayVe && <> · Ngày về: {formatNgay(chuyen.ngayVe)}</>}
            </Typography.Text>
            {chuyen.ghiChu && (
              <div>
                <Typography.Text type="secondary">Ghi chú: {chuyen.ghiChu}</Typography.Text>
              </div>
            )}
          </Col>
          <Col>
            <Space>
              <Link href={`/chuyen/sua?id=${chuyen.id}`}>
                <Button icon={<EditOutlined />}>Sửa chuyến</Button>
              </Link>
              <Popconfirm
                title="Xóa chuyến này?"
                description="Toàn bộ dữ liệu hàng, chi phí, công nợ của cả 2 chiều sẽ bị xóa."
                onConfirm={() => {
                  xoaChuyen(chuyen.id);
                  message.success("Đã xóa chuyến.");
                  router.push("/chuyen");
                }}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Xóa chuyến
                </Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>
      </Card>

      {laKhuHoi ? (
        <>
          {renderChieu(chuyen.chieuDi, "Chiều đi", "blue", chuyen.ngay)}
          {chuyen.chieuVe && renderChieu(chuyen.chieuVe, "Chiều về", "purple", chuyen.ngayVe ?? chuyen.ngay)}
        </>
      ) : (
        <>
          <Card title="Hàng trên xe" size="small" style={{ marginBottom: 16 }}>
            {isDesktop ? (
              <div className="scroll-ngang">
                <Table
                  rowKey="id"
                  dataSource={chuyen.chieuDi.danhSachHang}
                  columns={cotHang}
                  pagination={false}
                  size="small"
                  expandable={{
                    expandedRowRender: (h: HangTrenChuyen) => (
                      <LichSuThanhToan
                        danhSach={h.danhSachThanhToan}
                        onXoa={(thanhToanId) => {
                          xoaThanhToanKhach(chuyen.id, h.id, thanhToanId);
                          message.success("Đã xóa lần thanh toán.");
                        }}
                      />
                    ),
                    rowExpandable: () => true,
                  }}
                />
              </div>
            ) : (
              <MobileDanhSachHangChuyen
                danhSachHang={chuyen.chieuDi.danhSachHang}
                khachHangMap={khachHangMap}
                loaiHangMap={loaiHangMap}
                onGhiNhan={(h) => setHangDangThanhToan(h)}
                onXoaThanhToan={(hangId, thanhToanId) => {
                  xoaThanhToanKhach(chuyen.id, hangId, thanhToanId);
                  message.success("Đã xóa lần thanh toán.");
                }}
              />
            )}
          </Card>

          <Card title="Chi phí" size="small" style={{ marginBottom: 16 }}>
            {chuyen.chieuDi.danhSachChiPhi.length === 0 ? (
              <Typography.Text type="secondary">Chưa có chi phí nào.</Typography.Text>
            ) : (
              <List
                dataSource={chuyen.chieuDi.danhSachChiPhi}
                renderItem={(cp) => (
                  <List.Item>
                    <Space style={{ justifyContent: "space-between", width: "100%" }}>
                      <Space direction="vertical" size={0}>
                        <Typography.Text strong>{cp.tenChiPhi}</Typography.Text>
                        {cp.ghiChu && <Typography.Text type="secondary">{cp.ghiChu}</Typography.Text>}
                      </Space>
                      <SoTien value={cp.soTien} mau="#C58A00" />
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>

          {chuyen.chieuDi.danhSachCongNoBocHang.length > 0 && (
            <Card title="Người bốc hàng - công nợ phải trả" size="small" style={{ marginBottom: 16 }}>
              {isDesktop ? (
                <List
                  dataSource={chuyen.chieuDi.danhSachCongNoBocHang}
                  renderItem={(cn) => {
                    const conNo = tinhConNoCongNoBocHang(cn);
                    return (
                      <List.Item
                        actions={[
                          <Button
                            key="tra"
                            size="small"
                            icon={<DollarOutlined />}
                            onClick={() => setBocHangDangThanhToan(cn)}
                          >
                            Trả tiền
                          </Button>,
                        ]}
                      >
                        <Space direction="vertical" size={4} style={{ width: "100%" }}>
                          <Space style={{ justifyContent: "space-between", width: "100%" }}>
                            <Typography.Text strong>
                              {nguoiBocHangMap.get(cn.nguoiBocHangId)?.hoTen ?? "—"}
                            </Typography.Text>
                            <TrangThaiTag trangThai={tinhTrangThaiCongNoBocHang(cn)} kieu="tra" />
                          </Space>
                          <Row gutter={12} style={{ width: "100%" }}>
                            <Col>
                              Phải trả: <SoTien value={cn.soTienPhaiTra} />
                            </Col>
                            <Col>
                              Đã trả: <SoTien value={tinhDaTraCongNoBocHang(cn)} mau="#1B7A43" />
                            </Col>
                            <Col>
                              Còn nợ: <SoTien value={conNo} mau={conNo > 0 ? "#C0392B" : "#1B7A43"} />
                            </Col>
                          </Row>
                          {cn.danhSachThanhToan.length > 0 && (
                            <div style={{ width: "100%" }}>
                              <LichSuThanhToan
                                danhSach={cn.danhSachThanhToan}
                                onXoa={(thanhToanId) => {
                                  xoaThanhToanBocHang(chuyen.id, cn.id, thanhToanId);
                                  message.success("Đã xóa lần trả tiền.");
                                }}
                              />
                            </div>
                          )}
                        </Space>
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <MobileDanhSachBocHangChuyen
                  danhSach={chuyen.chieuDi.danhSachCongNoBocHang}
                  nguoiBocHangMap={nguoiBocHangMap}
                  onTraTien={(cn) => setBocHangDangThanhToan(cn)}
                  onXoaThanhToan={(congNoId, thanhToanId) => {
                    xoaThanhToanBocHang(chuyen.id, congNoId, thanhToanId);
                    message.success("Đã xóa lần trả tiền.");
                  }}
                />
              )}
            </Card>
          )}
        </>
      )}

      {(() => {
        const doanhThu = tinhTongPhaiThuChuyen(chuyen);
        const chiPhi = tinhTongChiPhiChuyen(chuyen);
        const traBocHang = tinhTongPhaiTraBocHangChuyen(chuyen);
        const loiNhuan = tinhLoiNhuanChuyen(chuyen);
        const laLoiNhuanDuong = loiNhuan >= 0;
        const conPhaiThu = tinhTongConPhaiThuChuyen(chuyen);

        return (
          <div style={{ marginBottom: 16 }}>
            <Typography.Title level={5} style={{ margin: "0 0 10px" }}>
              Tổng kết chuyến
            </Typography.Title>

            <div className={`trip-summary-card ${laLoiNhuanDuong ? "loi-nhuan-duong" : "loi-nhuan-am"}`}>
              <div className="trip-summary-label">
                {laLoiNhuanDuong ? <RiseOutlined /> : <FallOutlined />}
                Lợi nhuận chuyến{laKhuHoi ? " (cả 2 chiều)" : ""}
              </div>
              <div className="trip-summary-value">{formatTien(loiNhuan)}</div>
              <div className="trip-summary-note">
                {laLoiNhuanDuong ? "Chuyến có lãi" : "Chuyến đang lỗ — chi phí vượt doanh thu"}
              </div>

              <div className="trip-summary-breakdown">
                <div className="trip-summary-row">
                  <span>Doanh thu (khách phải trả)</span>
                  <span>+ {formatTien(doanhThu)}</span>
                </div>
                <div className="trip-summary-row">
                  <span>Chi phí chuyến</span>
                  <span>− {formatTien(chiPhi)}</span>
                </div>
                {traBocHang > 0 && (
                  <div className="trip-summary-row">
                    <span>Trả người bốc hàng</span>
                    <span>− {formatTien(traBocHang)}</span>
                  </div>
                )}
                <div className="trip-summary-row trip-summary-row-total">
                  <span>Lợi nhuận</span>
                  <span>{formatTien(loiNhuan)}</span>
                </div>
              </div>
            </div>

            <div className="trip-summary-extra-grid">
              <div className="trip-summary-extra-item">
                <div className="trip-summary-extra-label">Tổng giá trị hàng</div>
                <div className="trip-summary-extra-value">{formatTien(tinhTongGiaTriHangChuyen(chuyen))}</div>
              </div>
              <div className="trip-summary-extra-item">
                <div className="trip-summary-extra-label">Đã thu</div>
                <div className="trip-summary-extra-value" style={{ color: "#1B7A43" }}>
                  {formatTien(tinhTongDaThuChuyen(chuyen))}
                </div>
              </div>
              <div className="trip-summary-extra-item" style={{ gridColumn: "1 / -1" }}>
                <div className="trip-summary-extra-label">Còn phải thu</div>
                <div
                  className="trip-summary-extra-value"
                  style={{ color: conPhaiThu > 0 ? "#C0392B" : "#1B7A43" }}
                >
                  {formatTien(conPhaiThu)}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <ModalGhiNhanThanhToan
        open={!!hangDangThanhToan}
        tieuDe={`Ghi nhận thanh toán - ${
          hangDangThanhToan ? khachHangMap.get(hangDangThanhToan.khachHangId)?.hoTen ?? "" : ""
        }`}
        moTaConLai="Còn phải thu"
        conLai={hangDangThanhToan ? tinhConPhaiThuHang(hangDangThanhToan) : 0}
        onDong={() => setHangDangThanhToan(null)}
        onXacNhan={(soTien, ghiChu, hinhThuc) => {
          if (hangDangThanhToan) {
            ghiNhanThanhToanKhach(chuyen.id, hangDangThanhToan.id, soTien, ghiChu, hinhThuc);
            message.success("Đã ghi nhận thanh toán.");
          }
        }}
      />

      <ModalGhiNhanThanhToan
        open={!!bocHangDangThanhToan}
        tieuDe={`Trả tiền - ${
          bocHangDangThanhToan ? nguoiBocHangMap.get(bocHangDangThanhToan.nguoiBocHangId)?.hoTen ?? "" : ""
        }`}
        moTaConLai="Còn nợ"
        conLai={bocHangDangThanhToan ? tinhConNoCongNoBocHang(bocHangDangThanhToan) : 0}
        nhanNutXacNhan="Xác nhận trả tiền"
        huong="tra"
        onDong={() => setBocHangDangThanhToan(null)}
        onXacNhan={(soTien, ghiChu, hinhThuc) => {
          if (bocHangDangThanhToan) {
            ghiNhanThanhToanBocHang(chuyen.id, bocHangDangThanhToan.id, soTien, ghiChu, hinhThuc);
            message.success("Đã ghi nhận trả tiền.");
          }
        }}
      />
    </div>
  );
}
