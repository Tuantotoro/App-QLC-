// ==========================================================================
// TỔNG HỢP CÔNG NỢ - gộp dữ liệu từ nhiều chuyến theo khách hàng / người bốc
// ==========================================================================
import type { AppData, Chuyen, LoaiChieu, TrangThaiThanhToan } from "@/types";
import {
  laQuaHanDoiChieu,
  tinhDaThuHang,
  tinhConNoCongNoBocHang,
  tinhDaTraCongNoBocHang,
  layCacChieuCuaChuyen,
} from "./calc";

export interface DongHangCoChuyen {
  chuyen: Chuyen;
  hangId: string;
  /** Dòng hàng này thuộc chiều đi hay chiều về của chuyến. */
  loai: LoaiChieu;
}

export interface CongNoKhachHang {
  khachHangId: string;
  tongPhaiThu: number;
  tongDaThu: number;
  tongConNo: number;
  trangThai: TrangThaiThanhToan;
  soChuyenLienQuan: number;
  danhSachDong: DongHangCoChuyen[];
}

/** Gộp công nợ phải thu theo từng khách hàng, trên toàn bộ danh sách chuyến. */
export function tongHopCongNoKhachHang(data: AppData): CongNoKhachHang[] {
  const map = new Map<string, CongNoKhachHang>();

  for (const chuyen of data.chuyenList) {
    for (const { loai, duLieu } of layCacChieuCuaChuyen(chuyen)) {
      for (const hang of duLieu.danhSachHang) {
        const daThu = tinhDaThuHang(hang);
        const existing = map.get(hang.khachHangId);
        const entry: CongNoKhachHang =
          existing ??
          {
            khachHangId: hang.khachHangId,
            tongPhaiThu: 0,
            tongDaThu: 0,
            tongConNo: 0,
            trangThai: "chua_thu",
            soChuyenLienQuan: 0,
            danhSachDong: [],
          };
        entry.tongPhaiThu += hang.tienKhachPhaiTra;
        entry.tongDaThu += daThu;
        entry.danhSachDong.push({ chuyen, hangId: hang.id, loai });
        map.set(hang.khachHangId, entry);
      }
    }
  }

  const result = Array.from(map.values()).map((e) => {
    const tongConNo = Math.max(0, e.tongPhaiThu - e.tongDaThu);
    let trangThai: TrangThaiThanhToan = "chua_thu";
    if (e.tongDaThu > 0 && tongConNo > 0) trangThai = "mot_phan";
    else if (tongConNo <= 0 && e.tongPhaiThu > 0) trangThai = "da_thu_du";
    const soChuyenLienQuan = new Set(e.danhSachDong.map((d) => d.chuyen.id)).size;
    return { ...e, tongConNo, trangThai, soChuyenLienQuan };
  });

  return result;
}

export interface DongCongNoCoChuyen {
  chuyen: Chuyen;
  congNoId: string;
  /** Khoản công nợ này thuộc chiều đi hay chiều về của chuyến. */
  loai: LoaiChieu;
}

export interface CongNoNguoiBocHang {
  nguoiBocHangId: string;
  tongPhaiTra: number;
  tongDaTra: number;
  tongConNo: number;
  trangThai: TrangThaiThanhToan;
  soChuyenLienQuan: number;
  danhSachDong: DongCongNoCoChuyen[];
}

/** Gộp công nợ phải trả theo từng người bốc hàng, trên toàn bộ danh sách chuyến. */
export function tongHopCongNoNguoiBocHang(data: AppData): CongNoNguoiBocHang[] {
  const map = new Map<string, CongNoNguoiBocHang>();

  for (const chuyen of data.chuyenList) {
    for (const { loai, duLieu } of layCacChieuCuaChuyen(chuyen)) {
      for (const congNo of duLieu.danhSachCongNoBocHang) {
        const daTra = tinhDaTraCongNoBocHang(congNo);
        const existing = map.get(congNo.nguoiBocHangId);
        const entry: CongNoNguoiBocHang =
          existing ??
          {
            nguoiBocHangId: congNo.nguoiBocHangId,
            tongPhaiTra: 0,
            tongDaTra: 0,
            tongConNo: 0,
            trangThai: "chua_thu",
            soChuyenLienQuan: 0,
            danhSachDong: [],
          };
        entry.tongPhaiTra += congNo.soTienPhaiTra;
        entry.tongDaTra += daTra;
        entry.danhSachDong.push({ chuyen, congNoId: congNo.id, loai });
        map.set(congNo.nguoiBocHangId, entry);
      }
    }
  }

  const result = Array.from(map.values()).map((e) => {
    const tongConNo = Math.max(0, e.tongPhaiTra - e.tongDaTra);
    let trangThai: TrangThaiThanhToan = "chua_thu";
    if (e.tongDaTra > 0 && tongConNo > 0) trangThai = "mot_phan";
    else if (tongConNo <= 0 && e.tongPhaiTra > 0) trangThai = "da_thu_du";
    const soChuyenLienQuan = new Set(e.danhSachDong.map((d) => d.chuyen.id)).size;
    return { ...e, tongConNo, trangThai, soChuyenLienQuan };
  });

  return result;
}

export interface TongHopTaiKhoan {
  /** Tổng tiền khách đã chuyển vào tài khoản (các lần thu ghi nhận chuyển khoản vào tài khoản này). */
  daNhan: number;
  /** Tổng tiền đã trả cho người bốc hàng từ tài khoản này. */
  daTra: number;
  /** Số chuyến có ít nhất một giao dịch qua tài khoản này. */
  soChuyen: number;
  /** Tổng số lần chuyển khoản (nhận + trả) qua tài khoản này. */
  soGiaoDich: number;
  /** Số lần chuyển khoản chưa đối chiếu với sao kê. */
  soChuaDoiChieu: number;
  /** Số lần chuyển khoản chưa đối chiếu và đã quá hạn (xem laQuaHanDoiChieu). */
  soQuaHan: number;
}

