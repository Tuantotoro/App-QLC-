"use client";

// ==========================================================================
// DATA CONTEXT - Quản lý state toàn cục cho prototype (thay thế database)
// Lưu vào localStorage để mô phỏng việc dữ liệu được "lưu lại".
// ==========================================================================
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal } from "antd";
import { v4 as uuidv4 } from "uuid";
import type {
  AppData,
  Chuyen,
  ChieuChuyen,
  HangTrenChuyen,
  CongNoBocHang,
  Xe,
  TaiXe,
  KhachHang,
  LoaiHang,
  NguoiBocHang,
  TaiKhoanNganHang,
  ThongTinHinhThuc,
  LanThanhToanKhach,
  LanThanhToanNguoiBoc,
} from "@/types";
import { taoMockAppData } from "@/mock/data";
import * as mayChu from "@/lib/mayChu";
import { chuanHoaDuLieu, taiXuongFileSaoLuu, taoDuLieuTrong } from "@/utils/saoLuu";
import ManHinhMayChu, { type GiaiDoanMayChu } from "@/components/layout/ManHinhMayChu";

/**
 * Áp dụng một biến đổi lên dòng hàng có id = hangId, dù dòng đó nằm ở chiều
 * đi hay chiều về của chuyến (id là duy nhất toàn cục nên không nhầm lẫn).
 */
function suaHangTrongChuyen(
  chuyen: Chuyen,
  hangId: string,
  transform: (h: HangTrenChuyen) => HangTrenChuyen
): Chuyen {
  const apDung = (chieu: ChieuChuyen): ChieuChuyen => ({
    ...chieu,
    danhSachHang: chieu.danhSachHang.map((h) => (h.id === hangId ? transform(h) : h)),
  });
  if (chuyen.chieuDi.danhSachHang.some((h) => h.id === hangId)) {
    return { ...chuyen, chieuDi: apDung(chuyen.chieuDi) };
  }
  if (chuyen.chieuVe && chuyen.chieuVe.danhSachHang.some((h) => h.id === hangId)) {
    return { ...chuyen, chieuVe: apDung(chuyen.chieuVe) };
  }
  return chuyen;
}

/**
 * Áp dụng một biến đổi lên khoản công nợ bốc hàng có id = congNoId, dù nằm
 * ở chiều đi hay chiều về của chuyến.
 */
function suaCongNoBocHangTrongChuyen(
  chuyen: Chuyen,
  congNoId: string,
  transform: (c: CongNoBocHang) => CongNoBocHang
): Chuyen {
  const apDung = (chieu: ChieuChuyen): ChieuChuyen => ({
    ...chieu,
    danhSachCongNoBocHang: chieu.danhSachCongNoBocHang.map((c) =>
      c.id === congNoId ? transform(c) : c
    ),
  });
  if (chuyen.chieuDi.danhSachCongNoBocHang.some((c) => c.id === congNoId)) {
    return { ...chuyen, chieuDi: apDung(chuyen.chieuDi) };
  }
  if (chuyen.chieuVe && chuyen.chieuVe.danhSachCongNoBocHang.some((c) => c.id === congNoId)) {
    return { ...chuyen, chieuVe: apDung(chuyen.chieuVe) };
  }
  return chuyen;
}

/**
 * Áp dụng một biến đổi lên lần thanh toán có id = thanhToanId, dù đó là lần thu của khách
 * hay lần trả người bốc hàng, ở chiều đi hay chiều về. Trả về cùng đối tượng nếu không tìm thấy.
 */
