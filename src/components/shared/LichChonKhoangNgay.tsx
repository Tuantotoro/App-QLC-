"use client";

import React, { useMemo, useState } from "react";
import { LeftOutlined, RightOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const TEN_THU = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function taoLuoiNgay(thangHienThi: dayjs.Dayjs) {
  const dauThang = thangHienThi.startOf("month");
  // Thứ 2 = 0 ... Chủ nhật = 6
  const lechDau = (dauThang.day() + 6) % 7;
  const ngayBatDauLuoi = dauThang.subtract(lechDau, "day");

  const oNgay: dayjs.Dayjs[] = [];
  for (let i = 0; i < 42; i++) {
    oNgay.push(ngayBatDauLuoi.add(i, "day"));
  }
  return oNgay;
}

export default function LichChonKhoangNgay({
  open,
  tuNgay,
  denNgay,
  onDong,
  onXongChon,
}: {
  open: boolean;
  tuNgay: dayjs.Dayjs | null;
  denNgay: dayjs.Dayjs | null;
  onDong: () => void;
  onXongChon: (v: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
}) {
  const [thangHienThi, setThangHienThi] = useState(() => (tuNgay ?? dayjs()).startOf("month"));
  const [dangChon, setDangChon] = useState<{ tu: dayjs.Dayjs | null; den: dayjs.Dayjs | null }>({
    tu: tuNgay,
    den: denNgay,
  });

  const oNgay = useMemo(() => taoLuoiNgay(thangHienThi), [thangHienThi]);
  const homNay = dayjs().startOf("day");

  if (!open) return null;

  function chamVaoNgay(ngay: dayjs.Dayjs) {
    setDangChon((truoc) => {
      // Chưa chọn gì, hoặc đã có đủ cả 2 đầu -> bắt đầu lại từ đầu (chạm 1: từ ngày)
      if (!truoc.tu || (truoc.tu && truoc.den)) {
        return { tu: ngay, den: null };
      }
      // Đã có "từ ngày", đây là chạm thứ 2 -> xác định "đến ngày"
      if (ngay.isBefore(truoc.tu, "day")) {
        // Chạm ngày trước "từ ngày" thì đảo lại cho hợp lý
        return { tu: ngay, den: truoc.tu };
      }
      return { tu: truoc.tu, den: ngay };
    });
  }

  function xacNhan() {
    if (dangChon.tu && dangChon.den) {
      onXongChon([dangChon.tu.startOf("day"), dangChon.den.endOf("day")]);
    } else if (dangChon.tu) {
      // Chỉ chạm 1 lần: coi như chọn 1 ngày duy nhất
      onXongChon([dangChon.tu.startOf("day"), dangChon.tu.endOf("day")]);
    }
    onDong();
  }

  function xoaChon() {
    setDangChon({ tu: null, den: null });
  }

  const trangThaiChoNgay = (ngay: dayjs.Dayjs) => {
    const laHomNay = ngay.isSame(homNay, "day");
    const laThangHienThi = ngay.isSame(thangHienThi, "month");
    const laTu = dangChon.tu && ngay.isSame(dangChon.tu, "day");
    const laDen = dangChon.den && ngay.isSame(dangChon.den, "day");
    const trongKhoang =
      dangChon.tu && dangChon.den && ngay.isAfter(dangChon.tu, "day") && ngay.isBefore(dangChon.den, "day");
    return { laHomNay, laThangHienThi, laTu, laDen, trongKhoang };
  };

  return (
    <div className="lich-khoang-ngay-lop-phu" onClick={onDong}>
      <div className="lich-khoang-ngay-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="lich-khoang-ngay-tay-cam" />

        <div className="lich-khoang-ngay-header">
          <div className="lich-khoang-ngay-tieu-de">Chọn khoảng ngày</div>
          <button className="lich-khoang-ngay-nut-dong" onClick={onDong} aria-label="Đóng">
            <CloseOutlined />
          </button>
        </div>

        <div className="lich-khoang-ngay-tom-tat">
          <div className={`lich-khoang-ngay-tom-tat-o ${!dangChon.den ? "dang-cho" : ""}`}>
            <span className="lich-khoang-ngay-tom-tat-nhan">Từ ngày</span>
            <span className="lich-khoang-ngay-tom-tat-gia-tri">
              {dangChon.tu ? dangChon.tu.format("DD/MM/YYYY") : "Chạm chọn ngày"}
            </span>
          </div>
          <div className="lich-khoang-ngay-tom-tat-mui-ten">→</div>
          <div className={`lich-khoang-ngay-tom-tat-o ${dangChon.tu && !dangChon.den ? "dang-cho" : ""}`}>
            <span className="lich-khoang-ngay-tom-tat-nhan">Đến ngày</span>
            <span className="lich-khoang-ngay-tom-tat-gia-tri">
              {dangChon.den ? dangChon.den.format("DD/MM/YYYY") : "—"}
            </span>
          </div>
        </div>

        <div className="lich-khoang-ngay-dieu-huong-thang">
          <button
            className="lich-khoang-ngay-nut-thang"
            onClick={() => setThangHienThi((t) => t.subtract(1, "month"))}
            aria-label="Tháng trước"
          >
            <LeftOutlined />
          </button>
          <div className="lich-khoang-ngay-ten-thang">{thangHienThi.format("[Tháng] MM/YYYY")}</div>
          <button
            className="lich-khoang-ngay-nut-thang"
            onClick={() => setThangHienThi((t) => t.add(1, "month"))}
            aria-label="Tháng sau"
          >
            <RightOutlined />
          </button>
        </div>

        <div className="lich-khoang-ngay-thu">
          {TEN_THU.map((t) => (
            <div key={t} className="lich-khoang-ngay-thu-o">
              {t}
            </div>
          ))}
        </div>

        <div className="lich-khoang-ngay-luoi">
          {oNgay.map((ngay) => {
            const { laHomNay, laThangHienThi, laTu, laDen, trongKhoang } = trangThaiChoNgay(ngay);
            const classes = [
              "lich-khoang-ngay-o",
              !laThangHienThi ? "khac-thang" : "",
              laHomNay ? "hom-nay" : "",
              laTu ? "diem-dau" : "",
              laDen ? "diem-cuoi" : "",
              trongKhoang ? "trong-khoang" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button key={ngay.format("YYYY-MM-DD")} className={classes} onClick={() => chamVaoNgay(ngay)}>
                <span>{ngay.date()}</span>
              </button>
            );
          })}
        </div>

        <div className="lich-khoang-ngay-footer">
          <button className="lich-khoang-ngay-nut-xoa" onClick={xoaChon}>
            Xóa chọn
          </button>
          <button className="lich-khoang-ngay-nut-ap-dung" onClick={xacNhan} disabled={!dangChon.tu}>
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
