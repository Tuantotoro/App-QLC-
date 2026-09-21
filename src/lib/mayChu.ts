// ==========================================================================
// KẾT NỐI MÁY CHỦ (Supabase) - dùng fetch thuần, không cần cài thêm thư viện.
// - Đăng nhập bằng email + mật khẩu, phiên đăng nhập lưu trên thiết bị và tự gia hạn.
// - Toàn bộ dữ liệu app lưu thành MỘT bản ghi trong bảng app_data (mỗi người dùng một bản ghi),
//   có số phiên bản để phát hiện khi 2 thiết bị cùng sửa (tránh ghi đè nhầm).
// Nếu chưa khai báo NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY thì app chạy
// ở chế độ cũ (lưu trên trình duyệt).
// ==========================================================================
import type { AppData } from "@/types";

const URL_GOC = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const KHOA_CONG_KHAI = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export const DA_CAU_HINH_MAY_CHU = URL_GOC !== "" && KHOA_CONG_KHAI !== "";

const KHOA_PHIEN = "xe-app-phien-dang-nhap-v1";
/** Gia hạn phiên trước khi hết hạn bao nhiêu mili giây. */
const GIA_HAN_TRUOC_MS = 60_000;

/** Cần đăng nhập (chưa đăng nhập, sai mật khẩu, hoặc phiên hết hạn). */
export class LoiXacThuc extends Error {}
/** Không kết nối được máy chủ (mất mạng...). */
export class LoiMang extends Error {}
/** Máy chủ trả về lỗi khác. */
export class LoiMayChu extends Error {}

export interface Phien {
  accessToken: string;
  refreshToken: string;
  /** Thời điểm hết hạn của accessToken (mili giây). */
  hetHanLuc: number;
  userId: string;
  email: string;
}

// --------------------------------------------------------------------------
// Phiên đăng nhập
// --------------------------------------------------------------------------
export function docPhien(): Phien | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KHOA_PHIEN);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Phien>;
    if (!p.accessToken || !p.refreshToken || !p.userId) return null;
    return {
      accessToken: p.accessToken,
      refreshToken: p.refreshToken,
      hetHanLuc: Number(p.hetHanLuc) || 0,
      userId: p.userId,
      email: p.email ?? "",
    };
  } catch {
    return null;
  }
}

function luuPhien(p: Phien | null) {
  if (typeof window === "undefined") return;
  try {
    if (p) window.localStorage.setItem(KHOA_PHIEN, JSON.stringify(p));
    else window.localStorage.removeItem(KHOA_PHIEN);
  } catch {
    // bỏ qua nếu trình duyệt không cho lưu
  }
}

interface PhanHoiToken {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  user?: { id?: string; email?: string };
}

function phanHoiSangPhien(j: PhanHoiToken): Phien {
  if (!j.access_token || !j.refresh_token || !j.user?.id) {
    throw new LoiMayChu("Máy chủ trả về dữ liệu đăng nhập không hợp lệ.");
  }
  const hetHanLuc =
    typeof j.expires_at === "number"
      ? j.expires_at * 1000
      : Date.now() + (Number(j.expires_in) || 3600) * 1000;
  return {
    accessToken: j.access_token,
    refreshToken: j.refresh_token,
    hetHanLuc,
    userId: j.user.id,
    email: j.user.email ?? "",
  };
}

// --------------------------------------------------------------------------
// Gọi mạng
// --------------------------------------------------------------------------
async function fetchAnToan(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new LoiMang("Không kết nối được máy chủ. Hãy kiểm tra mạng rồi thử lại.");
  }
}

async function docLoi(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { message?: string; msg?: string; error_description?: string; error?: string };
    return j.message ?? j.msg ?? j.error_description ?? j.error ?? `Lỗi máy chủ (${res.status})`;
  } catch {
    return `Lỗi máy chủ (${res.status})`;
  }
}

