"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Result } from "antd";
import Link from "next/link";
import { useData } from "@/store/DataContext";
import ChuyenForm from "@/components/chuyen/ChuyenForm";

export default function SuaChuyenClient() {
  const params = useSearchParams();
  const id = params.get("id");
  const { data } = useData();

  const chuyen = useMemo(() => data.chuyenList.find((c) => c.id === id), [data.chuyenList, id]);

  if (!id || !chuyen) {
    return (
      <Result
        status="404"
        title="Không tìm thấy chuyến"
        subTitle="Chuyến này có thể đã bị xóa hoặc đường dẫn không đúng."
        extra={
          <Link href="/chuyen">
            <Button type="primary">Về danh sách chuyến</Button>
          </Link>
        }
      />
    );
  }

  return <ChuyenForm chuyenSua={chuyen} />;
}
