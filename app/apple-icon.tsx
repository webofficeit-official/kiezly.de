import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: "38px",
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            fontSize: "108px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-3px",
            lineHeight: 1,
          }}
        >
          k
        </span>
        <span
          style={{
            fontSize: "108px",
            fontWeight: 800,
            color: "#e8622a",
            lineHeight: 1,
            marginTop: "20px",
          }}
        >
          .
        </span>
      </div>
    ),
    { ...size }
  );
}
