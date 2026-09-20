// ==========================================================================
// CÁC HÀM TÍNH TOÁN NGHIỆP VỤ
// Quy tắc: KHÔNG tự suy đoán công thức giá. Mọi số tiền lấy trực tiếp từ
// dữ liệu người dùng nhập (giaTriHang, tienKhachPhaiTra, soTien...).
// ==========================================================================
import type {
  Chuyen,
  ChieuChuyen,
  ChiPhiChuyen,
  HangTrenChuyen,
  CongNoBocHang,
  LoaiChieu,
  TrangThaiThanhToan,
  TongHopSoLuong,
  TaiKhoanNganHang,
  ThongTinHinhThuc,
} from "@/types";
import { SO_NGAY_QUA_HAN_DOI_CHIEU } from "./constants";

/** Chuyến có phải khứ hồi (có chiều về) hay không. */
export function laChuyenKhuHoi(chuyen: Chuyen): boolean {
  return !!chuyen.chieuVe;
}

export interface ChieuCuaChuyen {
  loai: LoaiChieu;
  nhan: string; // "Chiều đi" | "Chiều về"
  ngay: string;
  duLieu: ChieuChuyen;
}

/**
 * Lấy danh sách các chiều thực sự tồn tại của một chuyến (luôn có chiều đi,
 * có thêm chiều về nếu là chuyến khứ hồi). Dùng hàm này thay vì đọc trực tiếp
 * chuyen.chieuDi/chuyen.chieuVe để mọi nơi tổng hợp/duyệt qua chuyến đều
 * tự động cộng đúng cả hai chiều khi có.
 */
export function layCacChieuCuaChuyen(chuyen: Chuyen): ChieuCuaChuyen[] {
  const ds: ChieuCuaChuyen[] = [
    { loai: "di", nhan: "Chiều đi", ngay: chuyen.ngay, duLieu: chuyen.chieuDi },
  ];
  if (chuyen.chieuVe) {
    ds.push({ loai: "ve", nhan: "Chiều về", ngay: chuyen.ngayVe ?? chuyen.ngay, duLieu: chuyen.chieuVe });
  }
  return ds;
}

/** Lấy dữ liệu một chiều cụ thể của chuyến (trả về undefined nếu chuyến không có chiều đó). */
export function layChieu(chuyen: Chuyen, loai: LoaiChieu): ChieuChuyen | undefined {
  return loai === "di" ? chuyen.chieuDi : chuyen.chieuVe;
}

/** Tổng giá trị hàng của một danh sách hàng (dùng cho một chiều bất kỳ). */
export function tinhTongGiaTriHang(danhSachHang: HangTrenChuyen[]): number {
  return danhSachHang.reduce((sum, h) => sum + h.giaTriHang, 0);
}

/** Tổng tiền khách phải trả của một danh sách hàng. */
export function tinhTongPhaiThu(danhSachHang: HangTrenChuyen[]): number {
  return danhSachHang.reduce((sum, h) => sum + h.tienKhachPhaiTra, 0);
}

/** Tổng tiền đã thu của một danh sách hàng. */
export function tinhTongDaThu(danhSachHang: HangTrenChuyen[]): number {
  return danhSachHang.reduce((sum, h) => sum + tinhDaThuHang(h), 0);
}

/** Tổng chi phí của một danh sách chi phí. */
export function tinhTongChiPhi(danhSachChiPhi: ChiPhiChuyen[]): number {
  return danhSachChiPhi.reduce((sum, c) => sum + c.soTien, 0);
}

/** Tổng phải trả người bốc hàng của một danh sách công nợ bốc hàng. */
export function tinhTongPhaiTraBocHang(danhSachCongNoBocHang: CongNoBocHang[]): number {
  return danhSachCongNoBocHang.reduce((sum, c) => sum + c.soTienPhaiTra, 0);
}

/** Tổng đã trả người bốc hàng của một danh sách công nợ bốc hàng. */
export function tinhTongDaTraBocHang(danhSachCongNoBocHang: CongNoBocHang[]): number {
  return danhSachCongNoBocHang.reduce((sum, c) => sum + tinhDaTraCongNoBocHang(c), 0);
}

/** Tổng số tiền khách đã trả cho MỘT dòng hàng. */
export function tinhDaThuHang(hang: HangTrenChuyen): number {
  return hang.danhSachThanhToan.reduce((sum, lt) => sum + lt.soTien, 0);
}

