import { ImageResponse } from "next/og";

export const alt = "Kiezly – Mini-Jobs & Helfer in deiner Nähe";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#111110",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orange accent bar top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#e8622a",
            display: "flex",
          }}
        />

        {/* Large faded circle decoration */}
        <div
          style={{
            position: "absolute",
            right: "-120px",
            bottom: "-120px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background: "rgba(232,98,42,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "80px",
            bottom: "80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(232,98,42,0.05)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            flex: 1,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "2px" }}>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-1.5px",
                lineHeight: 1,
              }}
            >
              kiezly
            </span>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 800,
                color: "#e8622a",
                lineHeight: 1,
              }}
            >
              .
            </span>
          </div>

          {/* Headline block */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#e8622a",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Deine Nachbarschafts-Plattform
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
              <span
                style={{
                  fontSize: "76px",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.05,
                  letterSpacing: "-3px",
                }}
              >
                Mini-Jobs &amp;
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                <span
                  style={{
                    fontSize: "76px",
                    fontWeight: 800,
                    color: "#e8622a",
                    lineHeight: 1.05,
                    letterSpacing: "-3px",
                  }}
                >
                  Helfer
                </span>
                <span
                  style={{
                    fontSize: "76px",
                    fontWeight: 800,
                    color: "#ffffff",
                    lineHeight: 1.05,
                    letterSpacing: "-3px",
                  }}
                >
                  finden.
                </span>
              </div>
            </div>

            <span
              style={{
                fontSize: "22px",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 400,
                lineHeight: 1.5,
                maxWidth: "620px",
              }}
            >
              Babysitting, Umzug, Gartenarbeit, Putzen &amp; mehr — schnell, sicher und lokal.
            </span>
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: "10px" }}>
            {["🛒 Einkaufen", "🐕 Tiersitter", "🔨 Handwerk", "🌿 Garten", "🧹 Putzen", "👶 Kinder"].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 18px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
