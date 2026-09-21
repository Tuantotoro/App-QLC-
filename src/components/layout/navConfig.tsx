import React from "react";
import {
  DashboardOutlined,
  CarOutlined,
  TeamOutlined,
  UserOutlined,
  ShoppingOutlined,
  WalletOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  ContactsOutlined,
  ToolOutlined,
  BankOutlined,
} from "@ant-design/icons";

export interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: React.ReactNode;
}

export const NAV_CHINH: NavItem[] = [
  { key: "dashboard", href: "/", label: "Tổng quan", icon: <DashboardOutlined /> },
  { key: "chuyen", href: "/chuyen", label: "Chuyến xe", icon: <CarOutlined /> },
  { key: "cong-no-phai-thu", href: "/cong-no-phai-thu", label: "Công nợ phải thu", icon: <WalletOutlined /> },
  { key: "cong-no-phai-tra", href: "/cong-no-phai-tra", label: "Công nợ phải trả", icon: <DollarCircleOutlined /> },
];

export const NAV_DANH_MUC: NavItem[] = [
  { key: "khach-hang", href: "/khach-hang", label: "Khách hàng", icon: <ContactsOutlined /> },
  { key: "xe", href: "/xe", label: "Xe", icon: <CarOutlined /> },
  { key: "tai-xe", href: "/tai-xe", label: "Tài xế", icon: <UserOutlined /> },
  { key: "hang-hoa", href: "/hang-hoa", label: "Hàng hóa", icon: <ShoppingOutlined /> },
  { key: "nguoi-boc-hang", href: "/nguoi-boc-hang", label: "Người bốc hàng", icon: <TeamOutlined /> },
  { key: "tai-khoan-ngan-hang", href: "/tai-khoan-ngan-hang", label: "Tài khoản ngân hàng", icon: <BankOutlined /> },
];

export const NAV_KHAC: NavItem[] = [
  { key: "bao-cao", href: "/bao-cao", label: "Báo cáo", icon: <FileTextOutlined /> },
  { key: "cai-dat", href: "/cai-dat", label: "Cài đặt", icon: <ToolOutlined /> },
];

export const NAV_BOTTOM_MOBILE: NavItem[] = [
  { key: "dashboard", href: "/", label: "Tổng quan", icon: <DashboardOutlined /> },
  { key: "chuyen", href: "/chuyen", label: "Chuyến", icon: <CarOutlined /> },
  { key: "cong-no", href: "/cong-no-phai-thu", label: "Công nợ", icon: <WalletOutlined /> },
  { key: "khac", href: "/bao-cao", label: "Báo cáo", icon: <FileTextOutlined /> },
];

export function matchKey(pathname: string): string {
  if (pathname === "/") return "dashboard";
  const seg = "/" + pathname.split("/").filter(Boolean)[0];
  const all = [...NAV_CHINH, ...NAV_DANH_MUC, ...NAV_KHAC];
  const found = all.find((n) => n.href === seg);
  return found?.key ?? "dashboard";
}
