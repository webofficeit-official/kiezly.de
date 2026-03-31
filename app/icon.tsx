import { ImageResponse } from "next/og";

// edge runtime removed — use default Node.js runtime
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111110",
          borderRadius: "7px",
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.5px",
            lineHeight: 1,
          }}
        >
          k
        </span>
        <span
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#e8622a",
            lineHeight: 1,
            marginTop: "4px",
          }}
        >
          .
        </span>
      </div>
    ),
    { ...size }
  );
}
