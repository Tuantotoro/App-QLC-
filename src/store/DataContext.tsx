"use client";

// ==========================================================================
// DATA CONTEXT - Quản lý state toàn cục cho prototype (thay thế database)
// Lưu vào localStorage để mô phỏng việc dữ liệu được "lưu lại".
// ==========================================================================
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

function taiTuLocalStorage(): AppData {
  if (typeof window === "undefined") return taoMockAppData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return taoMockAppData();
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.chuyenList) return taoMockAppData();
    // Dữ liệu lưu từ phiên bản cũ chưa có danh sách tài khoản ngân hàng
    return { ...parsed, taiKhoanNganHangList: parsed.taiKhoanNganHangList ?? [] };
  } catch {
    return taoMockAppData();
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => taoMockAppData());
  const [daTaiXong, setDaTaiXong] = useState(false);

  useEffect(() => {
    // Nạp dữ liệu từ localStorage sau khi hydrate xong ở phía client (localStorage
    // không khả dụng lúc build static export, nên phải nạp lại ở đây)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(taiTuLocalStorage());
    setDaTaiXong(true);
  }, []);

  useEffect(() => {
    if (!daTaiXong) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage có thể đầy hoặc không khả dụng - bỏ qua trong prototype
    }
  }, [data, daTaiXong]);

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
    setData({
      xeList: [],
      taiXeList: [],
      khachHangList: [],
      loaiHangList: [],
      nguoiBocHangList: [],
      taiKhoanNganHangList: [],
      chuyenList: [],
    });
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
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
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
