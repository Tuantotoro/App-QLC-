"use client";

import React, { useMemo, useState } from "react";
import { Typography, Input, Switch, Card, List, Space, Empty, Row, Col, Grid } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useData, useLookup } from "@/store/DataContext";
import { tongHopCongNoNguoiBocHang } from "@/utils/aggregate";
import { formatTien } from "@/utils/calc";
import type { CauHinhTheDau } from "@/components/shared/MobileTheDauTrang";
import SoTien from "@/components/shared/SoTien";
import TrangThaiTag from "@/components/shared/TrangThaiTag";
import MobileDanhSachCongNo from "@/components/shared/MobileDanhSachCongNo";

const { useBreakpoint } = Grid;

export default function CongNoPhaiTraPage() {
  const { data } = useData();
  const { nguoiBocHangMap } = useLookup(data);
  const [tuKhoa, setTuKhoa] = useState("");
  const [chiHienConNo, setChiHienConNo] = useState(false);
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  const tatCa = useMemo(() => tongHopCongNoNguoiBocHang(data), [data]);

  const danhSach = useMemo(() => {
    let ds = tatCa;
    if (chiHienConNo) ds = ds.filter((d) => d.tongConNo > 0);
    if (tuKhoa.trim()) {
      const tk = tuKhoa.toLowerCase();
      ds = ds.filter((d) =>
        (nguoiBocHangMap.get(d.nguoiBocHangId)?.hoTen ?? "").toLowerCase().includes(tk)
      );
    }
    return [...ds].sort((a, b) => b.tongConNo - a.tongConNo);
  }, [tatCa, chiHienConNo, tuKhoa, nguoiBocHangMap]);

  // Thẻ đầu trang (điện thoại): còn phải trả + tiến độ trả -> chia theo tình trạng trả -> người bốc bị nợ nhiều nhất.
  // Tính trên toàn bộ công nợ, không đổi theo ô tìm kiếm hay nút "Còn nợ".
  const theDau = useMemo<CauHinhTheDau>(() => {
    const tongPhaiTra = tatCa.reduce((s, d) => s + d.tongPhaiTra, 0);
    const tongDaTra = tatCa.reduce((s, d) => s + d.tongDaTra, 0);
    const tongConNo = tatCa.reduce((s, d) => s + d.tongConNo, 0);
    const dem = (tt: "chua_thu" | "mot_phan" | "da_thu_du") => tatCa.filter((d) => d.trangThai === tt).length;
    const noNhieuNhat = tatCa.reduce<(typeof tatCa)[number] | null>(
      (max, d) => (d.tongConNo > 0 && (!max || d.tongConNo > max.tongConNo) ? d : max),
      null
    );
    return {
      phuDe: `${tatCa.length} người bốc hàng có công nợ`,
      nhanChinh: "Còn phải trả",
      giaTriChinh: formatTien(tongConNo),
      tienDo: {
        phanTram: tongPhaiTra > 0 ? Math.round((tongDaTra / tongPhaiTra) * 100) : 0,
        trai: `Đã trả ${formatTien(tongDaTra)}`,
        phai: `Tổng ${formatTien(tongPhaiTra)}`,
      },
      chiSo: [
        { nhan: "Chưa trả", giaTri: dem("chua_thu") },
        { nhan: "Trả một phần", giaTri: dem("mot_phan") },
        { nhan: "Đã trả đủ", giaTri: dem("da_thu_du") },
        {
          nhan: "Nợ nhiều nhất",
          giaTri: noNhieuNhat ? formatTien(noNhieuNhat.tongConNo) : "—",
          phu: noNhieuNhat ? nguoiBocHangMap.get(noNhieuNhat.nguoiBocHangId)?.hoTen ?? "—" : undefined,
          tone: noNhieuNhat ? "nguy-hiem" : undefined,
        },
      ],
    };
  }, [tatCa, nguoiBocHangMap]);

  const mucDanhSach = useMemo(
    () =>
      danhSach.map((d) => ({
        id: d.nguoiBocHangId,
        ten: nguoiBocHangMap.get(d.nguoiBocHangId)?.hoTen ?? "—",
        soChuyenLienQuan: d.soChuyenLienQuan,
        tongChinh: d.tongPhaiTra,
        tongConNo: d.tongConNo,
        trangThai: d.trangThai,
      })),
    [danhSach, nguoiBocHangMap]
  );

  return (
    <div>
      {isDesktop && (
        <>
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            Công nợ phải trả
          </Typography.Title>
          <Typography.Text type="secondary">Danh sách công nợ theo từng người bốc hàng</Typography.Text>
        </>
      )}

      {!isDesktop ? (
        <div>
          <MobileDanhSachCongNo
            tieuDe="Công nợ phải trả"
            theDau={theDau}
            danhSach={mucDanhSach}
            kieu="tra"
            hrefPrefix="/cong-no-phai-tra/chi-tiet?id="
            nhanTongChinh="Phải trả"
            placeholderTimKiem="Tìm người bốc hàng..."
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
              placeholder="Tìm người bốc hàng..."
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
            const ten = nguoiBocHangMap.get(d.nguoiBocHangId)?.hoTen ?? "—";
            return (
              <List.Item>
                <Link href={`/cong-no-phai-tra/chi-tiet?id=${d.nguoiBocHangId}`} className="desktop-debt-card-link">
                  <div className={`desktop-debt-card ${lopMauThe}`}>
                    <div className="desktop-debt-top">
                      <div className="desktop-debt-avatar-wrap">
                        <div className="mobile-debt-avatar tra">{ten.charAt(0).toUpperCase()}</div>
                        <div className="desktop-debt-name-block">
                          <div className="desktop-debt-name">{ten}</div>
                          <div className="desktop-debt-sub">{d.soChuyenLienQuan} chuyến liên quan</div>
                        </div>
                      </div>
                      <TrangThaiTag trangThai={d.trangThai} kieu="tra" />
                    </div>
                    <div className="desktop-debt-divider" />
                    <div className="desktop-debt-metrics">
                      <div>
                        <div className="desktop-debt-metric-label">Phải trả</div>
                        <SoTien value={d.tongPhaiTra} size={15} />
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
