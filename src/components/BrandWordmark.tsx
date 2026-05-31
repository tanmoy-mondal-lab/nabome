type BrandWordmarkProps = {
  size?: "nav" | "hero" | "footer" | "inline";
};

export default function BrandWordmark({ size = "inline" }: BrandWordmarkProps) {
  return (
    <span className={`brand-wordmark brand-wordmark-${size}`} aria-label="নবME">
      <span className="brand-wordmark-bengali">নব</span>
      <span className="brand-wordmark-latin">ME</span>
    </span>
  );
}
