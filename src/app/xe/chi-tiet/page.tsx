import React, { Suspense } from "react";
import { Spin } from "antd";
import ChiTietXeClient from "./ChiTietXeClient";

export default function ChiTietXePage() {
  return (
    <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
      <ChiTietXeClient />
    </Suspense>
  );
}
