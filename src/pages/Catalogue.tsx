import { useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { facetCounts, queryProducts, type SortKey } from "@/services/catalog";
import { PageHeader } from "@/components/PageHeader";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchField, SortSelect, ViewToggle } from "@/components/Toolbar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { usePageTitle } from "@/components/common";

const csv = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

function Check({ checked, onChange, children, count }: { checked: boolean; onChange: () => void; children: ReactNode; count: number }) {
  const { n } = useI18n();
  return (
    <label
      className={`group flex cursor-pointer items-center gap-3 px-2 py-2 text-sm transition-colors hover:bg-ink/5 ${
        count === 0 && !checked ? "opacity-40" : ""
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="flex size-[18px] shrink-0 items-center justify-center border-[1.5px] border-ink bg-white transition-colors peer-checked:bg-signal peer-checked:border-signal peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal">
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3 text-white" aria-hidden>
            <path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </span>
      <span className="flex flex-1 items-center gap-2 font-medium">{children}</span>
      <span className="mono text-[11px] text-mist">{n(count)}</span>
    </label>
  );
}

export default function Catalogue() {
  const { t, tr, n, lang } = useI18n();
  const [params, setParams] = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const q = params.get("q") ?? "";
  const cats = csv(params.get("category"));
  const brs = csv(params.get("brand"));
  const sort = (params.get("sort") as SortKey) || "name";

  usePageTitle(t("catalogue.title"));

  const update = (next: Record<string, string | string[] | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      const value = Array.isArray(v) ? v.join(",") : v;
      if (value) p.set(k, value);
      else p.delete(k);
    }
    setParams(p, { replace: true });
  };

  const toggle = (key: "category" | "brand", list: string[], id: string) =>
    update({ [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] });

  const query = { q, categories: cats, brands: brs, sort };
  const results = useMemo(() => queryProducts(query, lang), [q, cats.join(), brs.join(), sort, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const facets = facetCounts(query);
  const activeCount = cats.length + brs.length;

  const panel = (
    <div className="space-y-8">
      <div>
        <h3 className="label mb-3 flex items-center justify-between text-ink">
          {t("common.categories")}
          {cats.length > 0 && (
            <button onClick={() => update({ category: null })} className="text-signal hover:underline">
              {t("common.clear")}
            </button>
          )}
        </h3>
        <div className="-mx-2">
          {categories.map((c) => (
            <Check key={c.slug} checked={cats.includes(c.slug)} onChange={() => toggle("category", cats, c.slug)} count={facets.categories[c.slug] ?? 0}>
              <CategoryIcon name={c.icon} className="size-4 shrink-0 text-ink/60" />
              <span className="leading-tight">{tr(c.name)}</span>
            </Check>
          ))}
        </div>
      </div>
      <div>
        <h3 className="label mb-3 flex items-center justify-between text-ink">
          {t("common.brands")}
          {brs.length > 0 && (
            <button onClick={() => update({ brand: null })} className="text-signal hover:underline">
              {t("common.clear")}
            </button>
          )}
        </h3>
        <div className="-mx-2">
          {brands.map((b) => (
            <Check key={b.slug} checked={brs.includes(b.slug)} onChange={() => toggle("brand", brs, b.slug)} count={facets.brands[b.slug] ?? 0}>
              {b.name}
            </Check>
          ))}
        </div>
      </div>
    </div>
  );

  const activeChips = [
    ...cats.map((id) => ({ key: "category" as const, list: cats, id, label: tr(categories.find((c) => c.slug === id)!.name) })),
    ...brs.map((id) => ({ key: "brand" as const, list: brs, id, label: brands.find((b) => b.slug === id)!.name })),
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("catalogue.kicker") }]}
        kicker={t("catalogue.kicker")}
        title={q ? t("catalogue.searchResultsFor", { q }) : t("catalogue.title")}
        intro={t("catalogue.intro")}
        aside={
          <div className="text-white">
            <p className="display text-6xl md:text-8xl" style={{ fontFamily: "Archivo, sans-serif" }}>
              {n(results.length)}
            </p>
            <p className="label mt-1 text-white/70">{t("common.products")}</p>
          </div>
        }
      />

      <div className="mx-auto max-w-[1360px] px-5 py-10 sm:px-8 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="thin-scroll sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pe-2">{panel}</div>
          </aside>

          <div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SearchField value={q} onChange={(v) => update({ q: v || null })} placeholder={t("catalogue.searchPlaceholder")} />
              <div className="flex gap-3">
                <button
                  onClick={() => setDrawer(true)}
                  className="field flex !h-12 !w-auto items-center gap-2 font-semibold lg:hidden"
                >
                  <SlidersHorizontal className="size-4" /> {t("common.filters")}
                  {activeCount > 0 && <span className="mono bg-signal px-1.5 text-xs text-white">{activeCount}</span>}
                </button>
                <SortSelect value={sort} onChange={(v) => update({ sort: v === "name" ? null : v })} />
                <ViewToggle value={view} onChange={setView} />
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2" aria-label={t("catalogue.activeFilters")}>
                {activeChips.map((c) => (
                  <button
                    key={`${c.key}-${c.id}`}
                    onClick={() => toggle(c.key, c.list, c.id)}
                    className="flex items-center gap-2 bg-ink px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-signal"
                  >
                    {c.label} <X className="size-3.5" />
                  </button>
                ))}
                <button onClick={() => update({ category: null, brand: null })} className="px-2 text-sm text-signal underline underline-offset-4">
                  {t("common.clearFilters")}
                </button>
              </div>
            )}

            <p className="mono mt-6 mb-4 text-xs text-mist">{t("common.results", { n: n(results.length) })}</p>
            <ProductGrid products={results} view={view} columns="xl:grid-cols-3" resetKey={`${q}|${cats}|${brs}|${sort}|${view}`} />

            <div className="mt-14 flex flex-col items-start justify-between gap-4 border border-ink/20 bg-bone p-6 sm:flex-row sm:items-center">
              <p className="max-w-lg text-ink/70">{t("catalogue.noResultsText")}</p>
              <Link to="/quote/request" className="btn btn-ink shrink-0">
                {t("catalogue.customRequest")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label={t("common.filters")}>
          <div className="absolute inset-0 bg-ink/60" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 start-0 flex w-[88%] max-w-sm flex-col bg-paper shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/15 p-4">
              <p className="display text-xl">{t("common.filters")}</p>
              <button onClick={() => setDrawer(false)} aria-label={t("nav.close")} className="flex size-10 items-center justify-center border border-ink/20">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{panel}</div>
            <div className="border-t border-ink/15 p-4">
              <button className="btn btn-red w-full" onClick={() => setDrawer(false)}>
                {t("common.showResults")} ({n(results.length)})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
