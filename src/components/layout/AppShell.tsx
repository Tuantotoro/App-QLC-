"use client";

import React, { useState } from "react";
import { Layout, Menu, Typography, Grid, Drawer, Button, Badge } from "antd";
import { MenuOutlined, TruckOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { NAV_CHINH, NAV_DANH_MUC, NAV_KHAC, matchKey } from "./navConfig";
import BottomNav from "./BottomNav";
import { useData } from "@/store/DataContext";
import { tongHopTheoTaiKhoan } from "@/utils/aggregate";

/** Chữ nhỏ ở góc phải thanh trên: cho biết dữ liệu đã lưu lên máy chủ chưa. */
function TrangThaiLuuChip() {
  const { cheDoMayChu, trangThaiLuu } = useData();
  if (!cheDoMayChu) return null;
  const cauHinh = {
    "da-luu": { chu: "Đã lưu", mau: "#1B7A43" },
    "dang-luu": { chu: "Đang lưu...", mau: "#8a8672" },
    loi: { chu: "Lỗi lưu, đang thử lại", mau: "#C0392B" },
    "xung-dot": { chu: "Chưa lưu", mau: "#C0392B" },
  }[trangThaiLuu];
  return (
    <span style={{ fontSize: 12, color: cauHinh.mau, whiteSpace: "nowrap" }} role="status">
      {cauHinh.chu}
    </span>
  );
}

/** Tổng số khoản chuyển khoản quá hạn chưa đối chiếu sao kê, trên mọi tài khoản. */
function useSoKhoanQuaHan(): number {
  const { data } = useData();
  let tong = 0;
  tongHopTheoTaiKhoan(data).forEach((t) => {
    tong += t.soQuaHan;
  });
  return tong;
}

const { Sider, Header, Content } = Layout;
const { useBreakpoint } = Grid;

function DanhSachMenu({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeKey = matchKey(pathname);
  const soQuaHan = useSoKhoanQuaHan();

  const items = [
    { type: "group" as const, label: "Chính", children: NAV_CHINH.map(toMenuItem) },
    { type: "group" as const, label: "Danh mục", children: NAV_DANH_MUC.map(toMenuItem) },
    { type: "group" as const, label: "Khác", children: NAV_KHAC.map(toMenuItem) },
  ];

  function toMenuItem(n: (typeof NAV_CHINH)[number]) {
    if (n.key === "tai-khoan-ngan-hang" && soQuaHan > 0) {
      return {
        key: n.key,
        icon: n.icon,
        label: (
          <span>
            {n.label} <Badge count={soQuaHan} size="small" />
          </span>
        ),
      };
    }
    return { key: n.key, icon: n.icon, label: n.label };
  }

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[activeKey]}
      items={items}
      style={{ background: "transparent", borderInlineEnd: "none" }}
      onClick={(info) => {
        const all = [...NAV_CHINH, ...NAV_DANH_MUC, ...NAV_KHAC];
        const found = all.find((n) => n.key === info.key);
        if (found) router.push(found.href);
        onClick?.();
      }}
    />
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const screens = useBreakpoint();
  const isDesktop = screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const soQuaHan = useSoKhoanQuaHan();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {isDesktop && (
        <Sider width={240} style={{ background: "#125C31" }} breakpoint="md">
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 20px",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            <TruckOutlined style={{ fontSize: 20 }} />
            <span>Quản Lý Chuyến Xe</span>
          </div>
          <DanhSachMenu />
        </Sider>
      )}
      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E7E3D6",
            position: "sticky",
            top: 0,
            zIndex: 900,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isDesktop && (
              <Badge dot={soQuaHan > 0} offset={[-6, 6]}>
                <Button
                  type="text"
                  icon={<MenuOutlined />}
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Mở menu"
                />
              </Badge>
            )}
            {!isDesktop && (
              <Typography.Text
                strong
                style={{ fontSize: 16, color: "#125C31", display: "flex", gap: 8, alignItems: "center" }}
                onClick={() => router.push("/")}
              >
                <TruckOutlined /> Quản Lý Chuyến Xe
              </Typography.Text>
            )}
          </div>
          <TrangThaiLuuChip />
        </Header>
        <Content
          className={!isDesktop ? "page-content-mobile-pad" : undefined}
          style={{
            paddingTop: isDesktop ? 24 : 12,
            paddingLeft: isDesktop ? 24 : 12,
            paddingRight: isDesktop ? 24 : 12,
            paddingBottom: isDesktop ? 24 : undefined,
            background: "#F7F5EE",
          }}
        >
          {children}
        </Content>
      </Layout>
      {!isDesktop && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          styles={{ body: { padding: 0, background: "#125C31" } }}
          width={260}
          closable={false}
        >
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 20px",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            <TruckOutlined style={{ fontSize: 20 }} />
            <span>Quản Lý Chuyến Xe</span>
          </div>
          <DanhSachMenu onClick={() => setDrawerOpen(false)} />
        </Drawer>
      )}
      {!isDesktop && <BottomNav />}
    </Layout>
  );
}
