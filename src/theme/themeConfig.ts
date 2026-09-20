import type { ThemeConfig } from "antd";

// Bảng màu theo yêu cầu:
// - Xanh lá/xanh đậm làm màu chủ đạo
// - Nền sáng/kem
// - Đỏ cho công nợ chưa thanh toán / Xanh cho đã thanh toán / Vàng cho một phần
export const MAU = {
  chuDao: "#1B7A43",
  chuDaoDam: "#125C31",
  nen: "#F7F5EE",
  nenCard: "#FFFFFF",
  daThu: "#1B7A43",
  motPhan: "#C58A00",
  chuaThu: "#C0392B",
  vien: "#E7E3D6",
};

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: MAU.chuDao,
    colorInfo: MAU.chuDao,
    colorSuccess: "#1B7A43",
    colorWarning: "#C58A00",
    colorError: "#C0392B",
    colorBgLayout: MAU.nen,
    colorBgContainer: MAU.nenCard,
    borderRadius: 10,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
  },
  components: {
    Layout: {
      headerBg: MAU.nenCard,
      bodyBg: MAU.nen,
      siderBg: MAU.chuDaoDam,
    },
    Menu: {
      darkItemBg: MAU.chuDaoDam,
      darkItemSelectedBg: MAU.chuDao,
      darkSubMenuItemBg: MAU.chuDaoDam,
    },
    Card: {
      borderRadiusLG: 14,
    },
    Statistic: {
      titleFontSize: 13,
    },
  },
};
