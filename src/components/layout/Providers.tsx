"use client";

import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App as AntApp } from "antd";
import viVN from "antd/locale/vi_VN";
import { themeConfig } from "@/theme/themeConfig";
import { DataProvider } from "@/store/DataContext";
import AppShell from "./AppShell";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={themeConfig} locale={viVN}>
        <AntApp>
          <DataProvider>
            <AppShell>{children}</AppShell>
          </DataProvider>
        </AntApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
