// ==========================================================================
// TYPES - Ứng dụng quản lý chuyến xe, hàng hóa, thu tiền, chi phí, công nợ
// ==========================================================================
// Ghi chú: Đây là prototype UI, dữ liệu mô phỏng bằng mock data + localStorage.
// Không có công thức tài chính tự suy đoán - mọi số tiền do người dùng nhập.

/** Đơn vị tính cho hàng hóa. Có thể mở rộng, không giới hạn cứng. */
export type DonViHang = "kg" | "tấn" | "bao" | "thùng" | "kiện" | "cái" | string;

/** Cách tính lãi/gốc trả hàng tháng cho khoản vay mua xe. */
export type PhuongThucTraNo =
  | "du_no_giam_dan" // Gốc đều mỗi tháng, lãi tính trên dư nợ giảm dần - phổ biến ở vay mua xe tải VN
  | "tra_deu_hang_thang"; // Trả đều mỗi tháng (annuity) - gốc + lãi cố định mỗi kỳ

/**
 * Thông tin khoản vay ngân hàng để mua xe. Optional - chỉ nhập khi xe mua bằng vốn vay.
 * Dùng để tính lãi vay phải trả hàng tháng, KHÔNG tự tính vào công nợ/thu chi của chuyến.
 */
export interface ThongTinVayVonMuaXe {
  soTienVay: number;
  laiSuatNamPhanTram: number; // Lãi suất %/năm, VD: 9.5
  soThangVay: number;
  ngayGiaiNgan: string; // ISO date - ngày bắt đầu tính lãi/trả nợ
  phuongThuc: PhuongThucTraNo;
}

/**
 * Thông tin mua xe, dùng để tính khấu hao (đường thẳng) và lãi vay (nếu có).
 * Optional - xe cũ hoặc không cần theo dõi chi phí này thì bỏ trống.
 */
export interface ThongTinMuaXe {
  giaMua: number; // Nguyên giá mua xe
  ngayMua: string; // ISO date
  soNamKhauHao: number; // Số năm khấu hao, VD: 8
  giaTriThanhLy?: number; // Giá trị còn lại ước tính cuối kỳ khấu hao, mặc định 0
  vayVon?: ThongTinVayVonMuaXe;
}

export interface Xe {
  id: string;
  bienSo: string; // VD: 86H-04662
  taiXeMacDinhId?: string;
  ghiChu?: string;
  dangHoatDong: boolean;
  /** Thông tin mua xe / khấu hao / vay vốn - optional. */
  thongTinMua?: ThongTinMuaXe;
}

export interface TaiXe {
  id: string;
  hoTen: string;
  soDienThoai?: string;
  ghiChu?: string;
  dangHoatDong: boolean;
}

export interface KhachHang {
  id: string;
  hoTen: string;
  soDienThoai?: string;
  diaChi?: string;
  ghiChu?: string;
}

export interface LoaiHang {
  id: string;
  ten: string;
  ghiChu?: string;
}

export interface NguoiBocHang {
  id: string;
  hoTen: string;
  soDienThoai?: string;
  ghiChu?: string;
}

/**
 * Tài khoản ngân hàng dùng để nhận tiền từ khách hoặc trả tiền cho người bốc hàng.
 * Chỉ là thông tin tham chiếu - app không kết nối ngân hàng, không tự tính số dư.
 */
export interface TaiKhoanNganHang {
  id: string;
  tenNganHang: string; // VD: Vietcombank
  soTaiKhoan: string;
  chuTaiKhoan: string;
  ghiChu?: string;
  /** Tắt để ẩn khỏi danh sách chọn khi ghi nhận thanh toán, nhưng vẫn giữ lịch sử cũ. */
  dangHoatDong: boolean;
}

/** Tiền được thu/trả bằng cách nào. */
export type HinhThucThanhToan = "tien_mat" | "chuyen_khoan";

/**
 * Thông tin hình thức của một lần thanh toán. Lần thanh toán ghi từ trước khi có tính
 * năng tài khoản ngân hàng sẽ không có các trường này (hiểu là "chưa ghi rõ").
 * Chuyển khoản thì luôn kèm taiKhoanId; tiền mặt thì không có taiKhoanId.
 */
export interface ThongTinHinhThuc {
  hinhThuc: HinhThucThanhToan;
  taiKhoanId?: string;
}