function suaLanThanhToanTrongChuyen(
  chuyen: Chuyen,
  thanhToanId: string,
  transform: (lt: LanThanhToanKhach | LanThanhToanNguoiBoc) => LanThanhToanKhach | LanThanhToanNguoiBoc
): Chuyen {
  let coDoi = false;
  const doiDs = <L extends LanThanhToanKhach | LanThanhToanNguoiBoc>(ds: L[]): L[] =>
    ds.map((lt) => {
      if (lt.id !== thanhToanId) return lt;
      coDoi = true;
      return transform(lt) as L;
    });
  const apDung = (chieu: ChieuChuyen): ChieuChuyen => ({
    ...chieu,
    danhSachHang: chieu.danhSachHang.map((h) => ({ ...h, danhSachThanhToan: doiDs(h.danhSachThanhToan) })),
    danhSachCongNoBocHang: chieu.danhSachCongNoBocHang.map((c) => ({
      ...c,
      danhSachThanhToan: doiDs(c.danhSachThanhToan),
    })),
  });
  const chieuDi = apDung(chuyen.chieuDi);
  const chieuVe = chuyen.chieuVe ? apDung(chuyen.chieuVe) : undefined;
  return coDoi ? { ...chuyen, chieuDi, chieuVe, updatedAt: new Date().toISOString() } : chuyen;
}

const STORAGE_KEY = "xe-app-prototype-data-v1";

/** Có khai báo máy chủ (Supabase) thì dữ liệu lưu trên máy chủ; không thì lưu trong trình duyệt như cũ. */
const CHE_DO_MAY_CHU = mayChu.DA_CAU_HINH_MAY_CHU;

/** Tình trạng lưu dữ liệu lên máy chủ (chỉ có ý nghĩa ở chế độ máy chủ). */
export type TrangThaiLuu = "da-luu" | "dang-luu" | "loi" | "xung-dot";

