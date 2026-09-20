"use client";

import React from "react";
import { Typography, Card, Button, Space, App, Statistic, Row, Col } from "antd";
import { ReloadOutlined, ClearOutlined } from "@ant-design/icons";
import { useData } from "@/store/DataContext";

export default function CaiDatPage() {
  const { data, khoiPhucDuLieuMau, xoaTatCaDuLieu } = useData();
  const { modal, message } = App.useApp();

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Cài đặt dữ liệu mẫu
      </Typography.Title>
      <Typography.Text type="secondary">
        Đây là bản prototype UI — dữ liệu được lưu trong localStorage của trình duyệt, chưa kết nối
        database thật.
      </Typography.Text>

      <Card size="small" style={{ marginTop: 16, marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Statistic title="Xe" value={data.xeList.length} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="Tài xế" value={data.taiXeList.length} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="Khách hàng" value={data.khachHangList.length} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="Loại hàng" value={data.loaiHangList.length} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="Người bốc hàng" value={data.nguoiBocHangList.length} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="Tài khoản ngân hàng" value={data.taiKhoanNganHangList.length} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="Chuyến" value={data.chuyenList.length} />
          </Col>
        </Row>
      </Card>

      <Card size="small">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Typography.Text strong>Khôi phục dữ liệu mẫu</Typography.Text>
            <div>
              <Typography.Text type="secondary">
                Nạp lại toàn bộ dữ liệu mẫu ban đầu (sẽ ghi đè dữ liệu hiện tại).
              </Typography.Text>
            </div>
            <Button
              icon={<ReloadOutlined />}
              style={{ marginTop: 8 }}
              onClick={() => {
                modal.confirm({
                  title: "Khôi phục dữ liệu mẫu?",
                  content: "Toàn bộ dữ liệu hiện tại sẽ bị thay thế bằng dữ liệu mẫu ban đầu.",
                  okText: "Khôi phục",
                  cancelText: "Hủy",
                  onOk: () => {
                    khoiPhucDuLieuMau();
                    message.success("Đã khôi phục dữ liệu mẫu.");
                  },
                });
              }}
            >
              Khôi phục dữ liệu mẫu
            </Button>
          </div>
          <div>
            <Typography.Text strong>Xóa toàn bộ dữ liệu</Typography.Text>
            <div>
              <Typography.Text type="secondary">
                Xóa hết để thử nghiệm nhập liệu từ đầu như một app mới.
              </Typography.Text>
            </div>
            <Button
              danger
              icon={<ClearOutlined />}
              style={{ marginTop: 8 }}
              onClick={() => {
                modal.confirm({
                  title: "Xóa toàn bộ dữ liệu?",
                  content: "Hành động này không thể hoàn tác.",
                  okText: "Xóa hết",
                  okButtonProps: { danger: true },
                  cancelText: "Hủy",
                  onOk: () => {
                    xoaTatCaDuLieu();
                    message.success("Đã xóa toàn bộ dữ liệu.");
                  },
                });
              }}
            >
              Xóa toàn bộ dữ liệu
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}