/** Một lần khách thanh toán cho một dòng hàng trong chuyến. */
export interface LanThanhToanKhach {
  id: string;
  ngayThanhToan: string; // ISO date
  soTien: number;
  ghiChu?: string;
  hinhThuc?: HinhThucThanhToan;
  taiKhoanId?: string;
  /**
   * Ngày đã đối chiếu khoản chuyển khoản này với sao kê ngân hàng (ISO date).
   * Có giá trị nghĩa là đã xác nhận tiền có trên sao kê; chỉ dùng cho hinhThuc = "chuyen_khoan".
   */
  ngayDoiChieu?: string;
}

/** Một dòng hàng trong chuyến - gắn với một khách hàng cụ thể. */
export interface HangTrenChuyen {
  id: string;
  khachHangId: string;
  loaiHangId: string;
  soLuong: number;
  donVi: DonViHang;
  giaTriHang: number; // Giá trị hàng hóa - KHÔNG phải doanh thu
  tienKhachPhaiTra: number; // Tiền vận chuyển khách phải trả - nhập tay
  danhSachThanhToan: LanThanhToanKhach[];
  ghiChu?: string;
}

/** Một khoản chi phí của chuyến. Không hard-code loại chi phí. */
export interface ChiPhiChuyen {
  id: string;
  tenChiPhi: string;
  soTien: number;
  ghiChu?: string;
}

/** Một lần trả tiền cho người bốc hàng. */
export interface LanThanhToanNguoiBoc {
  id: string;
  ngayThanhToan: string;
  soTien: number;
  ghiChu?: string;
  hinhThuc?: HinhThucThanhToan;
  taiKhoanId?: string;
  /**
   * Ngày đã đối chiếu khoản chuyển khoản này với sao kê ngân hàng (ISO date).
   * Có giá trị nghĩa là đã xác nhận tiền có trên sao kê; chỉ dùng cho hinhThuc = "chuyen_khoan".
   */
  ngayDoiChieu?: string;
}

/** Khoản phải trả cho người bốc hàng, gắn với một chuyến cụ thể. */
export interface CongNoBocHang {
  id: string;
  nguoiBocHangId: string;
  soTienPhaiTra: number;
  danhSachThanhToan: LanThanhToanNguoiBoc[];
  ghiChu?: string;
}

/** Đánh dấu một chiều thuộc chuyến đi hay chuyến về. */
export type LoaiChieu = "di" | "ve";

/**
 * Dữ liệu của MỘT chiều trong chuyến (chiều đi hoặc chiều về).
 * Chiều về có thể dùng xe/tài xế khác chiều đi, và có hàng/chi phí/công nợ
 * bốc hàng hoàn toàn riêng - giống hệt một chuyến bình thường.
 */
export interface ChieuChuyen {
  xeId: string;
  taiXeId: string;
  danhSachHang: HangTrenChuyen[];
  danhSachChiPhi: ChiPhiChuyen[];
  danhSachCongNoBocHang: CongNoBocHang[];
  ghiChu?: string;
}

export interface Chuyen {
  id: string;
  ngay: string; // ISO date - ngày của chiều đi
  /** Ngày chiều về (ISO date) - chỉ có khi chuyến này có chiều về (khứ hồi). */
  ngayVe?: string;
  /** Chiều đi - luôn có, mọi chuyến đều bắt đầu bằng chiều đi. */
  chieuDi: ChieuChuyen;
  /**
   * Chiều về - CHỈ có khi đây là chuyến khứ hồi (có chở hàng về).
   * Không có nghĩa là xe chạy một chiều (giao xong về xe không, không tính là chuyến).
   */
  chieuVe?: ChieuChuyen;
  ghiChu?: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------------------------------------
// Trạng thái thanh toán (tính toán, không lưu trữ trực tiếp)
// --------------------------------------------------------------------------
export type TrangThaiThanhToan = "chua_thu" | "mot_phan" | "da_thu_du";

export interface TongHopSoLuong {
  donVi: DonViHang;
  soLuong: number;
}

// --------------------------------------------------------------------------
// Toàn bộ dữ liệu ứng dụng (mô phỏng "database" bằng state/localStorage)
// --------------------------------------------------------------------------
export interface AppData {
  xeList: Xe[];
  taiXeList: TaiXe[];
  khachHangList: KhachHang[];
  loaiHangList: LoaiHang[];
  nguoiBocHangList: NguoiBocHang[];
  taiKhoanNganHangList: TaiKhoanNganHang[];
  chuyenList: Chuyen[];
}

export type FilterKhoangThoiGian = "hom_nay" | "tuan_nay" | "thang_nay" | "khoang_tuy_chon" | "tat_ca";