interface DataContextValue {
  data: AppData;
  daTaiXong: boolean;
  // Danh mục
  themXe: (xe: Omit<Xe, "id">) => Xe;
  themTaiXe: (t: Omit<TaiXe, "id">) => TaiXe;
  themKhachHang: (k: Omit<KhachHang, "id">) => KhachHang;
  themLoaiHang: (l: Omit<LoaiHang, "id">) => LoaiHang;
  themNguoiBocHang: (n: Omit<NguoiBocHang, "id">) => NguoiBocHang;
  themTaiKhoanNganHang: (t: Omit<TaiKhoanNganHang, "id">) => TaiKhoanNganHang;
  capNhatXe: (id: string, patch: Partial<Xe>) => void;
  xoaXe: (id: string) => void;
  capNhatTaiXe: (id: string, patch: Partial<TaiXe>) => void;
  xoaTaiXe: (id: string) => void;
  capNhatKhachHang: (id: string, patch: Partial<KhachHang>) => void;
  xoaKhachHang: (id: string) => void;
  capNhatLoaiHang: (id: string, patch: Partial<LoaiHang>) => void;
  xoaLoaiHang: (id: string) => void;
  capNhatNguoiBocHang: (id: string, patch: Partial<NguoiBocHang>) => void;
  xoaNguoiBocHang: (id: string) => void;
  capNhatTaiKhoanNganHang: (id: string, patch: Partial<TaiKhoanNganHang>) => void;
  xoaTaiKhoanNganHang: (id: string) => void;
  // Chuyến
  themChuyen: (chuyen: Omit<Chuyen, "id" | "createdAt" | "updatedAt">) => Chuyen;
  capNhatChuyen: (id: string, patch: Partial<Chuyen>) => void;
  xoaChuyen: (id: string) => void;
  // Thanh toán khách
  ghiNhanThanhToanKhach: (
    chuyenId: string,
    hangId: string,
    soTien: number,
    ghiChu?: string,
    hinhThuc?: ThongTinHinhThuc
  ) => void;
  xoaThanhToanKhach: (chuyenId: string, hangId: string, thanhToanId: string) => void;
  // Thanh toán người bốc hàng
  ghiNhanThanhToanBocHang: (
    chuyenId: string,
    congNoId: string,
    soTien: number,
    ghiChu?: string,
    hinhThuc?: ThongTinHinhThuc
  ) => void;
  xoaThanhToanBocHang: (chuyenId: string, congNoId: string, thanhToanId: string) => void;
  // Đối chiếu khoản chuyển khoản với sao kê (tìm theo id lần thanh toán, id là duy nhất toàn cục)
  datDoiChieuThanhToan: (thanhToanId: string, daDoiChieu: boolean) => void;
  // Reset
  khoiPhucDuLieuMau: () => void;
  xoaTatCaDuLieu: () => void;
  // Máy chủ, sao lưu
  /** true nếu dữ liệu đang lưu trên máy chủ (đã cấu hình Supabase). */
  cheDoMayChu: boolean;
  trangThaiLuu: TrangThaiLuu;
  emailDangNhap: string | null;
  dangXuat: () => Promise<void>;
  /** Dữ liệu cũ còn nằm trong trình duyệt của thiết bị này (từ bản chưa có máy chủ), nếu có. */
  docDuLieuCuTrenThietBi: () => AppData | null;
  /** Thay toàn bộ dữ liệu hiện tại bằng dữ liệu khác (khôi phục từ file, nạp dữ liệu cũ...). */
  thayTheToanBoDuLieu: (d: AppData) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function docLocalStorage(): AppData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? chuanHoaDuLieu(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function taiTuLocalStorage(): AppData {
  return docLocalStorage() ?? taoMockAppData();
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => taoMockAppData());
  const [daTaiXong, setDaTaiXong] = useState(false);

  // --- Trạng thái riêng của chế độ máy chủ ---
  const [giaiDoan, setGiaiDoan] = useState<GiaiDoanMayChu>(CHE_DO_MAY_CHU ? "khoi-dong" : "san-sang");
  const [trangThaiLuu, setTrangThaiLuu] = useState<TrangThaiLuu>("da-luu");
  const [emailDangNhap, setEmailDangNhap] = useState<string | null>(null);
  const [loiTai, setLoiTai] = useState("");
  const dataRef = useRef<AppData>(data);
  /** Bản dữ liệu đã lưu thành công lên máy chủ gần nhất (null = chưa nạp từ máy chủ). */
  const daLuuRef = useRef<AppData | null>(null);
  const phienBanRef = useRef(0);
  const userIdRef = useRef<string | null>(null);
  const dangLuuRef = useRef(false);
  const xungDotRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  /** Nạp dữ liệu từ máy chủ và vào app (hoặc sang màn hình "chưa có dữ liệu"). */
  const taiTuMayChu = useCallback(async () => {
    setGiaiDoan("tai-du-lieu");
    try {
      const ban = await mayChu.docDuLieu();
      const phien = mayChu.docPhien();
      setEmailDangNhap(phien?.email ?? null);
      userIdRef.current = phien?.userId ?? null;
      if (!ban) {
        setGiaiDoan("chua-co-du-lieu");
        return;
      }
      const d = chuanHoaDuLieu(ban.data);
      if (!d) {
        // Không được tự ghi đè: dữ liệu trên máy chủ có thể chỉ bị lỗi định dạng
        setLoiTai("Dữ liệu trên máy chủ không đọc được. Đừng thao tác thêm và hãy liên hệ người hỗ trợ.");
        setGiaiDoan("loi-tai");
        return;
      }
      xungDotRef.current = false;
      phienBanRef.current = ban.version;
      daLuuRef.current = d;
      setData(d);
      setTrangThaiLuu("da-luu");
      setDaTaiXong(true);
      setGiaiDoan("san-sang");
    } catch (e) {
      if (e instanceof mayChu.LoiXacThuc) {
        setGiaiDoan("dang-nhap");
        return;
      }
      setLoiTai(e instanceof Error ? e.message : "Không tải được dữ liệu.");
      setGiaiDoan("loi-tai");
    }
  }, []);

  useEffect(() => {
    if (!CHE_DO_MAY_CHU) {
      // Nạp dữ liệu từ localStorage sau khi hydrate xong ở phía client (localStorage
      // không khả dụng lúc build static export, nên phải nạp lại ở đây)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(taiTuLocalStorage());
      setDaTaiXong(true);
      return;
    }
    if (!mayChu.docPhien()) {
      setGiaiDoan("dang-nhap");
      return;
    }
    void taiTuMayChu();
  }, [taiTuMayChu]);

  // Chế độ trình duyệt (chưa cấu hình máy chủ): lưu vào localStorage như bản prototype cũ
  useEffect(() => {
    if (CHE_DO_MAY_CHU || !daTaiXong) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage có thể đầy hoặc không khả dụng - bỏ qua trong prototype
    }
  }, [data, daTaiXong]);