/** Số tiền còn phải thu của MỘT dòng hàng. */
export function tinhConPhaiThuHang(hang: HangTrenChuyen): number {
  return Math.max(0, hang.tienKhachPhaiTra - tinhDaThuHang(hang));
}

/** Trạng thái thanh toán của một dòng hàng. */
export function tinhTrangThaiThanhToanHang(hang: HangTrenChuyen): TrangThaiThanhToan {
  const daThu = tinhDaThuHang(hang);
  if (daThu <= 0) return "chua_thu";
  if (daThu >= hang.tienKhachPhaiTra) return "da_thu_du";
  return "mot_phan";
}

/** Tổng giá trị hàng của một chuyến (cộng tất cả dòng hàng - cả chiều đi lẫn chiều về nếu có). */
export function tinhTongGiaTriHangChuyen(chuyen: Chuyen): number {
  return layCacChieuCuaChuyen(chuyen).reduce((sum, c) => sum + tinhTongGiaTriHang(c.duLieu.danhSachHang), 0);
}

/** Tổng tiền khách phải trả của một chuyến (gộp cả 2 chiều). */
export function tinhTongPhaiThuChuyen(chuyen: Chuyen): number {
  return layCacChieuCuaChuyen(chuyen).reduce((sum, c) => sum + tinhTongPhaiThu(c.duLieu.danhSachHang), 0);
}

/** Tổng tiền đã thu của một chuyến (gộp cả 2 chiều). */
export function tinhTongDaThuChuyen(chuyen: Chuyen): number {
  return layCacChieuCuaChuyen(chuyen).reduce((sum, c) => sum + tinhTongDaThu(c.duLieu.danhSachHang), 0);
}

/** Tổng còn phải thu của một chuyến. */
export function tinhTongConPhaiThuChuyen(chuyen: Chuyen): number {
  return tinhTongPhaiThuChuyen(chuyen) - tinhTongDaThuChuyen(chuyen);
}

/**
 * Trạng thái thu tiền của cả chuyến (gộp 2 chiều) - dùng để tô màu thẻ chuyến
 * đồng nhất giữa giao diện điện thoại và giao diện web.
 */
export function tinhTrangThaiChuyen(chuyen: Chuyen): TrangThaiThanhToan {
  const phaiThu = tinhTongPhaiThuChuyen(chuyen);
  const daThu = tinhTongDaThuChuyen(chuyen);
  if (phaiThu <= 0 || daThu >= phaiThu) return "da_thu_du";
  if (daThu <= 0) return "chua_thu";
  return "mot_phan";
}

/** Tổng chi phí của một chuyến (gộp cả 2 chiều). */
export function tinhTongChiPhiChuyen(chuyen: Chuyen): number {
  return layCacChieuCuaChuyen(chuyen).reduce((sum, c) => sum + tinhTongChiPhi(c.duLieu.danhSachChiPhi), 0);
}

/** Tổng tiền đã trả cho MỘT khoản công nợ bốc hàng. */
export function tinhDaTraCongNoBocHang(congNo: CongNoBocHang): number {
  return congNo.danhSachThanhToan.reduce((sum, lt) => sum + lt.soTien, 0);
}

/** Số tiền còn nợ của MỘT khoản công nợ bốc hàng. */
export function tinhConNoCongNoBocHang(congNo: CongNoBocHang): number {
  return Math.max(0, congNo.soTienPhaiTra - tinhDaTraCongNoBocHang(congNo));
}

export function tinhTrangThaiCongNoBocHang(congNo: CongNoBocHang): TrangThaiThanhToan {
  const daTra = tinhDaTraCongNoBocHang(congNo);
  if (daTra <= 0) return "chua_thu";
  if (daTra >= congNo.soTienPhaiTra) return "da_thu_du";
  return "mot_phan";
}

/** Tổng phải trả người bốc hàng của một chuyến (gộp cả 2 chiều). */
export function tinhTongPhaiTraBocHangChuyen(chuyen: Chuyen): number {
  return layCacChieuCuaChuyen(chuyen).reduce(
    (sum, c) => sum + tinhTongPhaiTraBocHang(c.duLieu.danhSachCongNoBocHang),
    0
  );
}

/** Tổng đã trả người bốc hàng của một chuyến (gộp cả 2 chiều). */
export function tinhTongDaTraBocHangChuyen(chuyen: Chuyen): number {
  return layCacChieuCuaChuyen(chuyen).reduce(
    (sum, c) => sum + tinhTongDaTraBocHang(c.duLieu.danhSachCongNoBocHang),
    0
  );
}

