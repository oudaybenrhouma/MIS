import { Link } from "react-router-dom";
import { ClipboardList, Trash2, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { useQuote } from "@/state/quote";
import { getBrand } from "@/data/brands";
import { getProduct } from "@/services/catalog";
import { PageHeader } from "@/components/PageHeader";
import { ProductImage } from "@/components/ProductImage";
import { QuantityStepper } from "@/components/QuantityStepper";
import { CategoryChip } from "@/components/ProductCard";
import { Arrow, WhatsAppButton, usePageTitle } from "@/components/common";

export default function QuoteList() {
  const { t, tr, n } = useI18n();
  const quote = useQuote();
  usePageTitle(t("quote.title"));

  const waText = [
    t("quote.waIntro"),
    "",
    ...quote.items.map((i, idx) => {
      const p = getProduct(i.productId);
      return p ? `${idx + 1}. ${p.ref} — ${tr(p.name)} — ${t("quote.waQty")}: ${i.qty}${i.note ? ` (${i.note})` : ""}` : "";
    }),
  ].join("\n");

  const crumbs = [{ label: t("nav.home"), to: "/" }, { label: t("quote.kicker") }];

  if (quote.lineCount === 0) {
    return (
      <>
        <PageHeader crumbs={crumbs} kicker={t("quote.kicker")} title={t("quote.title")} intro={t("quote.intro")} />
        <section className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8">
          <div className="bp-grid-light flex flex-col items-center border border-dashed border-ink/30 bg-white/70 px-6 py-20 text-center">
            <ClipboardList className="size-14 text-mist" strokeWidth={1.2} />
            <h2 className="display mt-6 text-3xl">{t("quote.emptyTitle")}</h2>
            <p className="mt-3 max-w-md text-ink/65">{t("quote.emptyText")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/catalogue" className="btn btn-red">
                {t("quote.browse")} <Arrow />
              </Link>
              <Link to="/quote/request" className="btn btn-line">
                {t("nav.requestQuote")}
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader crumbs={crumbs} kicker={t("quote.kicker")} title={t("quote.title")} intro={t("quote.intro")} />
      <section className="mx-auto grid max-w-[1360px] gap-10 px-5 py-10 sm:px-8 md:py-14 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="label hidden grid-cols-[1fr_auto] border-b-2 border-ink pb-3 text-mist sm:grid">
            <span>{t("quote.colItem")}</span>
            <span className="pe-12">{t("quote.colQty")}</span>
          </div>
          <ul className="divide-y divide-ink/15">
            {quote.items.map((item) => {
              const p = getProduct(item.productId);
              if (!p) return null;
              const brand = getBrand(p.brand);
              return (
                <li key={item.productId} className="py-5">
                  <div className="flex gap-4">
                    <Link to={`/product/${p.id}`} className="hidden w-28 shrink-0 sm:block">
                      <ProductImage product={p} className="aspect-square" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="label text-signal">{brand?.name}</span>
                        <CategoryChip slug={p.category} />
                      </div>
                      <Link to={`/product/${p.id}`} className="mt-1 block text-lg leading-snug font-semibold hover:text-signal">
                        {tr(p.name)}
                      </Link>
                      <p className="mono text-xs text-mist">{p.ref}</p>
                      <input
                        value={item.note}
                        onChange={(e) => quote.setNote(p.id, e.target.value)}
                        placeholder={t("quote.notePlaceholder")}
                        maxLength={240}
                        className="field mt-3 !py-2 text-sm"
                        aria-label={t("quote.notePlaceholder")}
                      />
                    </div>
                    <div className="flex flex-col items-end justify-between gap-3">
                      <button
                        onClick={() => quote.remove(p.id)}
                        className="flex size-9 items-center justify-center text-mist transition-colors hover:bg-signal hover:text-white"
                        aria-label={`${t("common.remove")}: ${tr(p.name)}`}
                      >
                        <X className="size-4" />
                      </button>
                      <QuantityStepper value={item.qty} onChange={(q) => quote.setQty(p.id, q)} size="sm" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink pt-4">
            <Link to="/catalogue" className="btn btn-line btn-sm">
              {t("quote.keepBrowsing")}
            </Link>
            <button
              onClick={() => window.confirm(t("quote.confirmClear")) && quote.clear()}
              className="flex items-center gap-2 text-sm text-mist transition-colors hover:text-signal"
            >
              <Trash2 className="size-4" /> {t("quote.clear")}
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border-[1.5px] border-ink bg-white p-6 shadow-[6px_6px_0_var(--color-signal)] rtl:shadow-[-6px_6px_0_var(--color-signal)]">
            <p className="label text-signal">{t("quote.summary")}</p>
            <dl className="mt-5 space-y-3 border-y border-dashed border-ink/30 py-5">
              <div className="flex items-baseline justify-between">
                <dt className="text-ink/65">{t("quote.lines")}</dt>
                <dd className="display text-3xl" style={{ fontFamily: "Archivo, sans-serif" }}>{n(quote.lineCount)}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-ink/65">{t("quote.units")}</dt>
                <dd className="display text-3xl" style={{ fontFamily: "Archivo, sans-serif" }}>{n(quote.totalUnits)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-ink/60">{t("quote.priceNote")}</p>
            <Link to="/quote/request" className="btn btn-red mt-6 w-full">
              {t("quote.proceed")} <Arrow />
            </Link>
            <WhatsAppButton text={waText} label={t("quote.sendWhatsapp")} className="btn btn-line mt-3 w-full" />
          </div>
        </aside>
      </section>
    </>
  );
}