  /** Lưu lên máy chủ cho tới khi không còn thay đổi chưa lưu. */
  const luuLenMayChu = useCallback(async () => {
    if (dangLuuRef.current || xungDotRef.current) return;
    dangLuuRef.current = true;
    try {
      while (daLuuRef.current && dataRef.current !== daLuuRef.current) {
        const banCanLuu = dataRef.current;
        setTrangThaiLuu("dang-luu");
        const phienBanMoi = await mayChu.capNhatDuLieu(banCanLuu, phienBanRef.current);
        if (phienBanMoi === null) {
          // Thiết bị khác đã lưu trước - không ghi đè, để người dùng chọn
          xungDotRef.current = true;
          setTrangThaiLuu("xung-dot");
          return;
        }
        phienBanRef.current = phienBanMoi;
        daLuuRef.current = banCanLuu;
      }
      setTrangThaiLuu("da-luu");
    } catch (e) {
      if (e instanceof mayChu.LoiXacThuc) {
        // Giữ nguyên dữ liệu đang có trong bộ nhớ, đăng nhập lại xong sẽ lưu tiếp
        setTrangThaiLuu("loi");
        setGiaiDoan("dang-nhap");
        return;
      }
      // Lỗi tạm thời (mất mạng...): hiện "Lỗi lưu", effect bên dưới sẽ tự thử lại sau ít giây
      setTrangThaiLuu("loi");
    } finally {
      dangLuuRef.current = false;
    }
  }, []);

  // Chế độ máy chủ: có thay đổi thì đợi một chút rồi lưu
  useEffect(() => {
    if (!CHE_DO_MAY_CHU || giaiDoan !== "san-sang") return;
    if (!daLuuRef.current || data === daLuuRef.current || xungDotRef.current) return;
    setTrangThaiLuu("dang-luu");
    const hen = setTimeout(() => void luuLenMayChu(), 800);
    return () => clearTimeout(hen);
  }, [data, giaiDoan, luuLenMayChu]);

  // Lưu bị lỗi thì thử lại sau 5 giây
  useEffect(() => {
    if (!CHE_DO_MAY_CHU || giaiDoan !== "san-sang" || trangThaiLuu !== "loi") return;
    const hen = setTimeout(() => void luuLenMayChu(), 5000);
    return () => clearTimeout(hen);
  }, [trangThaiLuu, giaiDoan, luuLenMayChu]);

  // Quay lại tab/app: lưu ngay khi rời đi, và lấy bản mới nếu thiết bị khác đã sửa
  useEffect(() => {
    if (!CHE_DO_MAY_CHU || giaiDoan !== "san-sang") return;
    const khiDoiTab = async () => {
      if (document.visibilityState === "hidden") {
        void luuLenMayChu();
        return;
      }
      if (dangLuuRef.current || xungDotRef.current) return;
      if (!daLuuRef.current || dataRef.current !== daLuuRef.current) return;
      try {
        const v = await mayChu.docPhienBanDuLieu();
        if (v === null || v <= phienBanRef.current) return;
        const ban = await mayChu.docDuLieu();
        const d = ban ? chuanHoaDuLieu(ban.data) : null;
        // Chỉ nạp nếu trong lúc chờ không có thay đổi mới trên máy này
        if (ban && d && !dangLuuRef.current && dataRef.current === daLuuRef.current) {
          phienBanRef.current = ban.version;
          daLuuRef.current = d;
          setData(d);
        }
      } catch {
        // mất mạng thoáng qua - lần sau sẽ đồng bộ
      }
    };
    document.addEventListener("visibilitychange", khiDoiTab);
    return () => document.removeEventListener("visibilitychange", khiDoiTab);
  }, [giaiDoan, luuLenMayChu]);

