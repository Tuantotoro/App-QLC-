// ==========================================================================
// TÍNH KHẤU HAO XE VÀ LÃI VAY MUA XE
// Quy tắc:
// - Khấu hao: đường thẳng (straight-line) - cách tính khấu hao tài sản cố định
//   phổ biến và minh bạch nhất, đúng tinh thần chuẩn mực kế toán VN cho xe cơ giới.
// - Vay vốn: hỗ trợ 2 cách người dùng hay gặp ở ngân hàng VN khi vay mua xe:
//     + "du_no_giam_dan": gốc trả đều mỗi tháng, lãi tính trên dư nợ còn lại
//       (giảm dần theo thời gian) - tổng tiền trả giảm dần qua các tháng.
//     + "tra_deu_hang_thang": trả đều mỗi tháng (annuity) - tổng gốc + lãi
//       mỗi tháng bằng nhau, phần lãi giảm dần còn phần gốc tăng dần.
// Đây chỉ là công cụ TÍNH TOÁN dựa trên số liệu người dùng nhập (giá mua, lãi
// suất, số tháng vay...) - không thay thế lịch trả nợ thực tế của ngân hàng.
// ==========================================================================
import dayjs from "dayjs";
import type { ThongTinMuaXe, ThongTinVayVonMuaXe } from "@/types";

/** Số tháng đã trôi qua kể từ ngày bắt đầu đến ngày tham chiếu (>= 0, làm tròn xuống). */
function soThangDaTrai(ngayBatDau: string, ngayThamChieu: string): number {
  const bd = dayjs(ngayBatDau);
  const tc = dayjs(ngayThamChieu);
  if (!bd.isValid() || !tc.isValid() || tc.isBefore(bd, "day")) return 0;
  return tc.diff(bd, "month");
}

// --------------------------------------------------------------------------
// KHẤU HAO
// --------------------------------------------------------------------------

/** Khấu hao mỗi tháng (đường thẳng) = (Giá mua - Giá trị thanh lý) / (số năm x 12). */
export function tinhKhauHaoThang(mua: ThongTinMuaXe): number {
  const soThang = Math.max(1, Math.round(mua.soNamKhauHao * 12));
  const giaTriKhauHao = Math.max(0, mua.giaMua - (mua.giaTriThanhLy ?? 0));
  return giaTriKhauHao / soThang;
}

/** Khấu hao lũy kế tính đến ngày tham chiếu (không vượt quá giá trị được phép khấu hao). */
export function tinhKhauHaoLuyKe(mua: ThongTinMuaXe, ngayThamChieu: string): number {
  const tongSoThang = Math.max(1, Math.round(mua.soNamKhauHao * 12));
  const soThangDaQua = Math.min(soThangDaTrai(mua.ngayMua, ngayThamChieu), tongSoThang);
  return tinhKhauHaoThang(mua) * soThangDaQua;
}

/** Giá trị còn lại (giá sổ sách) của xe tại ngày tham chiếu. */
export function tinhGiaTriConLai(mua: ThongTinMuaXe, ngayThamChieu: string): number {
  return mua.giaMua - tinhKhauHaoLuyKe(mua, ngayThamChieu);
}

/** Xe đã khấu hao hết hay chưa tại ngày tham chiếu. */
export function daKhauHaoHet(mua: ThongTinMuaXe, ngayThamChieu: string): boolean {
  const tongSoThang = Math.max(1, Math.round(mua.soNamKhauHao * 12));
  return soThangDaTrai(mua.ngayMua, ngayThamChieu) >= tongSoThang;
}

export interface DongKhauHao {
  thang: number; // Tháng khấu hao thứ mấy (1-based)
  ngay: string; // Ngày cuối kỳ khấu hao đó (ISO) - ước tính = ngày mua + n tháng
  khauHaoThang: number;
  khauHaoLuyKe: number;
  giaTriConLai: number;
}

/** Bảng khấu hao đầy đủ từng tháng, từ tháng 1 đến hết vòng đời khấu hao. */
export function tinhBangKhauHao(mua: ThongTinMuaXe): DongKhauHao[] {
  const tongSoThang = Math.max(1, Math.round(mua.soNamKhauHao * 12));
  const khauHaoThang = tinhKhauHaoThang(mua);
  const bang: DongKhauHao[] = [];
  let luyKe = 0;
  for (let k = 1; k <= tongSoThang; k++) {
    luyKe += khauHaoThang;
    bang.push({
      thang: k,
      ngay: dayjs(mua.ngayMua).add(k, "month").format("YYYY-MM-DD"),
      khauHaoThang,
      khauHaoLuyKe: luyKe,
      giaTriConLai: Math.max(0, mua.giaMua - luyKe),
    });
  }
  return bang;
}

// --------------------------------------------------------------------------
// LÃI VAY / BẢNG TRẢ NỢ
// --------------------------------------------------------------------------

export interface DongTraNo {
  thang: number; // Kỳ trả nợ thứ mấy (1-based)
  ngay: string; // Ngày đến hạn (ISO) - ước tính = ngày giải ngân + n tháng
  duNoDau: number;
  traGoc: number;
  traLai: number;
  duNoCuoi: number;
}

