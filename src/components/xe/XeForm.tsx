"use client";

// ==========================================================================
// Form thêm/sửa Xe - gồm thông tin cơ bản + khấu hao + vay vốn mua xe (optional).
// Tách riêng khỏi DanhMucCrud vì cần InputNumber/DatePicker/nhóm lồng nhau,
// điều mà form CRUD chung (chỉ text/textarea/switch) không hỗ trợ.
// ==========================================================================
import React, { useMemo } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Radio,
  Typography,
  Divider,
  Card,
  Row,
  Col,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import type { Xe, PhuongThucTraNo } from "@/types";
import { formatTien } from "@/utils/calc";
import { tinhChiPhiCoDinhXeThang, tinhKhauHaoThang } from "@/utils/khauHaoVay";

interface Props {
  form: ReturnType<typeof Form.useForm<XeFormInternalShape>>[0];
}

export interface XeFormInternalShape {
  bienSo: string;
  ghiChu?: string;
  dangHoatDong: boolean;
  coThongTinMua: boolean;
  giaMua?: number;
  ngayMua?: Dayjs;
  soNamKhauHao?: number;
  giaTriThanhLy?: number;
  coVay: boolean;
  soTienVay?: number;
  laiSuatNamPhanTram?: number;
  soThangVay?: number;
  ngayGiaiNgan?: Dayjs;
  phuongThuc?: PhuongThucTraNo;
}

/** Chuyển dữ liệu Xe (lưu trong app) sang giá trị hiển thị trong form. */
export function xeSangGiaTriForm(xe?: Xe): Partial<XeFormInternalShape> {
  if (!xe) {
    return { dangHoatDong: true, coThongTinMua: false, coVay: false };
  }
  const mua = xe.thongTinMua;
  const vay = mua?.vayVon;
  return {
    bienSo: xe.bienSo,
    ghiChu: xe.ghiChu,
    dangHoatDong: xe.dangHoatDong,
    coThongTinMua: !!mua,
    giaMua: mua?.giaMua,
    ngayMua: mua ? dayjs(mua.ngayMua) : undefined,
    soNamKhauHao: mua?.soNamKhauHao,
    giaTriThanhLy: mua?.giaTriThanhLy,
    coVay: !!vay,
    soTienVay: vay?.soTienVay,
    laiSuatNamPhanTram: vay?.laiSuatNamPhanTram,
    soThangVay: vay?.soThangVay,
    ngayGiaiNgan: vay ? dayjs(vay.ngayGiaiNgan) : undefined,
    phuongThuc: vay?.phuongThuc ?? "du_no_giam_dan",
  };
}

/** Chuyển giá trị form về đúng shape Xe để lưu (bỏ các trường tạm coThongTinMua/coVay). */
export function giaTriFormSangXePatch(values: XeFormInternalShape): Omit<Xe, "id"> {
  const thongTinMua =
    values.coThongTinMua && values.giaMua && values.ngayMua && values.soNamKhauHao
      ? {
          giaMua: values.giaMua,
          ngayMua: values.ngayMua.format("YYYY-MM-DD"),
          soNamKhauHao: values.soNamKhauHao,
          giaTriThanhLy: values.giaTriThanhLy || 0,
          vayVon:
            values.coVay && values.soTienVay && values.soThangVay && values.ngayGiaiNgan
              ? {
                  soTienVay: values.soTienVay,
                  laiSuatNamPhanTram: values.laiSuatNamPhanTram || 0,
                  soThangVay: values.soThangVay,
                  ngayGiaiNgan: values.ngayGiaiNgan.format("YYYY-MM-DD"),
                  phuongThuc: values.phuongThuc || "du_no_giam_dan",
                }
              : undefined,
        }
      : undefined;
  return {
    bienSo: values.bienSo,
    ghiChu: values.ghiChu,
    dangHoatDong: values.dangHoatDong,
    thongTinMua,
  };
}

