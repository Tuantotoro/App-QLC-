"use client";

import React, { useState } from "react";
import { Select, Input, Button, Divider, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { SelectProps } from "antd";

interface Props extends Omit<SelectProps, "options" | "onChange"> {
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
  onThemMoi: (ten: string) => void;
  placeholderThemMoi?: string;
}

/** Select có kèm ô nhập nhanh để thêm mới một mục vào danh mục (VD: thêm khách hàng mới ngay khi tạo chuyến). */
export default function SelectThemMoi({
  options,
  onChange,
  onThemMoi,
  placeholderThemMoi = "Nhập tên mới...",
  ...rest
}: Props) {
  const [giaTriMoi, setGiaTriMoi] = useState("");

  return (
    <Select
      showSearch
      optionFilterProp="label"
      options={options}
      onChange={(v) => onChange?.(v as string)}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: "8px 0" }} />
          <Space style={{ padding: "0 8px 8px" }} onClick={(e) => e.stopPropagation()}>
            <Input
              placeholder={placeholderThemMoi}
              value={giaTriMoi}
              onChange={(e) => setGiaTriMoi(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onPressEnter={() => {
                if (giaTriMoi.trim()) {
                  onThemMoi(giaTriMoi.trim());
                  setGiaTriMoi("");
                }
              }}
            />
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => {
                if (giaTriMoi.trim()) {
                  onThemMoi(giaTriMoi.trim());
                  setGiaTriMoi("");
                }
              }}
            >
              Thêm
            </Button>
          </Space>
        </>
      )}
      {...rest}
    />
  );
}
