import React, { Suspense } from "react";
import { Spin } from "antd";
import DoiChieuTaiKhoanClient from "./DoiChieuTaiKhoanClient";

export default function DoiChieuTaiKhoanPage() {
  return (
    <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
      <DoiChieuTaiKhoanClient />
    </Suspense>
  );
}