/**
 * Tổng hợp các giao dịch chuyển khoản theo từng tài khoản ngân hàng.
 * Chỉ cộng các lần thanh toán đã ghi nhận - KHÔNG tính số dư (chi phí chuyến, tiền mặt
 * và số dư đầu kỳ không được app theo dõi nên không thể suy ra số dư thật).
 */
export function tongHopTheoTaiKhoan(data: AppData): Map<string, TongHopTaiKhoan> {
  const ketQua = new Map<string, TongHopTaiKhoan>();
  const lay = (id: string): TongHopTaiKhoan => {
    let v = ketQua.get(id);
    if (!v) {
      v = { daNhan: 0, daTra: 0, soChuyen: 0, soGiaoDich: 0, soChuaDoiChieu: 0, soQuaHan: 0 };
      ketQua.set(id, v);
    }
    return v;
  };

  for (const chuyen of data.chuyenList) {
    const taiKhoanTrongChuyen = new Set<string>();
    for (const ch of layCacChieuCuaChuyen(chuyen)) {
      for (const h of ch.duLieu.danhSachHang) {
        for (const lt of h.danhSachThanhToan) {
          if (lt.hinhThuc === "chuyen_khoan" && lt.taiKhoanId) {
            const tk = lay(lt.taiKhoanId);
            tk.daNhan += lt.soTien;
            tk.soGiaoDich += 1;
            if (!lt.ngayDoiChieu) tk.soChuaDoiChieu += 1;
            if (laQuaHanDoiChieu(lt)) tk.soQuaHan += 1;
            taiKhoanTrongChuyen.add(lt.taiKhoanId);
          }
        }
      }
      for (const cn of ch.duLieu.danhSachCongNoBocHang) {
        for (const lt of cn.danhSachThanhToan) {
          if (lt.hinhThuc === "chuyen_khoan" && lt.taiKhoanId) {
            const tk = lay(lt.taiKhoanId);
            tk.daTra += lt.soTien;
            tk.soGiaoDich += 1;
            if (!lt.ngayDoiChieu) tk.soChuaDoiChieu += 1;
            if (laQuaHanDoiChieu(lt)) tk.soQuaHan += 1;
            taiKhoanTrongChuyen.add(lt.taiKhoanId);
          }
        }
      }
    }
    taiKhoanTrongChuyen.forEach((id) => {
      lay(id).soChuyen += 1;
    });
  }
  return ketQua;
}

/** Một lần chuyển khoản qua một tài khoản ngân hàng - dùng cho màn hình đối chiếu sao kê. */
export interface GiaoDichChuyenKhoan {
  /** id lần thanh toán. */
  id: string;
  chuyenId: string;
  loai: LoaiChieu;
  xeId: string;
  /** "nhan": khách chuyển vào. "tra": trả cho người bốc hàng. */
  huong: "nhan" | "tra";
  /** id khách hàng (huong = nhan) hoặc id người bốc hàng (huong = tra). */
  doiTuongId: string;
  ngayThanhToan: string;
  soTien: number;
  ghiChu?: string;
  ngayDoiChieu?: string;
  /** Chưa đối chiếu và đã quá hạn - cần hỏi lại khách / kiểm tra lại. */
  quaHan: boolean;
}

/** Tất cả lần chuyển khoản qua một tài khoản, mới nhất lên đầu. */
export function layGiaoDichChuyenKhoan(data: AppData, taiKhoanId: string): GiaoDichChuyenKhoan[] {
  const ds: GiaoDichChuyenKhoan[] = [];
  for (const chuyen of data.chuyenList) {
    for (const { loai, duLieu } of layCacChieuCuaChuyen(chuyen)) {
      for (const h of duLieu.danhSachHang) {
        for (const lt of h.danhSachThanhToan) {
          if (lt.hinhThuc === "chuyen_khoan" && lt.taiKhoanId === taiKhoanId) {
            ds.push({
              id: lt.id,
              chuyenId: chuyen.id,
              loai,
              xeId: duLieu.xeId,
              huong: "nhan",
              doiTuongId: h.khachHangId,
              ngayThanhToan: lt.ngayThanhToan,
              soTien: lt.soTien,
              ghiChu: lt.ghiChu,
              ngayDoiChieu: lt.ngayDoiChieu,
              quaHan: laQuaHanDoiChieu(lt),
            });
          }
        }
      }
      for (const cn of duLieu.danhSachCongNoBocHang) {
        for (const lt of cn.danhSachThanhToan) {
          if (lt.hinhThuc === "chuyen_khoan" && lt.taiKhoanId === taiKhoanId) {
            ds.push({
              id: lt.id,
              chuyenId: chuyen.id,
              loai,
              xeId: duLieu.xeId,
              huong: "tra",
              doiTuongId: cn.nguoiBocHangId,
              ngayThanhToan: lt.ngayThanhToan,
              soTien: lt.soTien,
              ghiChu: lt.ghiChu,
              ngayDoiChieu: lt.ngayDoiChieu,
              quaHan: laQuaHanDoiChieu(lt),
            });
          }
        }
      }
    }
  }
  return ds.sort((x, y) => new Date(y.ngayThanhToan).getTime() - new Date(x.ngayThanhToan).getTime());
}
