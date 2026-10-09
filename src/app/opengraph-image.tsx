import { ImageResponse } from "next/og";

export const alt = "Sujal Agarwal — Full-stack, AI & automation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#e9e5dc",
        color: "#252822",
        padding: "55px 65px",
        justifyContent: "space-between",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>SUJAL AGARWAL</span>
        <span>SELECTED WORK</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 136,
          fontWeight: 700,
          letterSpacing: "-9px",
          lineHeight: 0.9,
        }}
      >
        <span>SUJAL</span>
        <span>
          AGARWAL<span style={{ color: "#b8432d" }}>.</span>
        </span>
      </div>
      <div style={{ fontSize: 23 }}>Full-stack. AI. Automation.</div>
    </div>,
    size,
  );
}
