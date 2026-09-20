import React from "react";
import { formatTien } from "@/utils/calc";

export default function SoTien({
  value,
  mau,
  size = 14,
  strong = true,
}: {
  value: number;
  mau?: string;
  size?: number;
  strong?: boolean;
}) {
  return (
    <span
      className={strong ? "tien-noi-bat" : undefined}
      style={{ color: mau, fontSize: size }}
    >
      {formatTien(value)}
    </span>
  );
}
