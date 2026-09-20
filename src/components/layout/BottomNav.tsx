"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { PlusOutlined } from "@ant-design/icons";
import { NAV_BOTTOM_MOBILE, matchKey } from "./navConfig";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeKey = matchKey(pathname);

  return (
    <>
      <button
        aria-label="Tạo chuyến nhanh"
        className="fab-tao-chuyen chi-hien-mobile"
        onClick={() => router.push("/chuyen/tao")}
      >
        <PlusOutlined />
      </button>
      <nav className="bottom-nav chi-hien-mobile">
        {NAV_BOTTOM_MOBILE.map((item) => {
          const key = item.href === "/cong-no-phai-thu" ? "cong-no-phai-thu" : item.key;
          const active =
            activeKey === key || (item.href === "/bao-cao" && activeKey === "cai-dat");
          return (
            <a
              key={item.key}
              className={`bottom-nav-item${active ? " active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(item.href);
              }}
              href={item.href}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
