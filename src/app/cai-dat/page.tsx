"use client";

import React, { useEffect, useRef, useState } from "react";
import { Typography, Card, Button, Space, App, Statistic, Row, Col } from "antd";
import {
  ReloadOutlined,
  ClearOutlined,
  LogoutOutlined,
  DownloadOutlined,
  UploadOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { useData } from "@/store/DataContext";
import { docFileSaoLuu, taiXuongFileSaoLuu } from "@/utils/saoLuu";
import type { AppData } from "@/types";

function moTaDuLieu(d: AppData): string {
  return `${d.chuyenList.length} chuyến, ${d.khachHangList.length} khách hàng, ${d.xeList.length} xe`;
}

export default function CaiDatPage() {
  const {
    data,
    khoiPhucDuLieuMau,
    xoaTatCaDuLieu,
    cheDoMayChu,
    emailDangNhap,
    dangXuat,
    docDuLieuCuTrenThietBi,
    thayTheToanBoDuLieu,
  } = useData();
  const { modal, message } = App.useApp();
  const oChonFile = useRef<HTMLInputElement>(null);
  const [duLieuCu, setDuLieuCu] = useState<AppData | null>(null);

  useEffect(() => {
    // Dữ liệu cũ trong trình duyệt chỉ đọc được ở phía client, sau khi trang đã hiện
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cheDoMayChu) setDuLieuCu(docDuLieuCuTrenThietBi());
  }, [cheDoMayChu, docDuLieuCuTrenThietBi]);

  async function khiChonFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const d = await docFileSaoLuu(file);
      modal.confirm({
        title: "Khôi phục từ file sao lưu?",
        content: `File có ${moTaDuLieu(d)}. Toàn bộ dữ liệu hiện tại sẽ bị thay thế bằng dữ liệu trong file.`,
        okText: "Khôi phục",
        cancelText: "Hủy",
        onOk: () => {
          thayTheToanBoDuLieu(d);
          message.success("Đã khôi phục dữ liệu từ file sao lưu.");
        },
      });
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Không đọc được file.");
    }
  }

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {cheDoMayChu ? "Cài đặt" : "Cài đặt dữ liệu mẫu"}
      </Typography.Title>
      <Typography.Text type="secondary">
        {cheDoMayChu
          ? "Dữ liệu được lưu trên máy chủ, dùng chung cho mọi thiết bị đăng nhập cùng tài khoản."
          : "Đây là bản prototype UI — dữ liệu được lưu trong localStorage của trình duyệt, chưa kết nối database thật."}
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

      {cheDoMayChu && (
        <Card size="small" title="Tài khoản" style={{ marginBottom: 16 }}>
          <Space direction="vertical" size={8}>
            <Typography.Text>
              Đang đăng nhập: <strong>{emailDangNhap ?? "—"}</strong>
            </Typography.Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                modal.confirm({
                  title: "Đăng xuất?",
                  content: "Bạn sẽ cần đăng nhập lại để dùng app trên thiết bị này.",
                  okText: "Đăng xuất",
                  cancelText: "Hủy",
                  onOk: () => dangXuat(),
                });
              }}
            >
              Đăng xuất
            </Button>
          </Space>
        </Card>
      )}

      <Card size="small" title="Sao lưu" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div>
            <Typography.Text type="secondary">
              Tải toàn bộ dữ liệu về máy thành 1 file để cất giữ. Nên làm định kỳ, và trước khi thay đổi lớn.
            </Typography.Text>
            <div>
              <Button
                icon={<DownloadOutlined />}
                style={{ marginTop: 8 }}
                onClick={() => taiXuongFileSaoLuu(data)}
              >
                Tải file sao lưu
              </Button>
            </div>
          </div>
          <div>
            <Typography.Text type="secondary">
              Khôi phục dữ liệu từ file sao lưu đã tải trước đó (thay thế dữ liệu hiện tại).
            </Typography.Text>
            <div>
              <Button
                icon={<UploadOutlined />}
                style={{ marginTop: 8 }}
                onClick={() => oChonFile.current?.click()}
              >
                Khôi phục từ file
              </Button>
              <input
                ref={oChonFile}
                type="file"
                accept="application/json,.json"
                style={{ display: "none" }}
                onChange={khiChonFile}
              />
            </div>
          </div>
        </Space>
      </Card>

      {cheDoMayChu && duLieuCu && (
        <Card size="small" title="Dữ liệu cũ trên thiết bị này" style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary">
            Thiết bị này còn dữ liệu từ bản chưa có máy chủ ({moTaDuLieu(duLieuCu)}). Bạn có thể nạp lên máy chủ; dữ
            liệu hiện tại trên máy chủ sẽ bị thay thế.
          </Typography.Text>
          <div>
            <Button
              icon={<CloudUploadOutlined />}
              style={{ marginTop: 8 }}
              onClick={() => {
                modal.confirm({
                  title: "Nạp dữ liệu cũ lên máy chủ?",
                  content: `Dữ liệu hiện tại sẽ bị thay thế bằng dữ liệu cũ (${moTaDuLieu(duLieuCu)}). Bạn nên tải file sao lưu dữ liệu hiện tại trước.`,
                  okText: "Nạp lên",
                  cancelText: "Hủy",
                  onOk: () => {
                    thayTheToanBoDuLieu(duLieuCu);
                    message.success("Đã nạp dữ liệu cũ.");
                  },
                });
              }}
            >
              Nạp dữ liệu cũ lên máy chủ
            </Button>
          </div>
        </Card>
      )}

      <Card size="small">
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {!cheDoMayChu && (
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
          )}
          <div>
            <Typography.Text strong>Xóa toàn bộ dữ liệu</Typography.Text>
            <div>
              <Typography.Text type="secondary">
                {cheDoMayChu
                  ? "Xóa hết dữ liệu trên máy chủ và bắt đầu lại từ đầu. Hãy tải file sao lưu trước."
                  : "Xóa hết để thử nghiệm nhập liệu từ đầu như một app mới."}
              </Typography.Text>
            </div>
            <Button
              danger
              icon={<ClearOutlined />}
              style={{ marginTop: 8 }}
              onClick={() => {
                modal.confirm({
                  title: "Xóa toàn bộ dữ liệu?",
                  content: cheDoMayChu
                    ? "Toàn bộ dữ liệu trên máy chủ sẽ bị xóa và không thể hoàn tác (trừ khi bạn đã có file sao lưu)."
                    : "Hành động này không thể hoàn tác.",
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
