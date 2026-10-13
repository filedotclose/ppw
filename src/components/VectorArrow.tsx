import type { CSSProperties } from "react";

export type ArrowDirection =
  | "up-right"
  | "down-right"
  | "up"
  | "down"
  | "left"
  | "right"
  | "left-right"
  | "return";

export interface VectorArrowProps {
  direction?: ArrowDirection;
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

const ARROW_PATHS: Record<ArrowDirection, string> = {
  "up-right": "M6 18L18 6M8 6H18V16",
  "down-right": "M6 6L18 18M18 8V18H8",
  up: "M12 20V4M5 11L12 4L19 11",
  down: "M12 4V20M5 13L12 20L19 13",
  left: "M20 12H4M11 5L4 12L11 19",
  right: "M4 12H20M13 5L20 12L13 19",
  "left-right": "M3 12H21M7 8L3 12L7 16M17 8L21 12L17 16",
  return: "M19 6V15H5M10 10L5 15L10 20",
};

export default function VectorArrow({
  direction = "up-right",
  className,
  strokeWidth = 1.75,
  style,
}: VectorArrowProps) {
  return (
    <span
      className={className ? `vector-arrow ${className}` : "vector-arrow"}
      aria-hidden="true"
      data-vector-arrow={direction}
      style={style}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
        aria-hidden="true"
      >
        <path d={ARROW_PATHS[direction]} />
      </svg>
    </span>
  );
}