/** Bảng trả nợ theo dư nợ giảm dần: gốc đều mỗi tháng, lãi trên dư nợ đầu kỳ. */
function bangTraNoGiamDan(vay: ThongTinVayVonMuaXe): DongTraNo[] {
  const laiThang = vay.laiSuatNamPhanTram / 100 / 12;
  const gocMoiKy = vay.soTienVay / vay.soThangVay;
  const bang: DongTraNo[] = [];
  let duNo = vay.soTienVay;
  for (let k = 1; k <= vay.soThangVay; k++) {
    const traLai = duNo * laiThang;
    const traGoc = k === vay.soThangVay ? duNo : gocMoiKy; // kỳ cuối trả hết phần lẻ làm tròn
    const duNoCuoi = Math.max(0, duNo - traGoc);
    bang.push({
      thang: k,
      ngay: dayjs(vay.ngayGiaiNgan).add(k, "month").format("YYYY-MM-DD"),
      duNoDau: duNo,
      traGoc,
      traLai,
      duNoCuoi,
    });
    duNo = duNoCuoi;
  }
  return bang;
}

/** Bảng trả nợ trả đều hàng tháng (annuity): tổng gốc + lãi mỗi kỳ bằng nhau. */
function bangTraNoDeuHangThang(vay: ThongTinVayVonMuaXe): DongTraNo[] {
  const laiThang = vay.laiSuatNamPhanTram / 100 / 12;
  const n = vay.soThangVay;
  const P = vay.soTienVay;
  // Công thức PMT (annuity). Nếu lãi suất = 0 thì trả đều = gốc/n.
  const soTienMoiKy =
    laiThang === 0 ? P / n : (P * laiThang) / (1 - Math.pow(1 + laiThang, -n));
  const bang: DongTraNo[] = [];
  let duNo = P;
  for (let k = 1; k <= n; k++) {
    const traLai = duNo * laiThang;
    let traGoc = soTienMoiKy - traLai;
    if (k === n) traGoc = duNo; // kỳ cuối trả hết phần lẻ làm tròn
    const duNoCuoi = Math.max(0, duNo - traGoc);
    bang.push({
      thang: k,
      ngay: dayjs(vay.ngayGiaiNgan).add(k, "month").format("YYYY-MM-DD"),
      duNoDau: duNo,
      traGoc,
      traLai,
      duNoCuoi,
    });
    duNo = duNoCuoi;
  }
  return bang;
}

/** Bảng trả nợ đầy đủ theo phương thức đã chọn của khoản vay. */
export function tinhBangTraNo(vay: ThongTinVayVonMuaXe): DongTraNo[] {
  if (vay.soTienVay <= 0 || vay.soThangVay <= 0) return [];
  return vay.phuongThuc === "tra_deu_hang_thang"
    ? bangTraNoDeuHangThang(vay)
    : bangTraNoGiamDan(vay);
}

/** Kỳ trả nợ hiện tại tương ứng ngày tham chiếu (null nếu chưa tới kỳ đầu hoặc đã trả hết nợ). */
export function tinhKyTraNoHienTai(
  vay: ThongTinVayVonMuaXe,
  ngayThamChieu: string
): DongTraNo | null {
  const soThangDaQua = soThangDaTrai(vay.ngayGiaiNgan, ngayThamChieu);
  const ky = soThangDaQua + 1; // kỳ đang chạy
  if (ky < 1 || ky > vay.soThangVay) return null;
  const bang = tinhBangTraNo(vay);
  return bang[ky - 1] ?? null;
}

/** Đã trả hết nợ vay tính đến ngày tham chiếu hay chưa. */
export function daTraHetNo(vay: ThongTinVayVonMuaXe, ngayThamChieu: string): boolean {
  return soThangDaTrai(vay.ngayGiaiNgan, ngayThamChieu) >= vay.soThangVay;
}

// --------------------------------------------------------------------------
// TỔNG HỢP CHI PHÍ XE THEO THÁNG (khấu hao + lãi vay ước tính của kỳ hiện tại)
// --------------------------------------------------------------------------

export interface ChiPhiCoDinhXeThang {
  khauHaoThang: number;
  laiVayThang: number; // 0 nếu không vay hoặc đã trả hết nợ
  goiTraGocThang: number; // 0 nếu không vay hoặc đã trả hết nợ - chỉ để tham khảo dòng tiền, KHÔNG phải chi phí
  tongChiPhi: number; // khauHaoThang + laiVayThang
}

/** Tổng hợp khấu hao + lãi vay của kỳ hiện tại (theo ngày tham chiêu, mặc định hôm nay). */
export function tinhChiPhiCoDinhXeThang(
  mua: ThongTinMuaXe | undefined,
  ngayThamChieu: string = dayjs().format("YYYY-MM-DD")
): ChiPhiCoDinhXeThang {
  if (!mua) {
    return { khauHaoThang: 0, laiVayThang: 0, goiTraGocThang: 0, tongChiPhi: 0 };
  }
  const khauHaoThang = daKhauHaoHet(mua, ngayThamChieu) ? 0 : tinhKhauHaoThang(mua);
  let laiVayThang = 0;
  let goiTraGocThang = 0;
  if (mua.vayVon) {
    const ky = tinhKyTraNoHienTai(mua.vayVon, ngayThamChieu);
    if (ky) {
      laiVayThang = ky.traLai;
      goiTraGocThang = ky.traGoc;
    }
  }
  return {
    khauHaoThang,
    laiVayThang,
    goiTraGocThang,
    tongChiPhi: khauHaoThang + laiVayThang,
  };
}
