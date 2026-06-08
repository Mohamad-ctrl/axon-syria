import { ImageResponse } from "next/og";

/**
 * Fixed-URL branded social card at /api/og, referenced by `openGraph.images` on
 * every page so link previews (WhatsApp, Facebook, X, …) show the Axon Syria
 * brand instead of a default framework icon. Lives under /api so the locale
 * proxy doesn't redirect it. Royal-blue (#3D55E0) brand on a dark ground.
 */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background: "linear-gradient(135deg, #0D0E11 0%, #1C1D23 45%, #2C40C8 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "76px",
              height: "76px",
              borderRadius: "18px",
              background: "#3D55E0",
              fontSize: "44px",
              fontWeight: 800,
            }}
          >
            {"A"}
          </div>
          <div style={{ display: "flex", fontSize: "30px", letterSpacing: "8px", color: "#9DB0FF", fontWeight: 700 }}>
            {"AXON SY"}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: "104px", fontWeight: 800, lineHeight: 1.05 }}>{"Axon Syria"}</div>
        <div style={{ display: "flex", fontSize: "46px", color: "#C9D6E8", marginTop: "24px" }}>
          {"Building Syria's Future"}
        </div>
        <div style={{ display: "flex", fontSize: "30px", color: "#8FA3C8", marginTop: "48px" }}>{"axon-sy.com"}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
