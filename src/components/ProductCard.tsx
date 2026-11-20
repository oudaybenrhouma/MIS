import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { getBrand } from "@/data/brands";
import { getCategory } from "@/data/categories";
import type { Product } from "@/data/types";
import { ProductImage } from "./ProductImage";
import { AddToQuote } from "./AddToQuote";
import { CategoryIcon } from "./CategoryIcon";
import { RetailOffer } from "./RetailOffer";

export function CategoryChip({ slug }: { slug: string }) {
  const { tr } = useI18n();
  const cat = getCategory(slug);
  if (!cat) return null;
  return (
    <span
      title={tr(cat.name)}
      className="mono inline-flex items-center gap-1 border border-ink/20 px-1.5 py-0.5 text-[10px] font-medium text-ink/70"
    >
      <CategoryIcon name={cat.icon} className="size-3" />
      {cat.code}
    </span>
  );
}

export function ProductCard({ product, view = "grid" }: { product: Product; view?: "grid" | "list" }) {
  const { tr, t } = useI18n();
  const brand = getBrand(product.brand);
  const description = tr(product.description);
  const to = `/product/${product.id}`;

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <Link to={`/brand/${product.brand}`} className="label text-signal hover:underline">
          {brand?.name}
        </Link>
        <CategoryChip slug={product.category} />
      </div>
      <Link to={to} className="font-semibold leading-snug hover:text-signal">
        {tr(product.name)}
      </Link>
      <span className="mono text-xs text-mist">{product.ref}</span>
    </>
  );

  if (view === "list") {
    return (
      <article className="group relative flex flex-col gap-0 border border-ink/10 bg-white transition-colors hover:border-ink sm:flex-row sm:items-stretch">
        <Link to={to} className="block sm:w-48 sm:shrink-0" aria-label={tr(product.name)} tabIndex={-1}>
          <ProductImage product={product} className="aspect-[4/3] sm:h-full sm:aspect-auto" />
        </Link>
        <div className="relative flex flex-1 flex-col justify-center gap-2 p-4">{body}
          {description && <p className="line-clamp-1 text-sm text-ink/60">{description}</p>}
        </div>
        <div className="flex items-center gap-3 p-4 sm:w-56 sm:shrink-0 sm:border-s sm:border-ink/10">
          <div className="w-full">
            <RetailOffer productId={product.id} compact />
            <AddToQuote product={product} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col border border-ink/10 bg-white transition-all duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-500 hover:-translate-y-0.5 hover:border-ink hover:shadow-[6px_6px_0_rgba(11,11,12,0.08)] hover:after:scale-x-100 rtl:after:origin-right">
      <Link to={to} className="block" aria-label={tr(product.name)} tabIndex={-1}>
        <ProductImage product={product} />
      </Link>
      {product.placeholder && (
        <span className="label absolute top-2 end-2 bg-ink px-1.5 py-0.5 text-[9px] text-white" aria-hidden>
          {t("common.placeholderBadge")}
        </span>
      )}
      <div className="relative flex flex-1 flex-col gap-2 p-4">
        {body}
        <div className="mt-auto pt-3">
          <RetailOffer productId={product.id} compact />
          <AddToQuote product={product} />
        </div>
      </div>
    </article>
  );
}
