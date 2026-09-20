"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Drawer,
  Form,
  Input,
  Switch,
  Typography,
  Space,
  Popconfirm,
  Empty,
  Grid,
  App,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType, ColumnType } from "antd/es/table";

const { useBreakpoint } = Grid;

export interface TruongForm {
  key: string;
  label: string;
  type?: "text" | "textarea" | "switch";
  required?: boolean;
}

export type GiaTriForm = Record<string, string | boolean | undefined>;

interface Props<T extends { id: string }> {
  tieuDe: string;
  moTa?: string;
  duLieu: T[];
  truongForm: TruongForm[];
  cotHienThi: ColumnsType<T>;
  onThem: (values: GiaTriForm) => void;
  onSua: (id: string, values: GiaTriForm) => void;
  onXoa: (id: string) => void;
  demSuDung?: (id: string) => number;
  /** Trả về lý do nếu mục KHÔNG được phép xóa (VD: đã có dữ liệu liên quan); null nếu xóa được. */
  chanXoa?: (id: string) => string | null;
  /** Giá trị điền sẵn khi mở form "Thêm mới" (VD: bật sẵn công tắc "Đang sử dụng"). */
  giaTriMacDinh?: GiaTriForm;
  nhanThem?: string;
}

export default function DanhMucCrud<T extends { id: string }>({
  tieuDe,
  moTa,
  duLieu,
  truongForm,
  cotHienThi,
  onThem,
  onSua,
  onXoa,
  demSuDung,
  chanXoa,
  giaTriMacDinh,
  nhanThem = "Thêm mới",
}: Props<T>) {
  const [modalMo, setModalMo] = useState(false);
  const [dangSuaId, setDangSuaId] = useState<string | null>(null);
  const [tuKhoa, setTuKhoa] = useState("");
  const [form] = Form.useForm<GiaTriForm>();
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  function moModalThem() {
    setDangSuaId(null);
    form.resetFields();
    if (giaTriMacDinh) form.setFieldsValue(giaTriMacDinh);
    setModalMo(true);
  }

  function moModalSua(item: T) {
    setDangSuaId(item.id);
    form.setFieldsValue(item as unknown as GiaTriForm);
    setModalMo(true);
  }

  function xuLyLuu() {
    form.validateFields().then((values) => {
      if (dangSuaId) {
        onSua(dangSuaId, values);
        message.success("Đã cập nhật.");
      } else {
        onThem(values);
        message.success("Đã thêm mới.");
      }
      setModalMo(false);
    });
  }

  function xacNhanXoa(item: T) {
    const lyDoChan = chanXoa?.(item.id);
    if (lyDoChan) {
      message.warning(lyDoChan);
      return;
    }
    onXoa(item.id);
    message.success("Đã xóa.");
  }

  const cotHanhDong: ColumnsType<T> = [
    {
      title: "",
      key: "hanh-dong",
      width: 100,
      render: (_, item) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => moModalSua(item)} />
          <Popconfirm
            title={chanXoa?.(item.id) ? "Không thể xóa mục này" : "Xóa mục này?"}
            description={
              chanXoa?.(item.id)
                ? chanXoa(item.id)
                : demSuDung && demSuDung(item.id) > 0
                ? `Đang được dùng trong ${demSuDung(item.id)} chuyến. Vẫn xóa?`
                : "Hành động này không thể hoàn tác."
            }
            onConfirm={() => xacNhanXoa(item)}
            okText={chanXoa?.(item.id) ? "Đã hiểu" : "Xóa"}
            cancelText="Hủy"
            showCancel={!chanXoa?.(item.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  function giaTriAnToan(node: unknown): React.ReactNode {
    if (node && typeof node === "object" && "children" in (node as Record<string, unknown>)) {
      return (node as { children: React.ReactNode }).children;
    }
    return node as React.ReactNode;
  }

  const duLieuDaLoc = useMemo(() => {
    if (!tuKhoa.trim()) return duLieu;
    const tu = tuKhoa.toLowerCase();
    return duLieu.filter((item) => {
      const chuoi = Object.values(item as Record<string, unknown>)
        .filter((v) => typeof v === "string" || typeof v === "number")
        .join(" ")
        .toLowerCase();
      return chuoi.includes(tu);
    });
  }, [duLieu, tuKhoa]);

  const formNoiDung = (
    <Form form={form} layout="vertical">
      {truongForm.map((tf) => (
        <Form.Item
          key={tf.key}
          name={tf.key}
          label={tf.label}
          valuePropName={tf.type === "switch" ? "checked" : "value"}
          rules={tf.required ? [{ required: true, message: `Vui lòng nhập ${tf.label.toLowerCase()}` }] : []}
        >
          {tf.type === "switch" ? (
            <Switch />
          ) : tf.type === "textarea" ? (
            <Input.TextArea rows={2} />
          ) : (
            <Input />
          )}
        </Form.Item>
      ))}
    </Form>
  );

  return (
    <div>
      <Space
        style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}
        align="start"
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {tieuDe}
          </Typography.Title>
          {moTa && <Typography.Text type="secondary">{moTa}</Typography.Text>}
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={moModalThem}>
          {nhanThem}
        </Button>
      </Space>

      {!isDesktop ? (
        <>
          <div className="mobile-chuyen-searchbar">
            <Input
              placeholder={`Tìm ${tieuDe.toLowerCase()}...`}
              prefix={<SearchOutlined style={{ color: "#8a8672" }} />}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              allowClear
              style={{ flex: 1, borderRadius: 10 }}
            />
          </div>

          {duLieuDaLoc.length === 0 ? (
            <Empty description="Không tìm thấy mục nào" style={{ margin: "32px 0" }} />
          ) : (
            <div className="mobile-crud-list">
              {duLieuDaLoc.map((item, index) => {
                const [cotDauTien, ...cotConLai] = cotHienThi as ColumnType<T>[];
                const layGiaTri = (col: ColumnType<T>) => {
                  const value = col.dataIndex ? (item as Record<string, unknown>)[col.dataIndex as string] : undefined;
                  return col.render ? col.render(value, item, index) : (value as React.ReactNode);
                };
                const soLuongDung = demSuDung?.(item.id) ?? 0;
                return (
                  <div key={item.id} className="mobile-crud-card">
                    <div className="mobile-crud-card-top">
                      <div className="mobile-crud-card-title">
                        {cotDauTien ? giaTriAnToan(layGiaTri(cotDauTien)) : null}
                      </div>
                      <div className="mobile-crud-card-actions">
                        <Button size="small" icon={<EditOutlined />} onClick={() => moModalSua(item)} />
                        <Popconfirm
                          title={chanXoa?.(item.id) ? "Không thể xóa mục này" : "Xóa mục này?"}
                          description={
                            chanXoa?.(item.id)
                              ? chanXoa(item.id)
                              : soLuongDung > 0
                              ? `Đang được dùng trong ${soLuongDung} chuyến. Vẫn xóa?`
                              : "Hành động này không thể hoàn tác."
                          }
                          onConfirm={() => xacNhanXoa(item)}
                          okText={chanXoa?.(item.id) ? "Đã hiểu" : "Xóa"}
                          cancelText="Hủy"
                          showCancel={!chanXoa?.(item.id)}
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </div>
                    </div>
                    {cotConLai.map((col, i) => {
                      const gt = giaTriAnToan(layGiaTri(col));
                      if (gt === undefined || gt === null || gt === "") return null;
                      return (
                        <div key={i} className="mobile-crud-card-row">
                          <span className="mobile-crud-card-label">{col.title as React.ReactNode}:</span>
                          <span className="mobile-crud-card-value">{gt}</span>
                        </div>
                      );
                    })}
                    {demSuDung && (
                      <div className="mobile-crud-card-usage">
                        Dùng trong {soLuongDung} chuyến
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Drawer
            title={dangSuaId ? "Sửa thông tin" : nhanThem}
            placement="bottom"
            open={modalMo}
            onClose={() => setModalMo(false)}
            height="auto"
            styles={{ body: { paddingBottom: 24 } }}
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
              dataSource={duLieu}
              columns={[...cotHienThi, ...cotHanhDong]}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </div>

          <Modal
            title={dangSuaId ? "Sửa thông tin" : nhanThem}
            open={modalMo}
            onCancel={() => setModalMo(false)}
            onOk={xuLyLuu}
            okText="Lưu"
            cancelText="Hủy"
          >
            {formNoiDung}
          </Modal>
        </>
      )}
    </div>
  );
}

