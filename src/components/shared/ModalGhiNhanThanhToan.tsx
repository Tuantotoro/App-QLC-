"use client";

import React, { useEffect, useState } from "react";
import { Modal, InputNumber, Input, Typography, Space } from "antd";
import { formatTien } from "@/utils/calc";
import { useData } from "@/store/DataContext";
import ChonHinhThucThanhToan, {
  HINH_THUC_MAC_DINH,
  hinhThucHopLe,
} from "@/components/shared/ChonHinhThucThanhToan";
import type { ThongTinHinhThuc } from "@/types";

export default function ModalGhiNhanThanhToan({
  open,
  tieuDe,
  moTaConLai,
  conLai,
  onDong,
  onXacNhan,
  nhanNutXacNhan = "Ghi nhận thanh toán",
  huong = "thu",
}: {
  open: boolean;
  tieuDe: string;
  moTaConLai?: string;
  conLai: number;
  onDong: () => void;
  onXacNhan: (soTien: number, ghiChu: string | undefined, hinhThuc: ThongTinHinhThuc) => void;
  nhanNutXacNhan?: string;
  /** "thu": khách trả tiền cho mình. "tra": mình trả tiền cho người bốc hàng. */
  huong?: "thu" | "tra";
}) {
  const { data } = useData();
  const [soTien, setSoTien] = useState<number | null>(null);
  const [ghiChu, setGhiChu] = useState("");
  // Giữ lại hình thức đã chọn ở lần trước để ghi nhiều khoản liên tiếp không phải chọn lại
  const [hinhThuc, setHinhThuc] = useState<ThongTinHinhThuc>(HINH_THUC_MAC_DINH);

  useEffect(() => {
    // Đồng bộ giá trị mặc định của modal mỗi khi modal được mở lại
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSoTien(conLai > 0 ? conLai : null);
      setGhiChu("");
    }
  }, [open, conLai]);

  const dangDung = data.taiKhoanNganHangList.filter((t) => t.dangHoatDong);
  const hopLe = !!soTien && soTien > 0 && hinhThucHopLe(hinhThuc, dangDung);

  return (
    <Modal
      title={tieuDe}
      open={open}
      onCancel={onDong}
      onOk={() => {
        if (hopLe && soTien) {
          onXacNhan(soTien, ghiChu || undefined, hinhThuc);
          onDong();
        }
      }}
      okText={nhanNutXacNhan}
      cancelText="Hủy"
      okButtonProps={{ disabled: !hopLe }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        {moTaConLai && (
          <Typography.Text type="secondary">
            {moTaConLai}: <strong>{formatTien(conLai)}</strong>
          </Typography.Text>
        )}
        <div>
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            Số tiền
          </Typography.Text>
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            autoFocus
            value={soTien}
            formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
            parser={(v) => Number((v ?? "").replace(/\D/g, "")) as unknown as number}
            onChange={(v) => setSoTien(v)}
            addonAfter="đ"
          />
        </div>
        <div>
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            {huong === "thu" ? "Khách trả bằng" : "Trả bằng"}
          </Typography.Text>
          <ChonHinhThucThanhToan value={hinhThuc} onChange={setHinhThuc} huong={huong} />
        </div>
        <div>
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 4 }}>
            Ghi chú (tùy chọn)
          </Typography.Text>
          <Input value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="VD: trả lần 2..." />
        </div>
      </Space>
    </Modal>
  );
}