export default function XeForm({ form }: Props) {
  // Theo dõi các công tắc + số liệu để tính preview khấu hao/lãi vay ngay trong form.
  const coThongTinMua = Form.useWatch("coThongTinMua", form);
  const coVay = Form.useWatch("coVay", form);
  const giaMua = Form.useWatch("giaMua", form);
  const ngayMua = Form.useWatch("ngayMua", form);
  const soNamKhauHao = Form.useWatch("soNamKhauHao", form);
  const giaTriThanhLy = Form.useWatch("giaTriThanhLy", form);
  const soTienVay = Form.useWatch("soTienVay", form);
  const laiSuatNamPhanTram = Form.useWatch("laiSuatNamPhanTram", form);
  const soThangVay = Form.useWatch("soThangVay", form);
  const ngayGiaiNgan = Form.useWatch("ngayGiaiNgan", form);
  const phuongThuc = Form.useWatch("phuongThuc", form);

  const preview = useMemo(() => {
    if (!coThongTinMua || !giaMua || !ngayMua || !soNamKhauHao) return null;
    const mua = {
      giaMua,
      ngayMua: ngayMua.format("YYYY-MM-DD"),
      soNamKhauHao,
      giaTriThanhLy: giaTriThanhLy || 0,
      vayVon:
        coVay && soTienVay && soThangVay && ngayGiaiNgan
          ? {
              soTienVay,
              laiSuatNamPhanTram: laiSuatNamPhanTram || 0,
              soThangVay,
              ngayGiaiNgan: ngayGiaiNgan.format("YYYY-MM-DD"),
              phuongThuc: (phuongThuc || "du_no_giam_dan") as PhuongThucTraNo,
            }
          : undefined,
    };
    return tinhChiPhiCoDinhXeThang(mua);
  }, [
    coThongTinMua,
    giaMua,
    ngayMua,
    soNamKhauHao,
    giaTriThanhLy,
    coVay,
    soTienVay,
    laiSuatNamPhanTram,
    soThangVay,
    ngayGiaiNgan,
    phuongThuc,
  ]);

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="bienSo"
        label="Biển số xe"
        rules={[{ required: true, message: "Vui lòng nhập biển số xe" }]}
      >
        <Input placeholder="VD: 86H-04662" />
      </Form.Item>
      <Form.Item name="ghiChu" label="Ghi chú">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="dangHoatDong" label="Đang hoạt động" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Divider style={{ margin: "8px 0 16px" }} />
      <Form.Item name="coThongTinMua" label="Theo dõi giá mua & khấu hao xe này" valuePropName="checked">
        <Switch />
      </Form.Item>

      {coThongTinMua && (
        <Card size="small" style={{ marginBottom: 16, background: "#fafafa" }}>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="giaMua"
                label="Giá mua xe"
                rules={[{ required: coThongTinMua, message: "Nhập giá mua xe" }]}
              >
                <InputNumber<number>
                  style={{ width: "100%" }}
                  min={0}
                  step={10000000}
                  formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
                  parser={(v) => Number((v ?? "").replace(/\D/g, ""))}
                  addonAfter="đ"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="ngayMua"
                label="Ngày mua"
                rules={[{ required: coThongTinMua, message: "Chọn ngày mua" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" inputReadOnly />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="soNamKhauHao"
                label="Số năm khấu hao"
                rules={[{ required: coThongTinMua, message: "Nhập số năm khấu hao" }]}
              >
                <InputNumber style={{ width: "100%" }} min={1} max={30} addonAfter="năm" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="giaTriThanhLy" label="Giá trị thanh lý ước tính (cuối kỳ)">
                <InputNumber<number>
                  style={{ width: "100%" }}
                  min={0}
                  step={5000000}
                  formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
                  parser={(v) => Number((v ?? "").replace(/\D/g, ""))}
                  addonAfter="đ"
                  placeholder="Mặc định 0đ"
                />
              </Form.Item>
            </Col>
          </Row>
          {giaMua && soNamKhauHao ? (
            <Typography.Text type="secondary">
              → Khấu hao ước tính:{" "}
              <strong>
                {formatTien(
                  tinhKhauHaoThang({
                    giaMua,
                    ngayMua: ngayMua ? ngayMua.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                    soNamKhauHao,
                    giaTriThanhLy: giaTriThanhLy || 0,
                  })
                )}
              </strong>{" "}
              / tháng
            </Typography.Text>
          ) : null}

          <Divider style={{ margin: "16px 0" }} />
          <Form.Item name="coVay" label="Xe này mua bằng vốn vay ngân hàng" valuePropName="checked">
            <Switch />
          </Form.Item>

          {coVay && (
            <>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="soTienVay"
                    label="Số tiền vay"
                    rules={[{ required: coVay, message: "Nhập số tiền vay" }]}
                  >
                    <InputNumber<number>
                      style={{ width: "100%" }}
                      min={0}
                      step={10000000}
                      formatter={(v) => (v ? formatTien(Number(v)).replace("đ", "") : "")}
                      parser={(v) => Number((v ?? "").replace(/\D/g, ""))}
                      addonAfter="đ"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="laiSuatNamPhanTram"
                    label="Lãi suất"
                    rules={[{ required: coVay, message: "Nhập lãi suất" }]}
                  >
                    <InputNumber style={{ width: "100%" }} min={0} max={100} step={0.1} addonAfter="%/năm" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="soThangVay"
                    label="Thời hạn vay"
                    rules={[{ required: coVay, message: "Nhập thời hạn vay" }]}
                  >
                    <InputNumber style={{ width: "100%" }} min={1} max={360} addonAfter="tháng" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="ngayGiaiNgan"
                    label="Ngày giải ngân"
                    rules={[{ required: coVay, message: "Chọn ngày giải ngân" }]}
                  >
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" inputReadOnly />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="phuongThuc" label="Cách tính lãi / trả nợ">
                    <Radio.Group>
                      <Radio.Button value="du_no_giam_dan">Dư nợ giảm dần (gốc đều)</Radio.Button>
                      <Radio.Button value="tra_deu_hang_thang">Trả đều hàng tháng</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
              <Typography.Text type="secondary">
                Dư nợ giảm dần: gốc trả cố định mỗi tháng, lãi giảm dần theo dư nợ còn lại → tổng
                tiền trả mỗi tháng giảm dần. Trả đều hàng tháng: tổng gốc + lãi mỗi tháng bằng
                nhau (annuity) - dễ lên kế hoạch dòng tiền hơn nhưng tổng lãi phải trả thường cao
                hơn một chút so với dư nợ giảm dần.
              </Typography.Text>
            </>
          )}

          {preview && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <Typography.Text strong>
                Chi phí xe tháng này: {formatTien(preview.tongChiPhi)} (khấu hao{" "}
                {formatTien(preview.khauHaoThang)}
                {preview.laiVayThang > 0 ? ` + lãi vay ${formatTien(preview.laiVayThang)}` : ""})
              </Typography.Text>
              {preview.goiTraGocThang > 0 && (
                <div>
                  <Typography.Text type="secondary">
                    (Ngoài ra còn phải trả gốc {formatTien(preview.goiTraGocThang)} / tháng - đây
                    là trả nợ vay, không tính là chi phí)
                  </Typography.Text>
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </Form>
  );
}
