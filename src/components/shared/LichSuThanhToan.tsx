"use client";

import React from "react";
import { List, Typography, Space, Button, Popconfirm, Empty, Checkbox } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { formatTien, formatNgay, nhanHinhThucThanhToan } from "@/utils/calc";
import { useData, useLookup } from "@/store/DataContext";
import type { LanThanhToanKhach, LanThanhToanNguoiBoc } from "@/types";

/**
 * Hiển thị lịch sử các lần thanh toán (thu của khách hoặc trả cho người bốc hàng).
 * Dùng chung cho cả HangTrenChuyen.danhSachThanhToan và CongNoBocHang.danhSachThanhToan
 * vì hai kiểu này có cùng cấu trúc { id, ngayThanhToan, soTien, ghiChu }.
 */
export default function LichSuThanhToan({
  danhSach,
  onXoa,
}: {
  danhSach: (LanThanhToanKhach | LanThanhToanNguoiBoc)[];
  /** Nếu truyền vào, mỗi dòng sẽ có nút xóa (dùng khi ghi nhầm). */
  onXoa?: (thanhToanId: string) => void;
}) {
  const { data, datDoiChieuThanhToan } = useData();
  const { taiKhoanMap } = useLookup(data);

  if (danhSach.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Chưa có lần thanh toán nào"
        style={{ margin: "8px 0" }}
      />
    );
  }

  // Hiển thị lần mới nhất lên đầu cho dễ theo dõi.
  const daySapXep = [...danhSach].sort(
    (a, b) => new Date(b.ngayThanhToan).getTime() - new Date(a.ngayThanhToan).getTime()
  );

  return (
    <List
      size="small"
      dataSource={daySapXep}
      renderItem={(lt, idx) => (
        <List.Item
          actions={
            onXoa
              ? [
                  <Popconfirm
                    key="xoa"
                    title="Xóa lần thanh toán này?"
                    description="Dùng khi ghi nhận nhầm số tiền hoặc nhầm lần."
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => onXoa(lt.id)}
                  >
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]
              : undefined
          }
        >
          <Space direction="vertical" size={0}>
            <Space size={8}>
              <Typography.Text strong>Lần {daySapXep.length - idx}</Typography.Text>
              <Typography.Text type="secondary">{formatNgay(lt.ngayThanhToan)}</Typography.Text>
            </Space>
            {nhanHinhThucThanhToan(lt, taiKhoanMap) && (
              <Typography.Text type="secondary">{nhanHinhThucThanhToan(lt, taiKhoanMap)}</Typography.Text>
            )}
            {lt.hinhThuc === "chuyen_khoan" && (
              <Checkbox
                checked={!!lt.ngayDoiChieu}
                onChange={(e) => datDoiChieuThanhToan(lt.id, e.target.checked)}
                style={{ fontSize: 13 }}
              >
                {lt.ngayDoiChieu
                  ? `Đã đối chiếu sao kê (${formatNgay(lt.ngayDoiChieu)})`
                  : "Đã đối chiếu sao kê"}
              </Checkbox>
            )}
            {lt.ghiChu && <Typography.Text type="secondary">{lt.ghiChu}</Typography.Text>}
          </Space>
          <Typography.Text strong style={{ color: "#1B7A43" }}>
            {formatTien(lt.soTien)}
          </Typography.Text>
        </List.Item>
      )}
    />
  );
}
