/**
 * The Axon Syria wordmark: "AXON SY" — charcoal "AXON" + royal-blue "SY"
 * (the brand colors, glyph-free by design). Rendered as text so it stays
 * crisp, uses the site fonts, and needs no image asset.
 */
export default function BrandMark({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <span className={`brand-mark${variant === "light" ? " brand-mark--light" : ""}`}>
      <span className="brand-mark__name">AXON</span>
      <span className="brand-mark__region">SY</span>
    </span>
  );
}
