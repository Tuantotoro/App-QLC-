import React, { Suspense } from "react";
import { Spin } from "antd";
import ChiTietChuyenClient from "./ChiTietChuyenClient";

export default function ChiTietChuyenPage() {
  return (
    <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
      <ChiTietChuyenClient />
    </Suspense>
  );
}
