import { siteConfig } from "@/config/site";

/**
 * THE MIS LOGO SLOT
 * ---------------------------------------------------------------
 * Drop the official, unmodified logo file into:
 *
 *     src/assets/brand/mis-logo.png   (or .svg / .jpg / .webp)
 *
 * and it is used everywhere as-is (never recoloured, cropped or
 * stretched — only height-constrained, so proportions are kept).
 * Until the file exists, a neutral dashed placeholder is shown.
 * The logo is intentionally never re-drawn in code.
 */
const found = import.meta.glob("/src/assets/brand/mis-logo.{png,svg,jpg,jpeg,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const logoSrc: string | undefined = Object.values(found)[0];

export function Logo({ className = "h-10", plate = false }: { className?: string; plate?: boolean }) {
  const alt = `${siteConfig.shortName} — ${siteConfig.name.en}`;

  const inner = logoSrc ? (
    <img src={logoSrc} alt={alt} className={`${className} w-auto object-contain`} draggable={false} />
  ) : (
    <span
      role="img"
      aria-label={`${alt} (logo placeholder)`}
      className={`${className} inline-flex aspect-[2.6/1] flex-col items-center justify-center border border-dashed border-ink/40 px-3 text-ink/70`}
    >
      <span className="mono text-[10px] leading-none font-semibold">LOGO</span>
      <span className="mono mt-0.5 text-[8px] leading-none opacity-70">mis-logo.png</span>
    </span>
  );

  if (plate) return <span className="inline-flex bg-white p-3">{inner}</span>;
  return inner;
}

export const hasLogo = Boolean(logoSrc);
