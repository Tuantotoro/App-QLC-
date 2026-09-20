"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Checkbox, Empty, Result, Segmented, Tag, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useData, useLookup } from "@/store/DataContext";
import { layGiaoDichChuyenKhoan } from "@/utils/aggregate";
import { formatNgay, nhanTaiKhoan } from "@/utils/calc";
import SoTien from "@/components/shared/SoTien";
import { SO_NGAY_QUA_HAN_DOI_CHIEU } from "@/utils/constants";

/**
 * Đối chiếu các lần chuyển khoản đã ghi trong app với sao kê ngân hàng của MỘT tài khoản.
 * Chỉ kiểm tra từng khoản app đã ghi - không so số dư, vì tài khoản có thể dùng chung cho việc khác.
 */
export default function DoiChieuTaiKhoanClient() {
  const params = useSearchParams();
  const taiKhoanId = params.get("id");
  const { data, datDoiChieuThanhToan } = useData();
  const { taiKhoanMap, khachHangMap, nguoiBocHangMap, xeMap } = useLookup(data);
  const [chiChuaDoiChieu, setChiChuaDoiChieu] = useState(true);

  const taiKhoan = taiKhoanId ? taiKhoanMap.get(taiKhoanId) : undefined;

  const giaoDich = taiKhoanId ? layGiaoDichChuyenKhoan(data, taiKhoanId) : [];

  if (!taiKhoanId || !taiKhoan) {
    return (
      <Result
        status="404"
        title="Không tìm thấy tài khoản"
        extra={
          <Link href="/tai-khoan-ngan-hang">
            <Button type="primary">Về danh sách tài khoản</Button>
          </Link>
        }
      />
    );
  }

  const soChua = giaoDich.filter((g) => !g.ngayDoiChieu).length;
  const soQuaHan = giaoDich.filter((g) => g.quaHan).length;
  const hienThi = chiChuaDoiChieu ? giaoDich.filter((g) => !g.ngayDoiChieu) : giaoDich;

  return (
    <div className="doi-chieu-trang">
      <div style={{ marginBottom: 16 }}>
        <Link href="/tai-khoan-ngan-hang">
          <Button icon={<ArrowLeftOutlined />}>Tài khoản ngân hàng</Button>
        </Link>
      </div>

      <div className="doi-chieu-header">
        <div className="doi-chieu-header-ten">{nhanTaiKhoan(taiKhoan)}</div>
        <div className="doi-chieu-header-sub">
          {taiKhoan.soTaiKhoan} · {taiKhoan.chuTaiKhoan}
        </div>
        <Typography.Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 13 }}>
          Mở sao kê ngân hàng, thấy khoản nào đã có thì tick &quot;Đã khớp sao kê&quot;. Khoản nào lâu
          chưa thấy tiền về thì cần hỏi lại khách.
        </Typography.Text>
        {soQuaHan > 0 && (
          <Typography.Text type="danger" strong style={{ display: "block", marginTop: 8, fontSize: 13 }}>
            {soQuaHan} khoản ghi nhận quá {SO_NGAY_QUA_HAN_DOI_CHIEU} ngày mà chưa thấy trên sao kê.
          </Typography.Text>
        )}
      </div>

      <Segmented
        block
        value={chiChuaDoiChieu ? "chua" : "tat-ca"}
        onChange={(v) => setChiChuaDoiChieu(v === "chua")}
        options={[
          { label: `Chưa đối chiếu (${soChua})`, value: "chua" },
          { label: `Tất cả (${giaoDich.length})`, value: "tat-ca" },
        ]}
        style={{ marginBottom: 12 }}
      />

      {hienThi.length === 0 ? (
        <Empty
          description={
            giaoDich.length === 0
              ? "Chưa có khoản chuyển khoản nào qua tài khoản này"
              : "Đã đối chiếu hết các khoản chuyển khoản"
          }
          style={{ margin: "32px 0" }}
        />
      ) : (
        <div className="doi-chieu-list">
          {hienThi.map((g) => {
            const ten =
              g.huong === "nhan"
                ? khachHangMap.get(g.doiTuongId)?.hoTen ?? "—"
                : nguoiBocHangMap.get(g.doiTuongId)?.hoTen ?? "—";
            const da = !!g.ngayDoiChieu;
            return (
              <div
                key={g.id}
                className={`doi-chieu-card ${da ? "da-khop" : "chua-khop"}${g.quaHan ? " qua-han" : ""}`}
              >
                <div className="doi-chieu-card-top">
                  <div className="doi-chieu-card-ten">
                    <span className="doi-chieu-card-huong">{g.huong === "nhan" ? "Nhận từ" : "Trả cho"}</span>{" "}
                    {ten}
                  </div>
                  <SoTien value={g.soTien} size={15} mau={g.huong === "nhan" ? "#1B7A43" : undefined} />
                </div>
                <div className="doi-chieu-card-sub">
                  Ghi nhận {formatNgay(g.ngayThanhToan)} · {xeMap.get(g.xeId)?.bienSo ?? "—"} ·{" "}
                  {g.loai === "ve" ? "Chiều về" : "Chiều đi"}
                </div>
                {g.ghiChu && <div className="doi-chieu-card-sub">Ghi chú: {g.ghiChu}</div>}
                {g.quaHan && (
                  <Tag color="error" style={{ marginTop: 6, marginInlineEnd: 0 }}>
                    Quá {SO_NGAY_QUA_HAN_DOI_CHIEU} ngày chưa đối chiếu
                  </Tag>
                )}
                <div className="doi-chieu-card-bottom">
                  <Checkbox checked={da} onChange={(e) => datDoiChieuThanhToan(g.id, e.target.checked)}>
                    {da ? `Đã khớp sao kê (${formatNgay(g.ngayDoiChieu!)})` : "Đã khớp sao kê"}
                  </Checkbox>
                  <Link href={`/chuyen/chi-tiet?id=${g.chuyenId}`}>Xem chuyến</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
