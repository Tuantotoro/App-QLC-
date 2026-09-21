"use client";

import React, { useMemo, useState } from "react";
import { Alert, Button, Card, Form, Input, Space, Spin, Typography } from "antd";
import { LockOutlined, MailOutlined, TruckOutlined } from "@ant-design/icons";
import type { AppData } from "@/types";
import { taoMockAppData } from "@/mock/data";
import { taoDuLieuTrong } from "@/utils/saoLuu";

export type GiaiDoanMayChu =
  | "khoi-dong"
  | "dang-nhap"
  | "tai-du-lieu"
  | "chua-co-du-lieu"
  | "loi-tai"
  | "san-sang";

interface Props {
  giaiDoan: Exclude<GiaiDoanMayChu, "san-sang">;
  loiTai: string;
  dangNhap: (email: string, matKhau: string) => Promise<void>;
  khoiTao: (d: AppData) => Promise<void>;
  thuLai: () => void;
  docDuLieuCu: () => AppData | null;
}

function KhungGiua({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#F7F5EE",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 16,
            color: "#125C31",
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          <TruckOutlined /> Quản Lý Chuyến Xe
        </div>
        {children}
      </div>
    </div>
  );
}

function FormDangNhap({ dangNhap }: { dangNhap: Props["dangNhap"] }) {
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState("");

  async function xuLy(v: { email: string; matKhau: string }) {
    setDangGui(true);
    setLoi("");
    try {
      await dangNhap(v.email, v.matKhau);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không đăng nhập được.");
      setDangGui(false);
    }
  }

  return (
    <Card>
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        Đăng nhập
      </Typography.Title>
      <Form layout="vertical" onFinish={xuLy} requiredMark={false}>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
          <Input prefix={<MailOutlined />} type="email" autoComplete="username" size="large" />
        </Form.Item>
        <Form.Item name="matKhau" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
          <Input.Password prefix={<LockOutlined />} autoComplete="current-password" size="large" />
        </Form.Item>
        {loi && <Alert type="error" showIcon message={loi} style={{ marginBottom: 12 }} />}
        <Button type="primary" htmlType="submit" block size="large" loading={dangGui}>
          Đăng nhập
        </Button>
      </Form>
    </Card>
  );
}

function ChonDuLieuBanDau({
  khoiTao,
  docDuLieuCu,
}: Pick<Props, "khoiTao" | "docDuLieuCu">) {
  const [dangLam, setDangLam] = useState<string | null>(null);
  const [loi, setLoi] = useState("");
  const duLieuCu = useMemo(() => docDuLieuCu(), [docDuLieuCu]);

  async function chon(khoa: string, d: AppData) {
    setDangLam(khoa);
    setLoi("");
    try {
      await khoiTao(d);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : "Không lưu được dữ liệu lên máy chủ.");
      setDangLam(null);
    }
  }

  return (
    <Card>
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        Chưa có dữ liệu trên máy chủ
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Đây là lần đầu bạn dùng máy chủ. Chọn dữ liệu để bắt đầu:
      </Typography.Paragraph>
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {duLieuCu && (
          <div>
            <Button
              type="primary"
              block
              size="large"
              loading={dangLam === "cu"}
              disabled={dangLam !== null && dangLam !== "cu"}
              onClick={() => chon("cu", duLieuCu)}
            >
              Chuyển dữ liệu trên thiết bị này lên máy chủ
            </Button>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Đang có {duLieuCu.chuyenList.length} chuyến, {duLieuCu.khachHangList.length} khách hàng,{" "}
              {duLieuCu.xeList.length} xe. Nếu bạn mới chỉ dùng thử thì đây có thể là dữ liệu mẫu.
            </Typography.Text>
          </div>
        )}
        <Button
          type={duLieuCu ? "default" : "primary"}
          block
          size="large"
          loading={dangLam === "trong"}
          disabled={dangLam !== null && dangLam !== "trong"}
          onClick={() => chon("trong", taoDuLieuTrong())}
        >
          Bắt đầu với dữ liệu trống
        </Button>
        <Button
          block
          size="large"
          loading={dangLam === "mau"}
          disabled={dangLam !== null && dangLam !== "mau"}
          onClick={() => chon("mau", taoMockAppData())}
        >
          Dùng dữ liệu mẫu để xem thử
        </Button>
        {loi && <Alert type="error" showIcon message={loi} />}
      </Space>
    </Card>
  );
}

/** Các màn hình hiện trước khi vào app khi dữ liệu nằm trên máy chủ. */
export default function ManHinhMayChu({ giaiDoan, loiTai, dangNhap, khoiTao, thuLai, docDuLieuCu }: Props) {
  return (
    <KhungGiua>
      {(giaiDoan === "khoi-dong" || giaiDoan === "tai-du-lieu") && (
        <Card>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <Spin />
            <div style={{ marginTop: 12, color: "#8a8672" }}>Đang tải dữ liệu...</div>
          </div>
        </Card>
      )}
      {giaiDoan === "dang-nhap" && <FormDangNhap dangNhap={dangNhap} />}
      {giaiDoan === "chua-co-du-lieu" && <ChonDuLieuBanDau khoiTao={khoiTao} docDuLieuCu={docDuLieuCu} />}
      {giaiDoan === "loi-tai" && (
        <Card>
          <Alert type="error" showIcon message="Không tải được dữ liệu" description={loiTai} />
          <Button type="primary" block style={{ marginTop: 12 }} onClick={thuLai}>
            Thử lại
          </Button>
        </Card>
      )}
    </KhungGiua>
  );
}
