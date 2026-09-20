import React, { Suspense } from "react";
import { Spin } from "antd";
import ChiTietCongNoBocHangClient from "./ChiTietCongNoBocHangClient";

export default function ChiTietCongNoBocHangPage() {
  return (
    <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
      <ChiTietCongNoBocHangClient />
    </Suspense>
  );
}
