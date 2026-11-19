import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/i18n";
import { categories, getCategory } from "@/data/categories";
import { brandsInCategory, countProducts } from "@/services/catalog";
import { PageHeader } from "@/components/PageHeader";
import { ProductListing } from "@/components/ProductListing";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Reveal } from "@/components/Reveal";
import { Arrow, usePageTitle } from "@/components/common";
import NotFound from "./NotFound";

export function CategoriesIndex() {
  const { t, tr, n } = useI18n();
  usePageTitle(t("category.indexTitle"));
  return (
    <>
      <PageHeader
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("category.indexTitle") }]}
        kicker={t("nav.catalogue")}
        title={t("category.indexTitle")}
        intro={t("category.indexIntro")}
      />
      <section className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 md:py-20">
        <div className="grid gap-px border border-ink/20 bg-ink/20 md:grid-cols-2">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 2) * 80} className="bg-paper">
              <Link
                to={`/category/${c.slug}`}
                className="group relative flex h-full flex-col gap-8 overflow-hidden bg-paper p-7 transition-colors duration-500 hover:bg-ink hover:text-white sm:p-9"
              >
                <div className="flex items-start justify-between">
                  <span className="mono text-sm text-mist">{String(i + 1).padStart(2, "0")} / {c.code}</span>
                  <CategoryIcon name={c.icon} className="size-12 text-signal" />
                </div>
                <div>
                  <h2 className="display text-3xl md:text-4xl">{tr(c.name)}</h2>
                  <p className="mt-3 max-w-md text-ink/65 transition-colors group-hover:text-white/70">{tr(c.description)}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-current/20 pt-4">
                  <span className="flex flex-wrap gap-1.5">
                    {brandsInCategory(c.slug).map((b) => (
                      <span key={b.slug} className="border border-current/30 px-1.5 py-0.5 text-[11px] font-semibold opacity-80">
                        {b.name}
                      </span>
                    ))}
                  </span>
                  <span className="mono flex items-center gap-3 text-xs">
                    {t("common.nProducts", { n: n(countProducts({ category: c.slug })) })} <Arrow />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

export function CategoryPage() {
  const { slug = "" } = useParams();
  const { t, tr, n } = useI18n();
  const cat = getCategory(slug);
  usePageTitle(cat ? tr(cat.name) : t("category.notFound"));
  if (!cat) return <NotFound title={t("category.notFound")} />;

  const bs = brandsInCategory(cat.slug);
  const others = categories.filter((c) => c.slug !== cat.slug);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: t("nav.home"), to: "/" },
          { label: t("category.indexTitle"), to: "/categories" },
          { label: tr(cat.name) },
        ]}
        kicker={`${t("category.kicker")} · ${cat.code}`}
        title={tr(cat.name)}
        intro={tr(cat.description)}
        aside={
          <div className="flex items-end gap-5 text-white">
            <CategoryIcon name={cat.icon} className="size-16 text-white md:size-24" />
            <div>
              <p className="display text-5xl md:text-7xl" style={{ fontFamily: "Archivo, sans-serif" }}>
                {n(countProducts({ category: cat.slug }))}
              </p>
              <p className="label text-white/70">{t("common.products")}</p>
            </div>
          </div>
        }
      />

      <section className="mx-auto max-w-[1360px] px-5 pt-12 sm:px-8">
        <p className="label mb-4 text-mist">{t("category.brandsIn")}</p>
        <div className="flex flex-wrap gap-3">
          {bs.map((b) => (
            <Link
              key={b.slug}
              to={`/brand/${b.slug}`}
              className="group flex items-center gap-3 border-[1.5px] border-ink bg-white px-4 py-3 transition-colors hover:bg-ink hover:text-white"
            >
              <span className="display text-xl" style={{ fontFamily: "Archivo, sans-serif" }}>{b.name}</span>
              <Arrow className="size-4 text-signal" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 md:py-16">
        <h2 className="display mb-8 text-2xl md:text-3xl">{t("category.productsIn")}</h2>
        <ProductListing fixed={{ category: cat.slug }} />
      </section>

      <section className="border-t border-ink/15 bg-bone">
        <div className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8">
          <p className="label mb-5 text-mist">{t("category.otherCategories")}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {others.map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="flex items-center gap-3 border border-ink/15 bg-white p-3 text-sm font-semibold transition-colors hover:border-signal hover:text-signal"
              >
                <CategoryIcon name={c.icon} className="size-5 shrink-0" />
                <span className="leading-tight">{tr(c.name)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
