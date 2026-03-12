import { ImageResponse } from "next/og";

// edge runtime removed — use default Node.js runtime for broader hosting compatibility
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
            background: "rgba(232,98,42,0.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "60px",
            bottom: "60px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "rgba(232,98,42,0.06)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            width: "100%",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontSize: "42px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-1.5px",
              }}
            >
              kiezly
            </span>
            <span style={{ fontSize: "42px", fontWeight: 800, color: "#e8622a" }}>.</span>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(232,98,42,0.9)",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Deine Nachbarschafts-Plattform
            </div>
            <div
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.05,
                letterSpacing: "-2.5px",
              }}
            >
              Mini-Jobs &{"\n"}
              <span style={{ color: "#e8622a" }}>Helfer</span> finden.
            </div>
            <div
              style={{
                fontSize: "22px",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 400,
                lineHeight: 1.5,
                maxWidth: "600px",
              }}
            >
              Babysitting, Umzug, Gartenarbeit, Putzen & mehr — schnell, sicher und lokal in Deutschland.
            </div>
          </div>

          {/* Category pills row */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {["🛒 Einkaufen", "🐕 Tiersitter", "🔨 Handwerk", "🌿 Garten", "🧹 Putzen", "👶 Kinderbetreuung"].map(
              (label) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 18px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.7)",
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
