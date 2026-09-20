import React, { Suspense } from "react";
import { Spin } from "antd";
import SuaChuyenClient from "./SuaChuyenClient";

export default function SuaChuyenPage() {
  return (
    <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
      <SuaChuyenClient />
    </Suspense>
  );
}
