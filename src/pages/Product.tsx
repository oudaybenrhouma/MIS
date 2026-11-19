import { Link, useParams } from "react-router-dom";
import { FileText, Info, MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n";
import { getBrand } from "@/data/brands";
import { getCategory } from "@/data/categories";
import { getProduct, getRelated } from "@/services/catalog";
import { whatsappLink } from "@/config/site";
import { Breadcrumbs } from "@/components/PageHeader";
import { ProductImage } from "@/components/ProductImage";
import { AddToQuote } from "@/components/AddToQuote";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Arrow, usePageTitle } from "@/components/common";
import NotFound from "./NotFound";

export default function ProductPage() {
  const { id = "" } = useParams();
  const { t, tr } = useI18n();
  const product = getProduct(id);
  usePageTitle(product ? tr(product.name) : t("product.notFound"));

  if (!product) return <NotFound title={t("product.notFound")} />;

  const brand = getBrand(product.brand);
  const cat = getCategory(product.category);
  const related = getRelated(product, 4);
  const description = tr(product.description);

  const rows: [string, React.ReactNode][] = [
    [t("product.rowBrand"), <Link key="b" to={`/brand/${product.brand}`} className="font-semibold hover:text-signal">{brand?.name}</Link>],
    [t("product.rowCategory"), <Link key="c" to={`/category/${product.category}`} className="font-semibold hover:text-signal">{cat ? tr(cat.name) : ""}</Link>],
    [t("product.rowRef"), <span key="r" className="mono font-semibold">{product.ref}</span>],
    ...product.specs.map((s): [string, React.ReactNode] => [tr(s.label), tr(s.value)]),
    [t("product.rowStatus"), product.placeholder ? t("product.rowStatusV") : t("product.rowStatusR")],
  ];

  return (
    <>
      <div className="border-b border-ink/10 bg-bone">
        <div className="mx-auto max-w-[1360px] px-5 py-4 sm:px-8">
          <Breadcrumbs
            items={[
              { label: t("nav.home"), to: "/" },
              { label: t("nav.catalogue"), to: "/catalogue" },
              ...(cat ? [{ label: tr(cat.name), to: `/category/${cat.slug}` }] : []),
              { label: product.ref },
            ]}
          />
        </div>
      </div>

      <section className="mx-auto grid max-w-[1360px] gap-10 px-5 py-10 sm:px-8 md:py-14 lg:grid-cols-2 lg:gap-16">
        {/* Media */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative border border-ink/15">
            <ProductImage product={product} className="aspect-square" large />
            {product.placeholder && (
              <span className="label absolute top-3 start-3 bg-ink px-2 py-1 text-white">{t("common.placeholderBadge")}</span>
            )}
          </div>
          <p className="mono mt-3 text-xs text-mist">{t("product.sample")}</p>
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/brand/${product.brand}`} className="label bg-signal px-2.5 py-1 text-white transition-colors hover:bg-ink">
              {brand?.name}
            </Link>
            {cat && (
              <Link to={`/category/${cat.slug}`} className="label flex items-center gap-1.5 border border-ink/25 px-2.5 py-1 hover:border-ink">
                <CategoryIcon name={cat.icon} className="size-3.5" /> {tr(cat.name)}
              </Link>
            )}
          </div>
          <h1 className="display mt-5 text-3xl sm:text-4xl md:text-5xl">{tr(product.name)}</h1>
          <p className="mono mt-3 text-sm text-mist">
            {t("product.ref")}: <span className="font-semibold text-ink">{product.ref}</span>
          </p>

          {description && <p className="mt-6 max-w-xl text-lg text-ink/70">{description}</p>}

          {product.placeholder && (
            <p className="mt-4 flex items-start gap-2 border-s-4 border-ink/30 bg-ink/5 p-3 text-sm text-ink/70">
              <Info className="mt-0.5 size-4 shrink-0" /> {t("product.placeholderNote")}
            </p>
          )}

          {/* Quote box */}
          <div className="mt-8 border-[1.5px] border-ink bg-white p-5 shadow-[6px_6px_0_var(--color-signal)] rtl:shadow-[-6px_6px_0_var(--color-signal)] sm:p-6">
            <p className="label text-signal">{t("product.priceTitle")}</p>
            <p className="mt-2 mb-5 text-sm text-ink/65">{t("product.priceText")}</p>
            <AddToQuote product={product} variant="full" />
            <a
              href={whatsappLink(t("product.waText", { name: tr(product.name), ref: product.ref }))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink/80 hover:text-signal"
            >
              <MessageCircle className="size-4" /> {t("product.askWhatsapp")} <Arrow className="size-3.5" />
            </a>
          </div>

          {/* Data table */}
          <div className="mt-10">
            <h2 className="label mb-3 text-ink">{t("product.specs")}</h2>
            <dl className="border-t-2 border-ink">
              {rows.map(([k, v], i) => (
                <div key={i} className="grid grid-cols-[40%_1fr] gap-4 border-b border-ink/15 py-3 text-sm">
                  <dt className="text-ink/55">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {product.specs.length === 0 && <p className="mt-3 text-sm text-mist">{t("product.specsEmpty")}</p>}
          </div>

          <div className="mt-10">
            <h2 className="label mb-3 text-ink">{t("product.docs")}</h2>
            <div className="flex items-center gap-3 border border-dashed border-ink/30 p-4 text-sm text-ink/55">
              <FileText className="size-5 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="font-semibold text-ink/70">{t("product.docItem")}</p>
                <p>{t("product.docsEmpty")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink/15 bg-bone">
          <div className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 md:py-20">
            <Reveal>
              <h2 className="display mb-8 text-2xl md:text-4xl">{t("product.related")}</h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
