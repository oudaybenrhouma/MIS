import { useI18n } from "@/i18n";
import type { Product } from "@/data/types";
import { getCategory } from "@/data/categories";

/**
 * Neutral placeholder: engineering-paper grid, crop marks and a diagonal cross.
 * Deliberately does NOT depict any product. When `product.image` is set
 * (real catalogue photography), it is rendered instead.
 */
export function ProductImage({
  product,
  className = "aspect-[4/3]",
  large = false,
}: {
  product: Product;
  className?: string;
  large?: boolean;
}) {
  const { t, tr } = useI18n();
  const cat = getCategory(product.category);

  if (product.image) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <img src={product.image} alt={tr(product.name)} className="size-full object-contain" loading="lazy" />
      </div>
    );
  }

  return (
    <div
      className={`bp-grid-light relative isolate overflow-hidden bg-[#e9e7e1] ${className}`}
      role="img"
      aria-label={`${t("common.placeholderImage")} — ${tr(product.name)}`}
    >
      <svg className="absolute inset-0 -z-10 size-full text-ink/[0.09]" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* crop marks */}
      {["top-2 start-2 border-t border-s", "top-2 end-2 border-t border-e", "bottom-2 start-2 border-b border-s", "bottom-2 end-2 border-b border-e"].map(
        (c) => (
          <span key={c} className={`absolute size-3 border-ink/40 ${c}`} aria-hidden />
        )
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`mono bg-[#e9e7e1]/90 px-3 py-1 font-semibold text-ink/30 ${large ? "text-6xl" : "text-3xl"}`}
          style={{ letterSpacing: "0.08em" }}
        >
          {cat?.code ?? "MIS"}
        </span>
      </div>
      <span className="label absolute bottom-2.5 start-6 text-ink/45">{t("common.placeholderImage")}</span>
    </div>
  );
}
