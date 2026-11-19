import { useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import type { CategoryIconName } from "@/data/types";
import { facetCounts, queryProducts, type SortKey } from "@/services/catalog";
import { ProductGrid } from "./ProductGrid";
import { SearchField, SortSelect, ViewToggle } from "./Toolbar";
import { CategoryIcon } from "./CategoryIcon";

/**
 * Self-contained listing for category / brand pages.
 * One dimension is fixed by the page; the other is a chip filter.
 */
export function ProductListing({ fixed }: { fixed: { category?: string; brand?: string } }) {
  const { t, tr, n, lang } = useI18n();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [chip, setChip] = useState<string | null>(null);

  const byBrand = Boolean(fixed.category);
  const query = {
    q,
    sort,
    categories: fixed.category ? [fixed.category] : chip ? [chip] : [],
    brands: fixed.brand ? [fixed.brand] : chip ? [chip] : [],
  };
  // when the category is fixed, chips filter brands; when the brand is fixed, chips filter categories
  if (fixed.category) query.brands = chip ? [chip] : [];
  if (fixed.brand) query.categories = chip ? [chip] : [];

  const base = { q, categories: fixed.category ? [fixed.category] : [], brands: fixed.brand ? [fixed.brand] : [] };
  const counts = facetCounts(base);
  const results = useMemo(() => queryProducts(query, lang), [q, sort, chip, lang, fixed.brand, fixed.category]); // eslint-disable-line react-hooks/exhaustive-deps

  type Chip = { id: string; label: string; count: number; icon?: CategoryIconName };
  const chips: Chip[] = byBrand
    ? brands.filter((b) => counts.brands[b.slug]).map((b) => ({ id: b.slug, label: b.name, count: counts.brands[b.slug] }))
    : categories
        .filter((c) => counts.categories[c.slug])
        .map((c) => ({ id: c.slug, label: tr(c.name), count: counts.categories[c.slug], icon: c.icon }));

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchField value={q} onChange={setQ} placeholder={t("catalogue.searchPlaceholder")} />
        <div className="flex gap-3">
          <SortSelect value={sort} onChange={setSort} />
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {chips.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setChip(null)}
            aria-pressed={chip === null}
            className={`border-[1.5px] px-3 py-1.5 text-sm font-semibold transition-colors ${
              chip === null ? "border-ink bg-ink text-white" : "border-ink/25 bg-white hover:border-ink"
            }`}
          >
            {byBrand ? t("category.allBrands") : t("brand.allCategories")}
          </button>
          {chips.map((c) => (
            <button
              key={c.id}
              onClick={() => setChip(chip === c.id ? null : c.id)}
              aria-pressed={chip === c.id}
              className={`flex items-center gap-2 border-[1.5px] px-3 py-1.5 text-sm font-semibold transition-colors ${
                chip === c.id ? "border-signal bg-signal text-white" : "border-ink/25 bg-white hover:border-ink"
              }`}
            >
              {c.icon && <CategoryIcon name={c.icon} className="size-4" />}
              {c.label}
              <span className="mono text-[11px] opacity-60">{n(c.count)}</span>
            </button>
          ))}
        </div>
      )}

      <p className="mono mt-6 mb-4 text-xs text-mist">{t("common.results", { n: n(results.length) })}</p>
      <ProductGrid products={results} view={view} resetKey={`${q}|${sort}|${chip}|${view}`} />
    </div>
  );
}
