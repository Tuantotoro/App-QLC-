import type { AppData } from "@/types";

/** Dữ liệu trống hoàn toàn (không có dữ liệu mẫu). */
export function taoDuLieuTrong(): AppData {
  return {
    xeList: [],
    taiXeList: [],
    khachHangList: [],
    loaiHangList: [],
    nguoiBocHangList: [],
    taiKhoanNganHangList: [],
    chuyenList: [],
  };
}

/**
 * Kiểm tra và chuẩn hóa dữ liệu đọc từ máy chủ / file sao lưu / bộ nhớ trình duyệt.
 * Trả về null nếu không giống dữ liệu của app này.
 */
export function chuanHoaDuLieu(x: unknown): AppData | null {
  if (!x || typeof x !== "object") return null;
  const d = x as Partial<AppData>;
  if (!Array.isArray(d.chuyenList)) return null;
  const mang = <T,>(v: T[] | undefined): T[] => (Array.isArray(v) ? v : []);
  return {
    xeList: mang(d.xeList),
    taiXeList: mang(d.taiXeList),
    khachHangList: mang(d.khachHangList),
    loaiHangList: mang(d.loaiHangList),
    nguoiBocHangList: mang(d.nguoiBocHangList),
    // Dữ liệu từ phiên bản cũ chưa có danh sách tài khoản ngân hàng
    taiKhoanNganHangList: mang(d.taiKhoanNganHangList),
    chuyenList: d.chuyenList,
  };
}

/** Tải toàn bộ dữ liệu xuống thành 1 file .json để lưu giữ. */
export function taiXuongFileSaoLuu(data: AppData): void {
  const noiDung = JSON.stringify({ loai: "xe-app-sao-luu", phienBan: 1, data }, null, 2);
  const blob = new Blob([noiDung], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const ngay = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `xe-app-sao-luu-${ngay}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Đọc file sao lưu do taiXuongFileSaoLuu tạo ra. Ném lỗi nếu file không hợp lệ. */
export async function docFileSaoLuu(file: File): Promise<AppData> {
  let json: unknown;
  try {
    json = JSON.parse(await file.text());
  } catch {
    throw new Error("File không đọc được. Hãy chọn đúng file sao lưu (.json) do app tạo ra.");
  }
  const goc = json && typeof json === "object" && "data" in json ? (json as { data: unknown }).data : json;
  const d = chuanHoaDuLieu(goc);
  if (!d) throw new Error("File này không phải file sao lưu của app.");
  return d;
}
