import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/i18n";
import { brands, getBrand } from "@/data/brands";
import { categories } from "@/data/categories";
import { categoriesForBrand, countProducts, normalise } from "@/services/catalog";
import { PageHeader } from "@/components/PageHeader";
import { ProductListing } from "@/components/ProductListing";
import { SearchField } from "@/components/Toolbar";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Reveal } from "@/components/Reveal";
import { Arrow, usePageTitle } from "@/components/common";
import NotFound from "./NotFound";

/** Neutral typographic brand plate — stands in until licensed brand assets exist. */
function BrandPlate({ monogram, size = "md" }: { monogram: string; size?: "md" | "lg" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-ink text-white ${size === "lg" ? "size-24 text-4xl md:size-32 md:text-5xl" : "size-14 text-xl sm:size-16 sm:text-2xl"}`}
      style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, letterSpacing: "-0.03em" }}
      aria-hidden
    >
      {monogram}
    </span>
  );
}

export function BrandsDirectory() {
  const { t, tr, n } = useI18n();
  usePageTitle(t("brandsPage.title"));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const list = useMemo(
    () =>
      brands
        .filter((b) => !cat || b.categories.includes(cat))
        .filter((b) => !q || normalise(`${b.name} ${b.focus.en} ${b.focus.ar}`).includes(normalise(q)))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [q, cat]
  );

  // alphabetical grouping
  const groups = list.reduce<Record<string, typeof list>>((acc, b) => {
    const k = b.name[0].toUpperCase();
    (acc[k] ??= []).push(b);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("brandsPage.title") }]}
        kicker={t("brandsPage.kicker")}
        title={t("brandsPage.title")}
        intro={t("brandsPage.intro")}
      />
      <section className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="md:w-96">
            <SearchField value={q} onChange={setQ} placeholder={t("brandsPage.searchPlaceholder")} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCat(null)}
              aria-pressed={cat === null}
              className={`border-[1.5px] px-3 py-2 text-sm font-semibold ${cat === null ? "border-ink bg-ink text-white" : "border-ink/25 bg-white hover:border-ink"}`}
            >
              {t("brandsPage.allCategories")}
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(cat === c.slug ? null : c.slug)}
                aria-pressed={cat === c.slug}
                title={tr(c.name)}
                className={`flex items-center gap-1.5 border-[1.5px] px-3 py-2 text-sm font-semibold ${cat === c.slug ? "border-signal bg-signal text-white" : "border-ink/25 bg-white hover:border-ink"}`}
              >
                <CategoryIcon name={c.icon} className="size-4" />
                <span className="hidden xl:inline">{tr(c.name)}</span>
                <span className="mono text-[11px] xl:hidden">{c.code}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12">
          {list.length === 0 && <p className="border border-dashed border-ink/25 p-10 text-center text-ink/60">{t("brandsPage.empty")}</p>}
          {Object.entries(groups).map(([letter, items]) => (
            <div key={letter} className="grid gap-4 border-t-2 border-ink py-6 md:grid-cols-[96px_1fr]">
              <p className="display text-5xl text-signal md:text-6xl" style={{ fontFamily: "Archivo, sans-serif" }}>
                {letter}
              </p>
              <ul className="divide-y divide-ink/15">
                {items.map((b) => (
                  <li key={b.slug}>
                    <Reveal>
                      <Link
                        to={`/brand/${b.slug}`}
                        className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 transition-colors hover:text-signal sm:gap-6"
                      >
                        <BrandPlate monogram={b.monogram} />
                        <span>
                          <span className="display block text-3xl sm:text-4xl" style={{ fontFamily: "Archivo, sans-serif", letterSpacing: "-0.03em" }}>
                            {b.name}
                          </span>
                          <span className="mt-1 block text-sm text-ink/60">
                            <span className="label me-2 text-mist">{t("brandsPage.focus")}</span>
                            {tr(b.focus)}
                          </span>
                          <span className="mt-2 flex flex-wrap gap-1.5">
                            {categoriesForBrand(b.slug).map((c) => (
                              <span key={c.slug} className="mono flex items-center gap-1 border border-ink/20 px-1.5 py-0.5 text-[10px] text-ink/70" title={tr(c.name)}>
                                <CategoryIcon name={c.icon} className="size-3" /> {c.code}
                              </span>
                            ))}
                          </span>
                        </span>
                        <span className="flex items-center gap-4">
                          <span className="mono hidden text-xs text-mist sm:block">
                            {t("common.nProducts", { n: n(countProducts({ brand: b.slug })) })}
                          </span>
                          <span className="flex size-10 items-center justify-center border border-ink/30 transition-colors group-hover:border-signal group-hover:bg-signal group-hover:text-white">
                            <Arrow />
                          </span>
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function BrandPage() {
  const { slug = "" } = useParams();
  const { t, tr, n } = useI18n();
  const brand = getBrand(slug);
  usePageTitle(brand?.name ?? t("brand.notFound"));
  if (!brand) return <NotFound title={t("brand.notFound")} />;

  const cats = categoriesForBrand(brand.slug);
  const others = brands.filter((b) => b.slug !== brand.slug);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: t("nav.home"), to: "/" },
          { label: t("brandsPage.title"), to: "/brands" },
          { label: brand.name },
        ]}
        kicker={t("brand.kicker")}
        title={<span style={{ fontFamily: "Archivo, sans-serif", letterSpacing: "-0.04em" }}>{brand.name}</span>}
        intro={tr(brand.focus)}
        aside={<BrandPlate monogram={brand.monogram} size="lg" />}
      />

      <section className="mx-auto grid max-w-[1360px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <p className="label mb-3 text-signal">{t("brand.profile")}</p>
          <p className="text-lg text-ink/75">{tr(brand.description)}</p>
          <p className="mono mt-4 border border-dashed border-ink/30 p-3 text-xs text-mist">{t("brand.logoNote")}</p>
        </div>
        <div className="md:col-span-7">
          <p className="label mb-3 text-signal">{t("brand.categories")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {cats.map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="group flex items-center gap-4 border-[1.5px] border-ink bg-white p-4 transition-colors hover:bg-ink hover:text-white"
              >
                <CategoryIcon name={c.icon} className="size-8 shrink-0 text-signal" />
                <span className="flex-1">
                  <span className="block font-semibold">{tr(c.name)}</span>
                  <span className="mono text-[11px] opacity-60">{c.code} · {t("common.nProducts", { n: n(countProducts({ category: c.slug, brand: brand.slug })) })}</span>
                </span>
                <Arrow className="size-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8">
        <h2 className="display mb-8 text-2xl md:text-3xl">{t("brand.products", { brand: brand.name })}</h2>
        <ProductListing fixed={{ brand: brand.slug }} />
      </section>

      <section className="border-t border-ink/15 bg-bone">
        <div className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8">
          <p className="label mb-5 text-mist">{t("common.brands")}</p>
          <div className="flex flex-wrap gap-2">
            {others.map((b) => (
              <Link key={b.slug} to={`/brand/${b.slug}`} className="border border-ink/20 bg-white px-4 py-2 font-semibold transition-colors hover:border-signal hover:text-signal">
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
