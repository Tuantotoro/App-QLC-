import type { Chuyen, FilterKhoangThoiGian } from "@/types";
import dayjs, { Dayjs } from "dayjs";

export interface KhoangThoiGian {
  loai: FilterKhoangThoiGian;
  tuNgay?: Dayjs;
  denNgay?: Dayjs;
}

/**
 * Khoảng ngày [từ, đến] thực sự được áp dụng cho một bộ lọc thời gian.
 * Trả về null nghĩa là không giới hạn (tất cả, hoặc khoảng tùy chọn chưa chọn đủ 2 đầu).
 */
export function layKhoangNgay(khoang: KhoangThoiGian): [Dayjs, Dayjs] | null {
  const now = dayjs();
  switch (khoang.loai) {
    case "hom_nay":
      return [now.startOf("day"), now.endOf("day")];
    case "tuan_nay": {
      // Tuần bắt đầu từ thứ Hai (giống lịch chọn ngày trong app), kết thúc Chủ nhật
      const thuHai = now.subtract((now.day() + 6) % 7, "day").startOf("day");
      return [thuHai, thuHai.add(6, "day").endOf("day")];
    }
    case "thang_nay":
      return [now.startOf("month"), now.endOf("month")];
    case "khoang_tuy_chon":
      if (!khoang.tuNgay || !khoang.denNgay) return null;
      return [khoang.tuNgay.startOf("day"), khoang.denNgay.endOf("day")];
    default:
      return null;
  }
}

export function locChuyenTheoThoiGian(
  danhSach: Chuyen[],
  khoang: KhoangThoiGian
): Chuyen[] {
  const khoangNgay = layKhoangNgay(khoang);
  if (!khoangNgay) return danhSach;
  const [tu, den] = khoangNgay;

  return danhSach.filter((c) => {
    const ngay = dayjs(c.ngay);
    return (ngay.isAfter(tu) || ngay.isSame(tu)) && (ngay.isBefore(den) || ngay.isSame(den));
  });
}
