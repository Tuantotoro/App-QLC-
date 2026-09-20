"use client";

import React, { useState } from "react";
import { Segmented, Select, DatePicker, Space, Grid } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { FilterKhoangThoiGian } from "@/types";
import LichChonKhoangNgay from "./LichChonKhoangNgay";

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const TUY_CHON = [
  { label: "Hôm nay", value: "hom_nay" },
  { label: "Tuần này", value: "tuan_nay" },
  { label: "Tháng này", value: "thang_nay" },
  { label: "Tất cả", value: "tat_ca" },
  { label: "Khoảng tùy chọn", value: "khoang_tuy_chon" },
];

export default function BoLocThoiGian({
  value,
  onChange,
  onChangeKhoangTuyChon,
}: {
  value: FilterKhoangThoiGian;
  onChange: (v: FilterKhoangThoiGian) => void;
  onChangeKhoangTuyChon: (v: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
}) {
  const screens = useBreakpoint();
  const laMobile = !screens.sm;

  const [moLich, setMoLich] = useState(false);
  const [khoangDaChon, setKhoangDaChon] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  return (
    <Space direction={laMobile ? "vertical" : "horizontal"} style={{ width: laMobile ? "100%" : undefined }}>
      {laMobile ? (
        <Select
          style={{ width: "100%" }}
          value={value}
          onChange={(v) => onChange(v as FilterKhoangThoiGian)}
          options={TUY_CHON}
        />
      ) : (
        <Segmented
          value={value}
          onChange={(v) => onChange(v as FilterKhoangThoiGian)}
          options={TUY_CHON}
        />
      )}

      {value === "khoang_tuy_chon" &&
        (laMobile ? (
          <>
            <button className="nut-mo-lich-khoang-ngay" onClick={() => setMoLich(true)}>
              <CalendarOutlined />
              <span>
                {khoangDaChon
                  ? `${khoangDaChon[0].format("DD/MM/YYYY")} - ${khoangDaChon[1].format("DD/MM/YYYY")}`
                  : "Chọn khoảng ngày"}
              </span>
            </button>
            <LichChonKhoangNgay
              open={moLich}
              tuNgay={khoangDaChon ? khoangDaChon[0] : null}
              denNgay={khoangDaChon ? khoangDaChon[1] : null}
              onDong={() => setMoLich(false)}
              onXongChon={(v) => {
                setKhoangDaChon(v);
                onChangeKhoangTuyChon(v);
              }}
            />
          </>
        ) : (
          <RangePicker
            onChange={(v) => onChangeKhoangTuyChon(v as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            format="DD/MM/YYYY"
            size="middle"
            inputReadOnly
            placeholder={["Từ ngày", "Đến ngày"]}
          />
        ))}
    </Space>
  );
}
