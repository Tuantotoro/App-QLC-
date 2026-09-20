"use client";

import React, { useState } from "react";
import {
  Tag,
  Table,
  Button,
  Modal,
  Drawer,
  Space,
  Popconfirm,
  Empty,
  Grid,
  Typography,
  Input,
  App,
  Form,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CalendarOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useData } from "@/store/DataContext";
import XeForm, {
  xeSangGiaTriForm,
  giaTriFormSangXePatch,
  type XeFormInternalShape,
} from "@/components/xe/XeForm";
import SoTien from "@/components/shared/SoTien";
import { layCacChieuCuaChuyen } from "@/utils/calc";
import { tinhChiPhiCoDinhXeThang } from "@/utils/khauHaoVay";
import type { Xe } from "@/types";

const { useBreakpoint } = Grid;

export default function XePage() {
  const { data, themXe, capNhatXe, xoaXe } = useData();
  const [form] = Form.useForm<XeFormInternalShape>();
  const [modalMo, setModalMo] = useState(false);
  const [dangSuaId, setDangSuaId] = useState<string | null>(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  function demSuDung(id: string) {
    return data.chuyenList.filter((c) =>
      layCacChieuCuaChuyen(c).some((ch) => ch.duLieu.xeId === id)
    ).length;
  }

  function moModalThem() {
    setDangSuaId(null);
    form.resetFields();
    form.setFieldsValue(xeSangGiaTriForm(undefined));
    setModalMo(true);
  }

  function moModalSua(xe: Xe) {
    setDangSuaId(xe.id);
    form.setFieldsValue(xeSangGiaTriForm(xe));
    setModalMo(true);
  }

  function xuLyLuu() {
    form.validateFields().then((values) => {
      const patch = giaTriFormSangXePatch(values);
      if (dangSuaId) {
        capNhatXe(dangSuaId, patch);
        message.success("Đã cập nhật.");
      } else {
        themXe(patch);
        message.success("Đã thêm mới.");
      }
      setModalMo(false);
    });
  }

  function xacNhanXoa(xe: Xe) {
    xoaXe(xe.id);
    message.success("Đã xóa.");
  }

  const duLieuDaLoc = data.xeList.filter((xe) =>
    tuKhoa.trim() ? xe.bienSo.toLowerCase().includes(tuKhoa.toLowerCase()) : true
  );

  function formatShort(n: number) {
    return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
  }

  const cotHienThi: ColumnsType<Xe> = [
    {
      title: "Biển số",
      dataIndex: "bienSo",
      render: (v, xe) =>
        xe.thongTinMua ? <Link href={`/xe/chi-tiet/?id=${xe.id}`}>{v}</Link> : v,
    },
    {
      title: "Trạng thái",
      dataIndex: "dangHoatDong",
      render: (v) => (v ? <Tag color="green">Đang hoạt động</Tag> : <Tag>Ngừng hoạt động</Tag>),
    },
    {
      title: "Chi phí cố định / tháng",
      key: "chiPhi",
      render: (_, xe) => {
        if (!xe.thongTinMua) return <Typography.Text type="secondary">—</Typography.Text>;
        const cp = tinhChiPhiCoDinhXeThang(xe.thongTinMua);
        return (
          <div>
            <SoTien value={cp.tongChiPhi} size={13} />
            <div style={{ fontSize: 12, color: "#8a8672" }}>
              Khấu hao {cp.khauHaoThang > 0 ? formatShort(cp.khauHaoThang) : "đã hết"}
              {cp.laiVayThang > 0 ? ` · Lãi vay ${formatShort(cp.laiVayThang)}` : ""}
            </div>
          </div>
        );
      },
    },
    { title: "Ghi chú", dataIndex: "ghiChu", render: (v) => v || "—" },
  ];

  const cotHanhDong: ColumnsType<Xe> = [
    {
      title: "",
      key: "hanh-dong",
      width: 100,
      render: (_, xe) => (
        <Space>
          {xe.thongTinMua && (
            <Link href={`/xe/chi-tiet/?id=${xe.id}`}>
              <Button size="small" icon={<CalendarOutlined />} title="Xem lịch khấu hao / trả nợ" />
            </Link>
          )}
          <Button size="small" icon={<EditOutlined />} onClick={() => moModalSua(xe)} />
          <Popconfirm
            title="Xóa xe này?"
            description={
              demSuDung(xe.id) > 0
                ? `Đang được dùng trong ${demSuDung(xe.id)} chuyến. Vẫn xóa?`
                : "Hành động này không thể hoàn tác."
            }
            onConfirm={() => xacNhanXoa(xe)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const formNoiDung = <XeForm form={form} />;

  return (
    <div>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} align="start">
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Xe
          </Typography.Title>
          <Typography.Text type="secondary">
            Danh sách xe đang sử dụng để vận chuyển - có thể theo dõi khấu hao & lãi vay mua xe
          </Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={moModalThem}>
          Thêm xe
        </Button>
      </Space>

      {!isDesktop ? (
        <>
          <div className="mobile-chuyen-searchbar">
            <Input
              placeholder="Tìm xe..."
              prefix={<SearchOutlined style={{ color: "#8a8672" }} />}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              allowClear
              style={{ flex: 1, borderRadius: 10 }}
            />
          </div>

          {duLieuDaLoc.length === 0 ? (
            <Empty description="Không tìm thấy xe nào" style={{ margin: "32px 0" }} />
          ) : (
            <div className="mobile-crud-list">
              {duLieuDaLoc.map((xe) => {
                const cp = tinhChiPhiCoDinhXeThang(xe.thongTinMua);
                const soLuongDung = demSuDung(xe.id);
                return (
                  <div key={xe.id} className="mobile-crud-card">
                    <div className="mobile-crud-card-top">
                      <div className="mobile-crud-card-title">
                        {xe.thongTinMua ? (
                          <Link href={`/xe/chi-tiet/?id=${xe.id}`}>{xe.bienSo}</Link>
                        ) : (
                          xe.bienSo
                        )}
                      </div>
                      <div className="mobile-crud-card-actions">
                        <Button size="small" icon={<EditOutlined />} onClick={() => moModalSua(xe)} />
                        <Popconfirm
                          title="Xóa xe này?"
                          description={
                            soLuongDung > 0
                              ? `Đang được dùng trong ${soLuongDung} chuyến. Vẫn xóa?`
                              : "Hành động này không thể hoàn tác."
                          }
                          onConfirm={() => xacNhanXoa(xe)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </div>
                    </div>
                    <div className="mobile-crud-card-row">
                      <span className="mobile-crud-card-label">Trạng thái:</span>
                      <span className="mobile-crud-card-value">
                        {xe.dangHoatDong ? <Tag color="green">Đang hoạt động</Tag> : <Tag>Ngừng hoạt động</Tag>}
                      </span>
                    </div>
                    {xe.thongTinMua && (
                      <div className="mobile-crud-card-row">
                        <span className="mobile-crud-card-label">Chi phí/tháng:</span>
                        <span className="mobile-crud-card-value">
                          <SoTien value={cp.tongChiPhi} size={13} /> ({formatShort(cp.khauHaoThang)} khấu hao
                          {cp.laiVayThang > 0 ? ` + ${formatShort(cp.laiVayThang)} lãi vay` : ""})
                        </span>
                      </div>
                    )}
                    {xe.ghiChu && (
                      <div className="mobile-crud-card-row">
                        <span className="mobile-crud-card-label">Ghi chú:</span>
                        <span className="mobile-crud-card-value">{xe.ghiChu}</span>
                      </div>
                    )}
                    <div className="mobile-crud-card-usage">Dùng trong {soLuongDung} chuyến</div>
                  </div>
                );
              })}
            </div>
          )}

          <Drawer
            title={dangSuaId ? "Sửa thông tin xe" : "Thêm xe"}
            placement="bottom"
            open={modalMo}
            onClose={() => setModalMo(false)}
            height="auto"
            styles={{ body: { paddingBottom: 24, maxHeight: "80vh", overflowY: "auto" } }}
          >
            {formNoiDung}
            <Space style={{ width: "100%", justifyContent: "flex-end", marginTop: 8 }}>
              <Button onClick={() => setModalMo(false)}>Hủy</Button>
              <Button type="primary" onClick={xuLyLuu}>
                Lưu
              </Button>
            </Space>
          </Drawer>
        </>
      ) : (
        <>
          <div className="scroll-ngang">
            <Table
              rowKey="id"
              dataSource={duLieuDaLoc}
              columns={[...cotHienThi, ...cotHanhDong]}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </div>

          <Modal
            title={dangSuaId ? "Sửa thông tin xe" : "Thêm xe"}
            open={modalMo}
            onCancel={() => setModalMo(false)}
            onOk={xuLyLuu}
            okText="Lưu"
            cancelText="Hủy"
            width={640}
            styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
          >
            {formNoiDung}
          </Modal>
        </>
      )}
    </div>
  );
}
