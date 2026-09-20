export const DON_VI_HANG_MAC_DINH = ["kg", "tấn", "bao", "thùng", "kiện", "cái"] as const;

export const DON_VI_OPTIONS = DON_VI_HANG_MAC_DINH.map((dv) => ({ value: dv, label: dv }));

/** Gợi ý tên chi phí thường gặp - KHÔNG giới hạn, người dùng có thể nhập tên khác. */
export const GOI_Y_TEN_CHI_PHI = ["Xăng dầu", "Tiền tài xế", "Bốc hàng", "Cầu đường", "Chi phí khác"];

/**
 * Khoản chuyển khoản đã ghi nhận quá số ngày này mà chưa đối chiếu được với sao kê
 * thì coi là "quá hạn" - tiền chuyển khoản thường về trong ngày nên cần hỏi lại khách.
 */
export const SO_NGAY_QUA_HAN_DOI_CHIEU = 2;
