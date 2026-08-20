import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "LambdaIDX Knowledge Base";
    const excerpt =
      searchParams.get("excerpt") ||
      "Infraestructura de conocimiento jerarquico y lectura academica.";
    const path = searchParams.get("path") || "/p";

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#09090b",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            color: "#fafafa",
            padding: "64px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Top Bar: Brand & Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                  color: "#09090b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "20px",
                }}
              >
                λ
              </div>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  color: "#f4f4f5",
                }}
              >
                LAMBDAIDX
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 16px",
                borderRadius: "9999px",
                backgroundColor: "rgba(39, 39, 42, 0.8)",
                border: "1px solid #3f3f46",
                fontSize: "14px",
                color: "#a1a1aa",
                fontFamily: "monospace",
              }}
            >
              {path}
            </div>
          </div>

          {/* Center: Title & Excerpt */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "1000px",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#ffffff",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: "22px",
                lineHeight: 1.4,
                color: "#a1a1aa",
              }}
            >
              {excerpt}
            </div>
          </div>

          {/* Bottom Bar: Tagline & Meta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #27272a",
              paddingTop: "24px",
              fontSize: "14px",
              color: "#71717a",
              fontFamily: "monospace",
            }}
          >
            <span>KNOWLEDGE INFRASTRUCTURE</span>
            <span>LAMBDAIDX.COM</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
