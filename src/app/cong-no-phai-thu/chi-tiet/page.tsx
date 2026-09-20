import React, { Suspense } from "react";
import { Spin } from "antd";
import ChiTietCongNoKhachClient from "./ChiTietCongNoKhachClient";

export default function ChiTietCongNoKhachPage() {
  return (
    <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
      <ChiTietCongNoKhachClient />
    </Suspense>
  );
}
