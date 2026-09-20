"use client";

import React, { useState } from "react";
import { Drawer } from "antd";
import { CheckOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { FilterKhoangThoiGian } from "@/types";
import { layKhoangNgay } from "@/utils/dateFilter";
import LichChonKhoangNgay from "@/components/shared/LichChonKhoangNgay";

export type KhoangTuyChon = [dayjs.Dayjs, dayjs.Dayjs] | null;

const MOC_SAN: { loai: FilterKhoangThoiGian; nhan: string }[] = [
  { loai: "hom_nay", nhan: "Hôm nay" },
  { loai: "tuan_nay", nhan: "Tuần này" },
  { loai: "thang_nay", nhan: "Tháng này" },
  { loai: "tat_ca", nhan: "Tất cả thời gian" },
];

function dinhDangKhoang(khoang: [dayjs.Dayjs, dayjs.Dayjs], kieu: "ngan" | "day"): string {
  const [tu, den] = khoang;
  const dinhDang = kieu === "ngan" ? "DD/MM" : "DD/MM/YYYY";
  return tu.isSame(den, "day")
    ? tu.format("DD/MM/YYYY")
    : `${tu.format(dinhDang)} – ${den.format("DD/MM/YYYY")}`;
}

/** Dòng chữ ngắn mô tả bộ lọc thời gian đang chọn - hiển thị trên thẻ tổng quan. */
export function nhanBoLocThoiGian(loai: FilterKhoangThoiGian, tuyChon: KhoangTuyChon): string {
  switch (loai) {
    case "hom_nay":
      return `Hôm nay, ${dayjs().format("DD/MM/YYYY")}`;
    case "tuan_nay": {
      const k = layKhoangNgay({ loai });
      return k ? `Tuần này (${dinhDangKhoang(k, "ngan")})` : "Tuần này";
    }
    case "thang_nay":
      return `Tháng này (${dayjs().format("MM/YYYY")})`;
    case "khoang_tuy_chon":
      return tuyChon ? dinhDangKhoang(tuyChon, "day") : "Chọn khoảng ngày";
    default:
      return "Tất cả thời gian";
  }
}

interface Props {
  open: boolean;
  onDong: () => void;
  loai: FilterKhoangThoiGian;
  tuyChon: KhoangTuyChon;
  /** Chọn một mốc có sẵn (hôm nay, tuần này, tháng này, tất cả). */
  onChonMoc: (loai: FilterKhoangThoiGian) => void;
  /** Chọn xong khoảng ngày tùy chọn ở lịch. */
  onChonKhoang: (khoang: [dayjs.Dayjs, dayjs.Dayjs]) => void;
}

/**
 * Bảng chọn thời gian trượt từ dưới lên cho màn hình điện thoại: các mốc có sẵn
 * và "Chọn khoảng ngày" (mở lịch chạm 2 lần). Bộ lọc chỉ đổi khi người dùng chọn xong.
 */
export default function ChonThoiGianSheet({
  open,
  onDong,
  loai,
  tuyChon,
  onChonMoc,
  onChonKhoang,
}: Props) {
  const [moLich, setMoLich] = useState(false);

  return (
    <>
      <Drawer
        title="Xem theo thời gian"
        placement="bottom"
        open={open}
        onClose={onDong}
        height="auto"
        // Cao hơn nút "+" nổi (1001) và thanh điều hướng dưới, thấp hơn lịch chọn ngày (1200)
        zIndex={1100}
        styles={{ body: { padding: "0 0 16px" } }}
      >
        {MOC_SAN.map((m) => {
          const khoang = layKhoangNgay({ loai: m.loai });
          const dangChon = loai === m.loai;
          return (
            <button
              key={m.loai}
              className={`chon-thoi-gian-hang${dangChon ? " dang-chon" : ""}`}
              onClick={() => {
                onChonMoc(m.loai);
                onDong();
              }}
            >
              <span className="chon-thoi-gian-hang-noi-dung">
                <span className="chon-thoi-gian-hang-nhan">{m.nhan}</span>
                {khoang && (
                  <span className="chon-thoi-gian-hang-sub">{dinhDangKhoang(khoang, "day")}</span>
                )}
              </span>
              {dangChon && <CheckOutlined className="chon-thoi-gian-hang-tick" />}
            </button>
          );
        })}

        <button
          className={`chon-thoi-gian-hang${loai === "khoang_tuy_chon" ? " dang-chon" : ""}`}
          onClick={() => {
            onDong();
            setMoLich(true);
          }}
        >
          <span className="chon-thoi-gian-hang-noi-dung">
            <span className="chon-thoi-gian-hang-nhan">Chọn khoảng ngày</span>
            {loai === "khoang_tuy_chon" && tuyChon && (
              <span className="chon-thoi-gian-hang-sub">{dinhDangKhoang(tuyChon, "day")}</span>
            )}
          </span>
          {loai === "khoang_tuy_chon" ? (
            <CheckOutlined className="chon-thoi-gian-hang-tick" />
          ) : (
            <RightOutlined style={{ fontSize: 12, color: "#8a8672" }} />
          )}
        </button>
      </Drawer>

      {/* Chỉ dựng lịch khi mở để mỗi lần mở đều bắt đầu từ khoảng đang chọn */}
      {moLich && (
        <LichChonKhoangNgay
          open
          tuNgay={loai === "khoang_tuy_chon" && tuyChon ? tuyChon[0] : null}
          denNgay={loai === "khoang_tuy_chon" && tuyChon ? tuyChon[1] : null}
          onDong={() => setMoLich(false)}
          onXongChon={(v) => {
            if (v) onChonKhoang(v);
          }}
        />
      )}
    </>
  );
}