  // Cảnh báo khi đóng trang lúc còn thay đổi chưa lưu
  useEffect(() => {
    if (!CHE_DO_MAY_CHU) return;
    const canhBao = (e: BeforeUnloadEvent) => {
      if (daLuuRef.current && dataRef.current !== daLuuRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", canhBao);
    return () => window.removeEventListener("beforeunload", canhBao);
  }, []);

  const dangNhap = useCallback(
    async (email: string, matKhau: string) => {
      const phien = await mayChu.dangNhap(email, matKhau);
      const conThayDoiChuaLuu =
        daLuuRef.current !== null &&
        dataRef.current !== daLuuRef.current &&
        userIdRef.current === phien.userId;
      if (conThayDoiChuaLuu) {
        // Phiên hết hạn giữa chừng: giữ thay đổi đang có và lưu tiếp
        setEmailDangNhap(phien.email);
        setGiaiDoan("san-sang");
        void luuLenMayChu();
        return;
      }
      await taiTuMayChu();
    },
    [luuLenMayChu, taiTuMayChu]
  );

  const khoiTaoDuLieu = useCallback(
    async (d: AppData) => {
      const phienBan = await mayChu.taoDuLieu(d);
      if (phienBan === null) {
        // Thiết bị khác vừa tạo dữ liệu - dùng bản đó
        await taiTuMayChu();
        return;
      }
      xungDotRef.current = false;
      phienBanRef.current = phienBan;
      daLuuRef.current = d;
      setData(d);
      setTrangThaiLuu("da-luu");
      setDaTaiXong(true);
      setGiaiDoan("san-sang");
    },
    [taiTuMayChu]
  );

  const dangXuat = useCallback(async () => {
    if (daLuuRef.current && dataRef.current !== daLuuRef.current) await luuLenMayChu();
    await mayChu.dangXuat();
    daLuuRef.current = null;
    phienBanRef.current = 0;
    userIdRef.current = null;
    xungDotRef.current = false;
    setData(taoDuLieuTrong());
    setEmailDangNhap(null);
    setTrangThaiLuu("da-luu");
    setDaTaiXong(false);
    setGiaiDoan("dang-nhap");
  }, [luuLenMayChu]);

  const docDuLieuCuTrenThietBi = useCallback(() => docLocalStorage(), []);
  const thayTheToanBoDuLieu = useCallback((d: AppData) => setData(d), []);

  const themXe = useCallback((xe: Omit<Xe, "id">) => {
    const moi: Xe = { ...xe, id: uuidv4() };
    setData((d) => ({ ...d, xeList: [...d.xeList, moi] }));
    return moi;
  }, []);

  const themTaiXe = useCallback((t: Omit<TaiXe, "id">) => {
    const moi: TaiXe = { ...t, id: uuidv4() };
    setData((d) => ({ ...d, taiXeList: [...d.taiXeList, moi] }));
    return moi;
  }, []);

  const themKhachHang = useCallback((k: Omit<KhachHang, "id">) => {
    const moi: KhachHang = { ...k, id: uuidv4() };
    setData((d) => ({ ...d, khachHangList: [...d.khachHangList, moi] }));
    return moi;
  }, []);

  const themLoaiHang = useCallback((l: Omit<LoaiHang, "id">) => {
    const moi: LoaiHang = { ...l, id: uuidv4() };
    setData((d) => ({ ...d, loaiHangList: [...d.loaiHangList, moi] }));
    return moi;
  }, []);

  const themNguoiBocHang = useCallback((n: Omit<NguoiBocHang, "id">) => {
    const moi: NguoiBocHang = { ...n, id: uuidv4() };
    setData((d) => ({ ...d, nguoiBocHangList: [...d.nguoiBocHangList, moi] }));
    return moi;
  }, []);

  const capNhatXe = useCallback((id: string, patch: Partial<Xe>) => {
    setData((d) => ({ ...d, xeList: d.xeList.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, []);
  const xoaXe = useCallback((id: string) => {
    setData((d) => ({ ...d, xeList: d.xeList.filter((x) => x.id !== id) }));
  }, []);

  const capNhatTaiXe = useCallback((id: string, patch: Partial<TaiXe>) => {
    setData((d) => ({ ...d, taiXeList: d.taiXeList.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  }, []);
  const xoaTaiXe = useCallback((id: string) => {
    setData((d) => ({ ...d, taiXeList: d.taiXeList.filter((t) => t.id !== id) }));
  }, []);

  const capNhatKhachHang = useCallback((id: string, patch: Partial<KhachHang>) => {
    setData((d) => ({
      ...d,
      khachHangList: d.khachHangList.map((k) => (k.id === id ? { ...k, ...patch } : k)),
    }));
  }, []);
  const xoaKhachHang = useCallback((id: string) => {
    setData((d) => ({ ...d, khachHangList: d.khachHangList.filter((k) => k.id !== id) }));
  }, []);

  const capNhatLoaiHang = useCallback((id: string, patch: Partial<LoaiHang>) => {
    setData((d) => ({
      ...d,
      loaiHangList: d.loaiHangList.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }, []);
  const xoaLoaiHang = useCallback((id: string) => {
    setData((d) => ({ ...d, loaiHangList: d.loaiHangList.filter((l) => l.id !== id) }));
  }, []);

  const capNhatNguoiBocHang = useCallback((id: string, patch: Partial<NguoiBocHang>) => {
    setData((d) => ({
      ...d,
      nguoiBocHangList: d.nguoiBocHangList.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  }, []);
  const xoaNguoiBocHang = useCallback((id: string) => {
    setData((d) => ({ ...d, nguoiBocHangList: d.nguoiBocHangList.filter((n) => n.id !== id) }));
  }, []);

  const themTaiKhoanNganHang = useCallback((t: Omit<TaiKhoanNganHang, "id">) => {
    const moi: TaiKhoanNganHang = { ...t, id: uuidv4() };
    setData((d) => ({ ...d, taiKhoanNganHangList: [...d.taiKhoanNganHangList, moi] }));
    return moi;
  }, []);
  const capNhatTaiKhoanNganHang = useCallback((id: string, patch: Partial<TaiKhoanNganHang>) => {
    setData((d) => ({
      ...d,
      taiKhoanNganHangList: d.taiKhoanNganHangList.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);
  const xoaTaiKhoanNganHang = useCallback((id: string) => {
    setData((d) => ({ ...d, taiKhoanNganHangList: d.taiKhoanNganHangList.filter((t) => t.id !== id) }));
  }, []);

  const themChuyen = useCallback((chuyen: Omit<Chuyen, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const moi: Chuyen = { ...chuyen, id: uuidv4(), createdAt: now, updatedAt: now };
    setData((d) => ({ ...d, chuyenList: [moi, ...d.chuyenList] }));
    return moi;
  }, []);

  const capNhatChuyen = useCallback((id: string, patch: Partial<Chuyen>) => {
    setData((d) => ({
      ...d,
      chuyenList: d.chuyenList.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
      ),
    }));
  }, []);

  const xoaChuyen = useCallback((id: string) => {
    setData((d) => ({ ...d, chuyenList: d.chuyenList.filter((c) => c.id !== id) }));
  }, []);

  const ghiNhanThanhToanKhach = useCallback(
    (chuyenId: string, hangId: string, soTien: number, ghiChu?: string, hinhThuc?: ThongTinHinhThuc) => {
      setData((d) => ({
        ...d,
        chuyenList: d.chuyenList.map((c) => {
          if (c.id !== chuyenId) return c;
          const daSua = suaHangTrongChuyen(c, hangId, (h) => ({
            ...h,
            danhSachThanhToan: [
              ...h.danhSachThanhToan,
              {
                id: uuidv4(),
                ngayThanhToan: new Date().toISOString(),
                soTien,
                ghiChu,
                ...(hinhThuc
                  ? {
                      hinhThuc: hinhThuc.hinhThuc,
                      taiKhoanId: hinhThuc.hinhThuc === "chuyen_khoan" ? hinhThuc.taiKhoanId : undefined,
                    }
                  : {}),
              },
            ],
          }));
          return { ...daSua, updatedAt: new Date().toISOString() };
        }),
      }));
    },
    []
  );

  const xoaThanhToanKhach = useCallback((chuyenId: string, hangId: string, thanhToanId: string) => {
    setData((d) => ({
      ...d,
      chuyenList: d.chuyenList.map((c) => {
        if (c.id !== chuyenId) return c;
        const daSua = suaHangTrongChuyen(c, hangId, (h) => ({
          ...h,
          danhSachThanhToan: h.danhSachThanhToan.filter((lt) => lt.id !== thanhToanId),
        }));
        return { ...daSua, updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const ghiNhanThanhToanBocHang = useCallback(
    (chuyenId: string, congNoId: string, soTien: number, ghiChu?: string, hinhThuc?: ThongTinHinhThuc) => {
      setData((d) => ({
        ...d,
        chuyenList: d.chuyenList.map((c) => {
          if (c.id !== chuyenId) return c;
          const daSua = suaCongNoBocHangTrongChuyen(c, congNoId, (cn) => ({
            ...cn,
            danhSachThanhToan: [
              ...cn.danhSachThanhToan,
              {
                id: uuidv4(),
                ngayThanhToan: new Date().toISOString(),
                soTien,
                ghiChu,
                ...(hinhThuc
                  ? {
                      hinhThuc: hinhThuc.hinhThuc,
                      taiKhoanId: hinhThuc.hinhThuc === "chuyen_khoan" ? hinhThuc.taiKhoanId : undefined,
                    }
                  : {}),
              },
            ],
          }));
          return { ...daSua, updatedAt: new Date().toISOString() };
        }),
      }));
    },
    []
  );

  const xoaThanhToanBocHang = useCallback((chuyenId: string, congNoId: string, thanhToanId: string) => {
    setData((d) => ({
      ...d,
      chuyenList: d.chuyenList.map((c) => {
        if (c.id !== chuyenId) return c;
        const daSua = suaCongNoBocHangTrongChuyen(c, congNoId, (cn) => ({
          ...cn,
          danhSachThanhToan: cn.danhSachThanhToan.filter((lt) => lt.id !== thanhToanId),
        }));
        return { ...daSua, updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const datDoiChieuThanhToan = useCallback((thanhToanId: string, daDoiChieu: boolean) => {
    setData((d) => ({
      ...d,
      chuyenList: d.chuyenList.map((c) =>
        suaLanThanhToanTrongChuyen(c, thanhToanId, (lt) => {
          // Chỉ khoản chuyển khoản mới có đối chiếu sao kê
          if (lt.hinhThuc !== "chuyen_khoan") return lt;
          return { ...lt, ngayDoiChieu: daDoiChieu ? new Date().toISOString() : undefined };
        })
      ),
    }));
  }, []);

  const khoiPhucDuLieuMau = useCallback(() => {
    setData(taoMockAppData());
  }, []);

  const xoaTatCaDuLieu = useCallback(() => {
    setData(taoDuLieuTrong());
  }, []);

  const value = useMemo<DataContextValue>(
    () => ({
      data,
      daTaiXong,
      themXe,
      themTaiXe,
      themKhachHang,
      themLoaiHang,
      themNguoiBocHang,
      themTaiKhoanNganHang,
      capNhatXe,
      xoaXe,
      capNhatTaiXe,
      xoaTaiXe,
      capNhatKhachHang,
      xoaKhachHang,
      capNhatLoaiHang,
      xoaLoaiHang,
      capNhatNguoiBocHang,
      xoaNguoiBocHang,
      capNhatTaiKhoanNganHang,
      xoaTaiKhoanNganHang,
      themChuyen,
      capNhatChuyen,
      xoaChuyen,
      ghiNhanThanhToanKhach,
      xoaThanhToanKhach,
      ghiNhanThanhToanBocHang,
      xoaThanhToanBocHang,
      datDoiChieuThanhToan,
      khoiPhucDuLieuMau,
      xoaTatCaDuLieu,
      cheDoMayChu: CHE_DO_MAY_CHU,
      trangThaiLuu,
      emailDangNhap,
      dangXuat,
      docDuLieuCuTrenThietBi,
      thayTheToanBoDuLieu,
    }),
    [
      data,
      daTaiXong,
      themXe,
      themTaiXe,
      themKhachHang,
      themLoaiHang,
      themNguoiBocHang,
      themTaiKhoanNganHang,
      capNhatXe,
      xoaXe,
      capNhatTaiXe,
      xoaTaiXe,
      capNhatKhachHang,
      xoaKhachHang,
      capNhatLoaiHang,
      xoaLoaiHang,
      capNhatNguoiBocHang,
      xoaNguoiBocHang,
      capNhatTaiKhoanNganHang,
      xoaTaiKhoanNganHang,
      themChuyen,
      capNhatChuyen,
      xoaChuyen,
      ghiNhanThanhToanKhach,
      xoaThanhToanKhach,
      ghiNhanThanhToanBocHang,
      xoaThanhToanBocHang,
      datDoiChieuThanhToan,
      khoiPhucDuLieuMau,
      xoaTatCaDuLieu,
      trangThaiLuu,
      emailDangNhap,
      dangXuat,
      docDuLieuCuTrenThietBi,
      thayTheToanBoDuLieu,
    ]
  );

  // Chế độ máy chủ: chưa vào được app thì hiện màn hình đăng nhập / tải dữ liệu
  if (CHE_DO_MAY_CHU && giaiDoan !== "san-sang") {
    return (
      <ManHinhMayChu
        giaiDoan={giaiDoan}
        loiTai={loiTai}
        dangNhap={dangNhap}
        khoiTao={khoiTaoDuLieu}
        thuLai={() => void taiTuMayChu()}
        docDuLieuCu={docDuLieuCuTrenThietBi}
      />
    );
  }

  return (
    <DataContext.Provider value={value}>
      {children}
      <Modal
        open={trangThaiLuu === "xung-dot"}
        closable={false}
        maskClosable={false}
        keyboard={false}
        title="Dữ liệu đã được thay đổi ở thiết bị khác"
        footer={[
          <Button key="sao-luu" onClick={() => taiXuongFileSaoLuu(dataRef.current)}>
            Tải bản sao lưu của máy này
          </Button>,
          <Button key="tai-lai" type="primary" onClick={() => void taiTuMayChu()}>
            Tải lại dữ liệu mới
          </Button>,
        ]}
      >
        Có thiết bị khác vừa lưu dữ liệu. Để tránh ghi đè nhầm, thay đổi vừa rồi trên máy này chưa được lưu. Bạn hãy
        tải lại dữ liệu mới, rồi nhập lại thay đổi nếu cần. Muốn giữ lại bản đang có trên máy này thì tải bản sao lưu
        trước.
      </Modal>
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData phải được dùng bên trong DataProvider");
  return ctx;
}

// Helper lookups dùng chung
export function useLookup(data: AppData) {
  return useMemo(() => {
    const xeMap = new Map(data.xeList.map((x) => [x.id, x]));
    const taiXeMap = new Map(data.taiXeList.map((t) => [t.id, t]));
    const khachHangMap = new Map(data.khachHangList.map((k) => [k.id, k]));
    const loaiHangMap = new Map(data.loaiHangList.map((l) => [l.id, l]));
    const nguoiBocHangMap = new Map(data.nguoiBocHangList.map((n) => [n.id, n]));
    const taiKhoanMap = new Map(data.taiKhoanNganHangList.map((t) => [t.id, t]));
    return { xeMap, taiXeMap, khachHangMap, loaiHangMap, nguoiBocHangMap, taiKhoanMap };
  }, [data]);
}