export async function dangNhap(email: string, matKhau: string): Promise<Phien> {
  const res = await fetchAnToan(`${URL_GOC}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: KHOA_CONG_KHAI, "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password: matKhau }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new LoiMayChu("Bạn thử quá nhiều lần. Hãy đợi vài phút rồi thử lại.");
    if (res.status === 400 || res.status === 401 || res.status === 422) {
      throw new LoiXacThuc("Email hoặc mật khẩu không đúng.");
    }
    throw new LoiMayChu(await docLoi(res));
  }
  const p = phanHoiSangPhien((await res.json()) as PhanHoiToken);
  luuPhien(p);
  return p;
}

let dangLamMoi: Promise<Phien> | null = null;

/** Gia hạn phiên. Nhiều nơi gọi cùng lúc thì chỉ gửi một yêu cầu. */
function lamMoiPhien(refreshToken: string): Promise<Phien> {
  if (!dangLamMoi) {
    dangLamMoi = (async () => {
      try {
        const res = await fetchAnToan(`${URL_GOC}/auth/v1/token?grant_type=refresh_token`, {
          method: "POST",
          headers: { apikey: KHOA_CONG_KHAI, "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) {
          if (res.status === 400 || res.status === 401 || res.status === 403) {
            luuPhien(null);
            throw new LoiXacThuc("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.");
          }
          throw new LoiMayChu(await docLoi(res));
        }
        const p = phanHoiSangPhien((await res.json()) as PhanHoiToken);
        luuPhien(p);
        return p;
      } finally {
        dangLamMoi = null;
      }
    })();
  }
  return dangLamMoi;
}

async function layPhienHopLe(): Promise<Phien> {
  const p = docPhien();
  if (!p) throw new LoiXacThuc("Chưa đăng nhập.");
  if (p.hetHanLuc - Date.now() < GIA_HAN_TRUOC_MS) return lamMoiPhien(p.refreshToken);
  return p;
}

export async function dangXuat(): Promise<void> {
  const p = docPhien();
  luuPhien(null);
  if (!p) return;
  try {
    // scope=local: chỉ đăng xuất thiết bị này, không đăng xuất các thiết bị khác
    await fetch(`${URL_GOC}/auth/v1/logout?scope=local`, {
      method: "POST",
      headers: { apikey: KHOA_CONG_KHAI, Authorization: `Bearer ${p.accessToken}` },
    });
  } catch {
    // đã xóa phiên trên thiết bị, lỗi mạng không quan trọng
  }
}

/** Gọi API dữ liệu kèm đăng nhập; tự gia hạn phiên và thử lại một lần nếu bị từ chối. */
async function goiDuLieu(
  duongDan: string,
  method: string,
  body?: unknown,
  headerThem?: Record<string, string>
): Promise<Response> {
  const thuGoi = (p: Phien) =>
    fetchAnToan(`${URL_GOC}/rest/v1/${duongDan}`, {
      method,
      headers: {
        apikey: KHOA_CONG_KHAI,
        Authorization: `Bearer ${p.accessToken}`,
        "Content-Type": "application/json",
        ...headerThem,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let p = await layPhienHopLe();
  let res = await thuGoi(p);
  if (res.status === 401) {
    p = await lamMoiPhien(p.refreshToken);
    res = await thuGoi(p);
    if (res.status === 401) throw new LoiXacThuc("Phiên đăng nhập không còn hiệu lực. Hãy đăng nhập lại.");
  }
  return res;
}

// --------------------------------------------------------------------------
// Dữ liệu app
// --------------------------------------------------------------------------
export interface BanGhiDuLieu {
  data: unknown;
  version: number;
}

/** Đọc dữ liệu của người đang đăng nhập. Trả về null nếu chưa có bản ghi nào. */
export async function docDuLieu(): Promise<BanGhiDuLieu | null> {
  const res = await goiDuLieu("app_data?select=data,version&limit=1", "GET");
  if (!res.ok) throw new LoiMayChu(await docLoi(res));
  const rows = (await res.json()) as BanGhiDuLieu[];
  return rows.length > 0 ? rows[0] : null;
}

/** Chỉ đọc số phiên bản (nhẹ) - dùng để biết thiết bị khác đã sửa dữ liệu chưa. */
export async function docPhienBanDuLieu(): Promise<number | null> {
  const res = await goiDuLieu("app_data?select=version&limit=1", "GET");
  if (!res.ok) throw new LoiMayChu(await docLoi(res));
  const rows = (await res.json()) as { version: number }[];
  return rows.length > 0 ? rows[0].version : null;
}

/** Tạo bản ghi dữ liệu lần đầu. Trả về số phiên bản (1), hoặc null nếu đã có bản ghi từ trước. */
export async function taoDuLieu(data: AppData): Promise<number | null> {
  const p = await layPhienHopLe();
  const res = await goiDuLieu("app_data", "POST", { user_id: p.userId, data, version: 1 }, {
    Prefer: "return=minimal",
  });
  if (res.status === 409) return null;
  if (!res.ok) throw new LoiMayChu(await docLoi(res));
  return 1;
}

/**
 * Lưu dữ liệu, chỉ khi máy chủ vẫn đang ở đúng phiên bản versionCu.
 * Trả về phiên bản mới; hoặc null nếu thiết bị khác đã lưu trước (xung đột).
 */
export async function capNhatDuLieu(data: AppData, versionCu: number): Promise<number | null> {
  const p = await layPhienHopLe();
  const res = await goiDuLieu(
    `app_data?user_id=eq.${encodeURIComponent(p.userId)}&version=eq.${versionCu}&select=version`,
    "PATCH",
    { data, version: versionCu + 1, updated_at: new Date().toISOString() },
    { Prefer: "return=representation" }
  );
  if (!res.ok) throw new LoiMayChu(await docLoi(res));
  const rows = (await res.json()) as { version: number }[];
  return rows.length > 0 ? rows[0].version : null;
}