/** Tổng còn phải trả người bốc hàng của một chuyến. */
export function tinhTongConPhaiTraBocHangChuyen(chuyen: Chuyen): number {
  return tinhTongPhaiTraBocHangChuyen(chuyen) - tinhTongDaTraBocHangChuyen(chuyen);
}

/**
 * Lợi nhuận của một chuyến (gộp cả 2 chiều nếu là khứ hồi):
 * Lợi nhuận = Doanh thu vận chuyển (tổng tiền khách phải trả)
 *             - Tổng chi phí chuyến
 *             - Tổng tiền phải trả người bốc hàng.
 * Lưu ý: tính trên số PHẢI thu/phải trả (không phụ thuộc đã thu/đã trả hay chưa),
 * vì lợi nhuận phản ánh giá trị kinh tế của chuyến, không phải dòng tiền thực tế.
 */
export function tinhLoiNhuanChuyen(chuyen: Chuyen): number {
  return (
    tinhTongPhaiThuChuyen(chuyen) - tinhTongChiPhiChuyen(chuyen) - tinhTongPhaiTraBocHangChuyen(chuyen)
  );
}

/**
 * Tổng hợp số lượng hàng theo TỪNG đơn vị riêng biệt.
 * KHÔNG cộng gộp các đơn vị khác nhau (VD: không cộng "4 tấn" với "90 bao").
 */
export function tongHopSoLuongTheoDonVi(danhSachHang: HangTrenChuyen[]): TongHopSoLuong[] {
  const map = new Map<string, number>();
  for (const h of danhSachHang) {
    map.set(h.donVi, (map.get(h.donVi) ?? 0) + h.soLuong);
  }
  return Array.from(map.entries()).map(([donVi, soLuong]) => ({ donVi, soLuong }));
}

/** Định dạng chuỗi hiển thị số lượng theo đơn vị, VD: "4 tấn, 130 bao". */
export function formatTongHopSoLuong(danhSachHang: HangTrenChuyen[]): string {
  const tongHop = tongHopSoLuongTheoDonVi(danhSachHang);
  if (tongHop.length === 0) return "—";
  return tongHop.map((t) => `${formatSoLuong(t.soLuong)} ${t.donVi}`).join(", ");
}

export function formatSoLuong(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n);
}

/** Định dạng tiền tệ VNĐ. */
export function formatTien(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";
}

export function formatNgay(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN");
}

/** Nhãn ngắn của tài khoản ngân hàng, VD: "Vietcombank ••4567" (chỉ hiện 4 số cuối). */
export function nhanTaiKhoan(tk: Pick<TaiKhoanNganHang, "tenNganHang" | "soTaiKhoan">): string {
  const so = tk.soTaiKhoan.replace(/\s/g, "");
  return `${tk.tenNganHang} ••${so.slice(-4)}`;
}

/**
 * Nhãn hình thức của một lần thanh toán để hiển thị trong lịch sử.
 * Trả về undefined với lần thanh toán cũ chưa ghi hình thức.
 */
export function nhanHinhThucThanhToan(
  lt: { hinhThuc?: ThongTinHinhThuc["hinhThuc"]; taiKhoanId?: string },
  taiKhoanMap: Map<string, TaiKhoanNganHang>
): string | undefined {
  if (lt.hinhThuc === "tien_mat") return "Tiền mặt";
  if (lt.hinhThuc === "chuyen_khoan") {
    const tk = lt.taiKhoanId ? taiKhoanMap.get(lt.taiKhoanId) : undefined;
    return tk ? `Chuyển khoản · ${nhanTaiKhoan(tk)}` : "Chuyển khoản";
  }
  return undefined;
}

/**
 * Khoản chuyển khoản chưa đối chiếu sao kê và đã ghi nhận quá SO_NGAY_QUA_HAN_DOI_CHIEU ngày.
 * Tiền mặt, khoản đã đối chiếu và các lần thanh toán cũ chưa ghi hình thức thì không bao giờ quá hạn.
 */
export function laQuaHanDoiChieu(lt: {
  hinhThuc?: ThongTinHinhThuc["hinhThuc"];
  ngayThanhToan: string;
  ngayDoiChieu?: string;
}): boolean {
  if (lt.hinhThuc !== "chuyen_khoan" || lt.ngayDoiChieu) return false;
  const troiQua = Date.now() - new Date(lt.ngayThanhToan).getTime();
  return troiQua >= SO_NGAY_QUA_HAN_DOI_CHIEU * 24 * 60 * 60 * 1000;
}
