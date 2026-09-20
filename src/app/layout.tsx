import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "Quản Lý Chuyến Xe - Prototype",
  description: "Prototype quản lý chuyến xe, hàng hóa, thu tiền, chi phí và công nợ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
