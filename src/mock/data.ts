// ==========================================================================
// MOCK DATA - Dữ liệu mẫu tiếng Việt để prototype không bị trống màn hình
// ==========================================================================
import type { AppData, Chuyen } from "@/types";

const today = new Date();
function isoDaysAgo(days: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const XE_LIST: AppData["xeList"] = [
  {
    id: "xe-1",
    bienSo: "86H-04662",
    taiXeMacDinhId: "tx-1",
    dangHoatDong: true,
    // Ví dụ mẫu: xe mua trả góp, minh họa tính năng khấu hao + lãi vay.
    thongTinMua: {
      giaMua: 850000000,
      ngayMua: isoDaysAgo(400),
      soNamKhauHao: 8,
      giaTriThanhLy: 50000000,
      vayVon: {
        soTienVay: 600000000,
        laiSuatNamPhanTram: 9.5,
        soThangVay: 60,
        ngayGiaiNgan: isoDaysAgo(400),
        phuongThuc: "du_no_giam_dan",
      },
    },
  },
  { id: "xe-2", bienSo: "86C-06282", taiXeMacDinhId: "tx-2", dangHoatDong: true },
  { id: "xe-3", bienSo: "86C-11891", taiXeMacDinhId: "tx-3", dangHoatDong: true },
  { id: "xe-4", bienSo: "86H-09215", taiXeMacDinhId: "tx-1", dangHoatDong: true },
];

export const TAI_XE_LIST: AppData["taiXeList"] = [
  { id: "tx-1", hoTen: "Dương", soDienThoai: "0905 123 456", dangHoatDong: true },
  { id: "tx-2", hoTen: "Tý Châu", soDienThoai: "0912 234 567", dangHoatDong: true },
  { id: "tx-3", hoTen: "Hiệp", soDienThoai: "0987 345 678", dangHoatDong: true },
];

export const KHACH_HANG_LIST: AppData["khachHangList"] = [
  { id: "kh-1", hoTen: "Ông Thắng", soDienThoai: "0918 111 222" },
  { id: "kh-2", hoTen: "Bà Thêm", soDienThoai: "0918 222 333" },
  { id: "kh-3", hoTen: "Ái Trâm", soDienThoai: "0918 333 444" },
  { id: "kh-4", hoTen: "Mỹ Hồng", soDienThoai: "0918 444 555" },
  { id: "kh-5", hoTen: "Quý Yến", soDienThoai: "0918 555 666" },
];

export const LOAI_HANG_LIST: AppData["loaiHangList"] = [
  { id: "lh-1", ten: "Anco" },
  { id: "lh-2", ten: "Tuyết Trung" },
  { id: "lh-3", ten: "Mốc cầu R" },
];

export const NGUOI_BOC_HANG_LIST: AppData["nguoiBocHangList"] = [
  { id: "bh-1", hoTen: "Anh Tèo", soDienThoai: "0933 111 222" },
  { id: "bh-2", hoTen: "Anh Tài", soDienThoai: "0933 222 333" },
  { id: "bh-3", hoTen: "Anh Bì", soDienThoai: "0933 333 444" },
];

export const TAI_KHOAN_NGAN_HANG_LIST: AppData["taiKhoanNganHangList"] = [
  {
    id: "tk-1",
    tenNganHang: "Vietcombank",
    soTaiKhoan: "0011001234567",
    chuTaiKhoan: "NGUYEN VAN A",
    dangHoatDong: true,
  },
  {
    id: "tk-2",
    tenNganHang: "MB Bank",
    soTaiKhoan: "0987654321",
    chuTaiKhoan: "NGUYEN VAN A",
    ghiChu: "Tài khoản nhận tiền cước nhỏ",
    dangHoatDong: true,
  },
];

export const CHUYEN_LIST: Chuyen[] = [
  {
    id: "chuyen-1",
    ngay: isoDaysAgo(0),
    chieuDi: {
      xeId: "xe-1",
      taiXeId: "tx-1",
      danhSachHang: [
        {
          id: "h-1-1",
          khachHangId: "kh-1",
          loaiHangId: "lh-1",
          soLuong: 4,
          donVi: "tấn",
          giaTriHang: 20_000_000,
          tienKhachPhaiTra: 2_000_000,
          danhSachThanhToan: [
            { id: "tt-1-1-1", ngayThanhToan: isoDaysAgo(0), soTien: 500_000, ghiChu: "Trả lần 1" },
            { id: "tt-1-1-2", ngayThanhToan: isoDaysAgo(0), soTien: 500_000, ghiChu: "Trả lần 2" },
          ],
        },
        {
          id: "h-1-2",
          khachHangId: "kh-2",
          loaiHangId: "lh-1",
          soLuong: 90,
          donVi: "bao",
          giaTriHang: 9_000_000,
          tienKhachPhaiTra: 1_500_000,
          danhSachThanhToan: [],
        },
        {
          id: "h-1-3",
          khachHangId: "kh-3",
          loaiHangId: "lh-1",
          soLuong: 40,
          donVi: "bao",
          giaTriHang: 4_000_000,
          tienKhachPhaiTra: 800_000,
          danhSachThanhToan: [
            { id: "tt-1-3-1", ngayThanhToan: isoDaysAgo(0), soTien: 800_000, ghiChu: "Thanh toán đủ" },
          ],
        },
      ],
      danhSachChiPhi: [
        { id: "cp-1-1", tenChiPhi: "Xăng dầu", soTien: 900_000 },
        { id: "cp-1-2", tenChiPhi: "Tiền tài xế", soTien: 700_000 },
        { id: "cp-1-3", tenChiPhi: "Cầu đường", soTien: 150_000 },
      ],
      danhSachCongNoBocHang: [
        {
          id: "cn-1-1",
          nguoiBocHangId: "bh-1",
          soTienPhaiTra: 500_000,
          danhSachThanhToan: [],
        },
      ],
    },
    createdAt: isoDaysAgo(0),
    updatedAt: isoDaysAgo(0),
  },
  {
    // Chuyến khứ hồi mẫu: chiều đi xe 86C-06282/Tý Châu chở hàng giao,
    // chiều về đổi sang xe 86C-11891/Hiệp chở hàng khác về - đúng nghiệp vụ
    // "chuyến đi phải có chuyến về", xe/tài xế 2 chiều có thể khác nhau.
    id: "chuyen-2",
    ngay: isoDaysAgo(1),
    ngayVe: isoDaysAgo(1),
    chieuDi: {
      xeId: "xe-2",
      taiXeId: "tx-2",
      danhSachHang: [
        {
          id: "h-2-1",
          khachHangId: "kh-4",
          loaiHangId: "lh-2",
          soLuong: 60,
          donVi: "bao",
          giaTriHang: 6_000_000,
          tienKhachPhaiTra: 1_200_000,
          danhSachThanhToan: [{ id: "tt-2-1-1", ngayThanhToan: isoDaysAgo(1), soTien: 1_200_000, hinhThuc: "chuyen_khoan", taiKhoanId: "tk-1", ngayDoiChieu: isoDaysAgo(0) }],
        },
        {
          id: "h-2-2",
          khachHangId: "kh-1",
          loaiHangId: "lh-3",
          soLuong: 3,
          donVi: "tấn",
          giaTriHang: 15_000_000,
          tienKhachPhaiTra: 1_800_000,
          danhSachThanhToan: [{ id: "tt-2-2-1", ngayThanhToan: isoDaysAgo(1), soTien: 300_000, hinhThuc: "tien_mat" }],
        },
      ],
      danhSachChiPhi: [
        { id: "cp-2-1", tenChiPhi: "Xăng dầu", soTien: 750_000 },
        { id: "cp-2-2", tenChiPhi: "Tiền tài xế", soTien: 700_000 },
        { id: "cp-2-3", tenChiPhi: "Bốc hàng", soTien: 400_000 },
      ],
      danhSachCongNoBocHang: [
        {
          id: "cn-2-1",
          nguoiBocHangId: "bh-1",
          soTienPhaiTra: 700_000,
          danhSachThanhToan: [{ id: "tt-cn-2-1-1", ngayThanhToan: isoDaysAgo(1), soTien: 700_000, hinhThuc: "chuyen_khoan", taiKhoanId: "tk-1" }],
        },
        {
          id: "cn-2-2",
          nguoiBocHangId: "bh-2",
          soTienPhaiTra: 400_000,
          danhSachThanhToan: [],
        },
      ],
    },
    chieuVe: {
      xeId: "xe-3",
      taiXeId: "tx-3",
      danhSachHang: [
        {
          id: "h-2v-1",
          khachHangId: "kh-5",
          loaiHangId: "lh-1",
          soLuong: 50,
          donVi: "bao",
          giaTriHang: 5_000_000,
          tienKhachPhaiTra: 1_000_000,
          danhSachThanhToan: [],
        },
      ],
      danhSachChiPhi: [
        { id: "cp-2v-1", tenChiPhi: "Xăng dầu", soTien: 650_000 },
        { id: "cp-2v-2", tenChiPhi: "Tiền tài xế", soTien: 700_000 },
      ],
      danhSachCongNoBocHang: [
        {
          id: "cn-2v-1",
          nguoiBocHangId: "bh-3",
          soTienPhaiTra: 300_000,
          danhSachThanhToan: [],
        },
      ],
      ghiChu: "Đổi sang xe 86C-11891 vì xe chiều đi phải quay đầu gấp.",
    },
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "chuyen-3",
    ngay: isoDaysAgo(3),
    chieuDi: {
      xeId: "xe-3",
      taiXeId: "tx-3",
      danhSachHang: [
        {
          id: "h-3-1",
          khachHangId: "kh-5",
          loaiHangId: "lh-1",
          soLuong: 120,
          donVi: "bao",
          giaTriHang: 12_000_000,
          tienKhachPhaiTra: 2_400_000,
          danhSachThanhToan: [],
        },
        {
          id: "h-3-2",
          khachHangId: "kh-2",
          loaiHangId: "lh-2",
          soLuong: 2,
          donVi: "tấn",
          giaTriHang: 8_000_000,
          tienKhachPhaiTra: 900_000,
          danhSachThanhToan: [{ id: "tt-3-2-1", ngayThanhToan: isoDaysAgo(2), soTien: 900_000, hinhThuc: "chuyen_khoan", taiKhoanId: "tk-2" }],
        },
      ],
      danhSachChiPhi: [
        { id: "cp-3-1", tenChiPhi: "Xăng dầu", soTien: 1_100_000 },
        { id: "cp-3-2", tenChiPhi: "Tiền tài xế", soTien: 700_000 },
        { id: "cp-3-3", tenChiPhi: "Cầu đường", soTien: 200_000 },
        { id: "cp-3-4", tenChiPhi: "Chi phí khác", soTien: 100_000, ghiChu: "Bồi dưỡng bốc xếp thêm" },
      ],
      danhSachCongNoBocHang: [
        {
          id: "cn-3-1",
          nguoiBocHangId: "bh-3",
          soTienPhaiTra: 500_000,
          danhSachThanhToan: [{ id: "tt-cn-3-1-1", ngayThanhToan: isoDaysAgo(3), soTien: 500_000 }],
        },
      ],
    },
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: "chuyen-4",
    ngay: isoDaysAgo(6),
    chieuDi: {
      xeId: "xe-1",
      taiXeId: "tx-1",
      danhSachHang: [
        {
          id: "h-4-1",
          khachHangId: "kh-3",
          loaiHangId: "lh-3",
          soLuong: 50,
          donVi: "bao",
          giaTriHang: 5_000_000,
          tienKhachPhaiTra: 1_000_000,
          danhSachThanhToan: [{ id: "tt-4-1-1", ngayThanhToan: isoDaysAgo(5), soTien: 1_000_000 }],
        },
      ],
      danhSachChiPhi: [
        { id: "cp-4-1", tenChiPhi: "Xăng dầu", soTien: 600_000 },
        { id: "cp-4-2", tenChiPhi: "Tiền tài xế", soTien: 700_000 },
      ],
      danhSachCongNoBocHang: [
        {
          id: "cn-4-1",
          nguoiBocHangId: "bh-2",
          soTienPhaiTra: 300_000,
          danhSachThanhToan: [],
        },
      ],
    },
    createdAt: isoDaysAgo(6),
    updatedAt: isoDaysAgo(6),
  },
];

export function taoMockAppData(): AppData {
  return {
    xeList: XE_LIST,
    taiXeList: TAI_XE_LIST,
    khachHangList: KHACH_HANG_LIST,
    loaiHangList: LOAI_HANG_LIST,
    nguoiBocHangList: NGUOI_BOC_HANG_LIST,
    taiKhoanNganHangList: TAI_KHOAN_NGAN_HANG_LIST,
    chuyenList: CHUYEN_LIST,
  };
}
