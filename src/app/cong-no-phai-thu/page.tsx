"use client";

import React, { useMemo, useState } from "react";
import { Typography, Input, Switch, Card, List, Space, Empty, Row, Col, Grid } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useData, useLookup } from "@/store/DataContext";
import { tongHopCongNoKhachHang } from "@/utils/aggregate";
import { formatTien } from "@/utils/calc";
import type { CauHinhTheDau } from "@/components/shared/MobileTheDauTrang";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import MobileDanhSachCongNo from "@/components/shared/MobileDanhSachCongNo";

const { useBreakpoint } = Grid;

export default function CongNoPhaiThuPage() {
  const { data } = useData();
  const { khachHangMap } = useLookup(data);
  const [tuKhoa, setTuKhoa] = useState("");
  const [chiHienConNo, setChiHienConNo] = useState(false);
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  const tatCa = useMemo(() => tongHopCongNoKhachHang(data), [data]);

  const danhSach = useMemo(() => {
    let ds = tatCa;
    if (chiHienConNo) ds = ds.filter((d) => d.tongConNo > 0);
    if (tuKhoa.trim()) {
      const tk = tuKhoa.toLowerCase();
      ds = ds.filter((d) => (khachHangMap.get(d.khachHangId)?.hoTen ?? "").toLowerCase().includes(tk));
    }
    return [...ds].sort((a, b) => b.tongConNo - a.tongConNo);
  }, [tatCa, chiHienConNo, tuKhoa, khachHangMap]);

  // Thẻ đầu trang (điện thoại): còn phải thu + tiến độ thu -> chia theo tình trạng thu -> khách nợ nhiều nhất.
  // Tính trên toàn bộ công nợ, không đổi theo ô tìm kiếm hay nút "Còn nợ".
  const theDau = useMemo<CauHinhTheDau>(() => {
    const tongPhaiThu = tatCa.reduce((s, d) => s + d.tongPhaiThu, 0);
    const tongDaThu = tatCa.reduce((s, d) => s + d.tongDaThu, 0);
    const tongConNo = tatCa.reduce((s, d) => s + d.tongConNo, 0);
    const dem = (tt: "chua_thu" | "mot_phan" | "da_thu_du") => tatCa.filter((d) => d.trangThai === tt).length;
    const noNhieuNhat = tatCa.reduce<(typeof tatCa)[number] | null>(
      (max, d) => (d.tongConNo > 0 && (!max || d.tongConNo > max.tongConNo) ? d : max),
      null
    );
    return {
      phuDe: `${tatCa.length} khách hàng có công nợ`,
      nhanChinh: "Còn phải thu",
      giaTriChinh: formatTien(tongConNo),
      tienDo: {
        phanTram: tongPhaiThu > 0 ? Math.round((tongDaThu / tongPhaiThu) * 100) : 0,
        trai: `Đã thu ${formatTien(tongDaThu)}`,
        phai: `Tổng ${formatTien(tongPhaiThu)}`,
      },
      chiSo: [
        { nhan: "Chưa thu", giaTri: dem("chua_thu") },
        { nhan: "Thu một phần", giaTri: dem("mot_phan") },
        { nhan: "Đã thu đủ", giaTri: dem("da_thu_du") },
        {
          nhan: "Nợ nhiều nhất",
          giaTri: noNhieuNhat ? formatTien(noNhieuNhat.tongConNo) : "—",
          phu: noNhieuNhat ? khachHangMap.get(noNhieuNhat.khachHangId)?.hoTen ?? "—" : undefined,
          tone: noNhieuNhat ? "nguy-hiem" : undefined,
        },
      ],
    };
  }, [tatCa, khachHangMap]);

  const mucDanhSach = useMemo(
    () =>
      danhSach.map((d) => ({
        id: d.khachHangId,
        ten: khachHangMap.get(d.khachHangId)?.hoTen ?? "—",
        soChuyenLienQuan: d.soChuyenLienQuan,
        tongChinh: d.tongPhaiThu,
        tongConNo: d.tongConNo,
        trangThai: d.trangThai,
      })),
    [danhSach, khachHangMap]
  );

  return (
    <div>
      {isDesktop && (
        <>
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            Công nợ phải thu
          </Typography.Title>
          <Typography.Text type="secondary">Danh sách công nợ theo từng khách hàng</Typography.Text>
        </>
      )}

      {!isDesktop ? (
        <div>
          <MobileDanhSachCongNo
            tieuDe="Công nợ phải thu"
            theDau={theDau}
            danhSach={mucDanhSach}
            kieu="thu"
            hrefPrefix="/cong-no-phai-thu/chi-tiet?id="
            nhanTongChinh="Phải thu"
            placeholderTimKiem="Tìm khách hàng..."
            tuKhoa={tuKhoa}
            onChangeTuKhoa={setTuKhoa}
            chiHienConNo={chiHienConNo}
            onChangeChiHienConNo={setChiHienConNo}
          />
        </div>
      ) : (
        <>
      <Card size="small" style={{ margin: "16px 0" }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={16}>
            <Input
              placeholder="Tìm khách hàng..."
              prefix={<SearchOutlined />}
              value={tuKhoa}
              onChange={(e) => setTuKhoa(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8}>
            <Space>
              <Switch checked={chiHienConNo} onChange={setChiHienConNo} />
              <Typography.Text>Chỉ hiện người còn nợ</Typography.Text>
            </Space>
          </Col>
        </Row>
      </Card>

      {danhSach.length === 0 ? (
        <Empty description="Không có dữ liệu công nợ" />
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
          dataSource={danhSach}
          renderItem={(d) => {
            const lopMauThe =
              d.trangThai === "da_thu_du"
                ? "card-da-thu-du"
                : d.trangThai === "mot_phan"
                ? "card-mot-phan"
                : "card-chua-thu";
            const ten = khachHangMap.get(d.khachHangId)?.hoTen ?? "—";
            return (
              <List.Item>
                <Link href={`/cong-no-phai-thu/chi-tiet?id=${d.khachHangId}`} className="desktop-debt-card-link">
                  <div className={`desktop-debt-card ${lopMauThe}`}>
                    <div className="desktop-debt-top">
                      <div className="desktop-debt-avatar-wrap">
                        <div className="mobile-debt-avatar">{ten.charAt(0).toUpperCase()}</div>
                        <div className="desktop-debt-name-block">
                          <div className="desktop-debt-name">{ten}</div>
                          <div className="desktop-debt-sub">{d.soChuyenLienQuan} chuyến liên quan</div>
                        </div>
                      </div>
                      <TrangThaiTag trangThai={d.trangThai} />
                    </div>
                    <div className="desktop-debt-divider" />
                    <div className="desktop-debt-metrics">
                      <div>
                        <div className="desktop-debt-metric-label">Phải thu</div>
                        <SoTien value={d.tongPhaiThu} size={15} />
                      </div>
                      <div>
                        <div className="desktop-debt-metric-label">Còn nợ</div>
                        <SoTien value={d.tongConNo} mau={d.tongConNo > 0 ? "#C0392B" : "#1B7A43"} size={15} />
                      </div>
                    </div>
                  </div>
                </Link>
              </List.Item>
            );
          }}
        />
      )}
        </>
      )}
    </div>
  );
}
