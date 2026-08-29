import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MockDrop — Paste JSON. Get a live API.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px",
          background: "#0A0F0D",
          backgroundImage:
            "radial-gradient(circle at 30% 30%, #10B98122 0%, transparent 50%), radial-gradient(circle at 80% 80%, #05966918 0%, transparent 50%)",
        }}
      >
        {/* pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: 14,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#9CA3AF",
            fontFamily: "monospace",
            border: "1px solid #1F2A24",
            background: "#111C18",
            borderRadius: 999,
            padding: "8px 16px",
            width: "fit-content",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#10B981",
            }}
          />
          Live in 2 seconds · Expires in 24 hours
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 32,
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#F6FAF7",
            }}
          >
            Paste JSON.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#10B981",
            }}
          >
            Get a live API.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#9CA3AF",
              marginTop: 16,
              maxWidth: 760,
              lineHeight: 1.5,
            }}
          >
            No signup, no backend, no waiting. CORS-enabled ephemeral mocks for frontend prototypes & QA.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid #1F2A24",
          }}
        >
          <div style={{ display: "flex", fontSize: 20, fontWeight: 700, color: "#F6FAF7" }}>
            MockDrop<span style={{ color: "#10B981" }}>.</span>
          </div>
          <div style={{ display: "flex", fontSize: 14, color: "#6B7280", fontFamily: "monospace" }}>
            mockdrop.pxxl.click
          </div>
        </div>
      </div>
    ),
    size,
  );
}
