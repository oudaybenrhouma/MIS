import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, Coins, Globe, MessageCircle, Phone, Search } from "lucide-react";
import { useI18n } from "@/i18n";
import { useQuote } from "@/state/quote";
import { categories } from "@/data/categories";
import { brands } from "@/data/brands";
import { getProduct, brandsInCategory, countProducts, featuredProducts } from "@/services/catalog";
import { Reveal } from "@/components/Reveal";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProductCard } from "@/components/ProductCard";
import { SectionHead } from "@/components/PageHeader";
import { Arrow, WhatsAppButton, usePageTitle } from "@/components/common";

/* ───────────────────────── Hero ───────────────────────── */

function QuoteSlip() {
  const { t, tr, n } = useI18n();
  const { items, lineCount, totalUnits } = useQuote();
  const shown = items.slice(0, 4);

  return (
    <div className="relative">
      <div className="absolute -inset-2 translate-x-3 translate-y-3 border border-white/25 rtl:-translate-x-3" aria-hidden />
      <div className="relative bg-paper text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
        {/* perforated top edge */}
        <div
          className="h-3 w-full bg-ink"
          style={{
            backgroundImage: "radial-gradient(circle at 8px 0, var(--color-paper) 5px, transparent 5.5px)",
            backgroundSize: "16px 12px",
          }}
          aria-hidden
        />
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label text-signal">{t("home.slip.title")}</p>
              <p className="mono mt-1 text-xs text-mist">
                {t("home.slip.no")} MIS-RFQ-<span className="text-ink/30">······</span>
              </p>
            </div>
            <span className="label flex items-center gap-1.5 border border-ink/30 px-2 py-1">
              <span className="size-1.5 animate-pulse bg-signal" /> {t("home.slip.pending")}
            </span>
          </div>

          <div className="mt-5 min-h-[184px] border-y border-dashed border-ink/30 py-4">
            {lineCount === 0 ? (
              <div>
                <p className="font-semibold">{t("home.slip.empty")}</p>
                <p className="mt-1 text-sm text-ink/60">{t("home.slip.emptyHint")}</p>
                <ol className="mt-5 space-y-2.5 text-sm">
                  {[t("home.slip.s1"), t("home.slip.s2"), t("home.slip.s3")].map((s, i) => (
                    <li key={s} className="flex items-center gap-3">
                      <span className="mono flex size-6 shrink-0 items-center justify-center border border-ink/40 text-[11px]">
                        {i + 1}
                      </span>
                      <span className="flex-1 border-b border-dotted border-ink/25 pb-1">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {shown.map((it) => {
                  const p = getProduct(it.productId);
                  if (!p) return null;
                  return (
                    <li key={it.productId} className="flex items-baseline gap-3 text-sm">
                      <span className="mono shrink-0 text-[11px] text-mist">{p.ref}</span>
                      <span className="flex-1 truncate border-b border-dotted border-ink/25 pb-0.5">{tr(p.name)}</span>
                      <span className="mono shrink-0 font-semibold">×{n(it.qty)}</span>
                    </li>
                  );
                })}
                {lineCount > shown.length && (
                  <li className="mono text-xs text-mist">{t("home.slip.more", { n: lineCount - shown.length })}</li>
                )}
              </ul>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="mono text-xs text-mist">
              {t("home.slip.lines", { n: lineCount })} · Σ {n(totalUnits)}
            </p>
            <Link to={lineCount ? "/quote" : "/catalogue"} className="btn btn-red btn-sm">
              {lineCount ? t("home.slip.open") : t("home.slip.start")} <Arrow className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const heroRef = useRef<HTMLElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const hero = heroRef.current;
    const marker = markerRef.current;
    if (!hero || !marker) return;
    const x = Math.max(0, e.clientX - hero.getBoundingClientRect().left);
    marker.classList.remove("ruler-idle");
    marker.style.left = `${x}px`;
    if (readoutRef.current) readoutRef.current.textContent = `${(x / 8).toFixed(1).padStart(6, "0")} mm`;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/catalogue?q=${encodeURIComponent(q.trim())}` : "/catalogue");
  };

  return (
    <section ref={heroRef} onPointerMove={onMove} className="bp-grid-dark relative overflow-hidden bg-ink text-white">
      <div className="slash pointer-events-none absolute inset-y-0 end-0 hidden w-[44%] bg-signal lg:block" aria-hidden />

      {/* pointer-tracked measuring line */}
      <div
        ref={markerRef}
        className="ruler-idle pointer-events-none absolute inset-y-0 z-0 hidden w-px bg-signal/50 md:block"
        style={{ left: "30%" }}
        aria-hidden
      >
        <span
          ref={readoutRef}
          dir="ltr"
          className="mono absolute bottom-16 start-2 bg-signal px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-white"
        >
          000.0 mm
        </span>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1360px] items-center gap-14 px-5 pt-14 pb-32 sm:px-8 lg:grid-cols-12 lg:pt-24 lg:pb-40">
        <div className="lg:col-span-7">
          <p className="label mb-8 flex items-center gap-3 text-white/80">
            <span className="h-px w-10 bg-signal" /> {t("home.hero.eyebrow")}
          </p>
          <h1 className="display text-[2.9rem] sm:text-7xl xl:text-[6.5rem]">
            <span className="block">{t("home.hero.l1")}</span>
            <span className="block">{t("home.hero.l2")}</span>
            <span className="relative mt-1 inline-block text-signal">
              {t("home.hero.l3")}
              <span
                className="absolute inset-x-0 -bottom-1 h-2 border-x-2 border-signal after:absolute after:inset-x-0 after:top-1/2 after:h-0.5 after:bg-signal"
                aria-hidden
              />
            </span>
          </h1>
          <p className="mt-10 max-w-xl text-base text-white/75 sm:text-lg">{t("home.hero.sub")}</p>

          <form onSubmit={submit} role="search" className="mt-8 flex max-w-xl border-[1.5px] border-white/40 bg-white/5 backdrop-blur-sm transition-colors focus-within:border-signal">
            <label className="relative flex-1">
              <span className="sr-only">{t("nav.search")}</span>
              <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("home.hero.searchPlaceholder")}
                className="h-14 w-full bg-transparent ps-11 pe-3 text-sm text-white outline-none placeholder:text-white/45 sm:text-base"
              />
            </label>
            <button className="btn btn-red m-1 !px-5" type="submit">
              {t("home.hero.searchCta")}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="label me-1 text-white/50">{t("home.hero.popular")}</span>
            {brands.map((b) => (
              <Link
                key={b.slug}
                to={`/brand/${b.slug}`}
                className="border border-white/25 px-2.5 py-1 text-xs font-semibold text-white/80 transition-colors hover:border-signal hover:bg-signal hover:text-white"
              >
                {b.name}
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/catalogue" className="btn btn-red">
              {t("home.hero.browse")} <Arrow />
            </Link>
            <Link to="/quote/request" className="btn btn-line-light">
              {t("nav.requestQuote")}
            </Link>
          </div>
        </div>

        <div className="relative lg:col-span-5 lg:ps-6">
          <QuoteSlip />
        </div>
      </div>

      {/* Ruler */}
      <div className="absolute inset-x-0 bottom-0 h-14" dir="ltr" aria-hidden>
        <div className="ruler-ticks absolute inset-0" />
        <div className="absolute inset-x-0 bottom-1 flex overflow-hidden">
          {Array.from({ length: 36 }).map((_, i) => (
            <span key={i} className="mono w-20 shrink-0 ps-1 text-[9px] text-white/50">
              {i * 10}
            </span>
          ))}
        </div>
        <span className="label absolute start-2 bottom-5 hidden text-white/40 sm:block" dir="auto">
          {t("home.hero.rulerLabel")}
        </span>
      </div>
    </section>
  );
}

/* ───────────────────────── Brand marquee ───────────────────────── */

function BrandMarquee() {
  const { t } = useI18n();
  const row = [...brands, ...brands];
  return (
    <section className="marquee overflow-hidden bg-signal text-white" aria-label={t("home.marquee")}>
      <div dir="ltr" className="marquee-track flex">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {row.map((b, i) => (
              <li key={`${b.slug}-${i}`} className="flex items-center">
                <Link
                  to={`/brand/${b.slug}`}
                  tabIndex={dup === 1 ? -1 : 0}
                  className="display px-8 py-5 text-3xl whitespace-nowrap transition-colors hover:text-ink md:text-5xl"
                  style={{ fontFamily: "Archivo, sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
                >
                  {b.name}
                </Link>
                <span className="size-2 rotate-45 bg-ink" aria-hidden />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Category index ───────────────────────── */

function CategoryIndex() {
  const { t, tr, n } = useI18n();
  return (
    <section className="mx-auto max-w-[1360px] px-5 py-20 sm:px-8 md:py-28">
      <Reveal>
        <SectionHead
          index="01"
          kicker={t("home.cats.kicker")}
          title={t("home.cats.title")}
          intro={t("home.cats.intro")}
          action={
            <Link to="/categories" className="btn btn-line self-start md:self-auto">
              {t("common.viewAll")} <Arrow />
            </Link>
          }
        />
      </Reveal>
      <ul className="border-b border-ink/20">
        {categories.map((c, i) => {
          const bs = brandsInCategory(c.slug);
          return (
            <li key={c.slug}>
              <Reveal delay={(i % 4) * 60}>
                <Link
                  to={`/category/${c.slug}`}
                  className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 overflow-hidden border-t border-ink/20 px-2 py-6 transition-colors duration-500 hover:text-white sm:gap-x-8 sm:px-5 md:grid-cols-[88px_minmax(0,1.3fr)_minmax(0,1.5fr)_auto_auto] md:py-7"
                >
                  <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100 rtl:origin-right" aria-hidden />
                  <span className="absolute inset-y-0 start-0 -z-10 w-1.5 origin-top scale-y-0 bg-signal transition-transform duration-500 group-hover:scale-y-100" aria-hidden />
                  <span className="mono text-xs text-mist transition-colors group-hover:text-signal md:text-sm">
                    {String(i + 1).padStart(2, "0")} · {c.code}
                  </span>
                  <span>
                    <span className="display block text-2xl sm:text-3xl md:text-4xl">{tr(c.name)}</span>
                    <span className="mt-1 block text-sm text-ink/60 transition-colors group-hover:text-white/70 md:hidden">
                      {tr(c.short)}
                    </span>
                  </span>
                  <span className="hidden md:block">
                    <span className="block text-sm text-ink/65 transition-colors group-hover:text-white/75">{tr(c.short)}</span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {bs.map((b) => (
                        <span key={b.slug} className="border border-current/30 px-1.5 py-0.5 text-[11px] font-semibold opacity-80">
                          {b.name}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="mono hidden text-sm text-mist transition-colors group-hover:text-white/70 md:block">
                    {t("common.nProducts", { n: n(countProducts({ category: c.slug })) })}
                  </span>
                  <span className="flex items-center gap-4">
                    <CategoryIcon name={c.icon} className="hidden size-9 text-ink/70 transition-colors group-hover:text-signal sm:block" />
                    <span className="flex size-10 items-center justify-center border border-current/30 transition-all group-hover:border-signal group-hover:bg-signal group-hover:text-white">
                      <Arrow />
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────────────────────── How it works ───────────────────────── */

function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    [t("home.how.s1t"), t("home.how.s1d")],
    [t("home.how.s2t"), t("home.how.s2d")],
    [t("home.how.s3t"), t("home.how.s3d")],
    [t("home.how.s4t"), t("home.how.s4d")],
  ];
  return (
    <section className="bg-bone">
      <div className="bp-grid-light">
        <div className="mx-auto max-w-[1360px] px-5 py-20 sm:px-8 md:py-28">
          <Reveal>
            <SectionHead index="02" kicker={t("home.how.kicker")} title={t("home.how.title")} />
          </Reveal>
          <ol className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {steps.map(([title, body], i) => (
              <li key={title} className="relative lg:pe-8">
                <Reveal delay={i * 110}>
                  <div className="relative mb-6 flex items-end gap-4">
                    <span className="outline-num text-8xl leading-none text-ink/80 sm:text-9xl">{i + 1}</span>
                    {/* measure line with end caps */}
                    <span className="mb-4 hidden h-3 flex-1 border-x border-ink/50 lg:block rtl:rotate-0" aria-hidden>
                      <span className="block h-1/2 border-b border-ink/50" />
                    </span>
                  </div>
                  <h3 className="display text-2xl">{title}</h3>
                  <p className="mt-3 text-ink/65">{body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Featured ───────────────────────── */

function Featured() {
  const { t } = useI18n();
  const list = featuredProducts(8);
  return (
    <section className="mx-auto max-w-[1360px] px-5 py-20 sm:px-8 md:py-28">
      <Reveal>
        <SectionHead
          index="03"
          kicker={t("home.featured.kicker")}
          title={t("home.featured.title")}
          intro={t("home.featured.intro")}
          action={
            <Link to="/catalogue" className="btn btn-ink self-start md:self-auto">
              {t("home.featured.cta")} <Arrow />
            </Link>
          }
        />
      </Reveal>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {list.map((p, i) => (
          <Reveal key={p.id} delay={(i % 4) * 70}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Brands ───────────────────────── */

function BrandsSection() {
  const { t, tr, n } = useI18n();
  return (
    <section className="bp-grid-dark bg-ink text-white">
      <div className="mx-auto max-w-[1360px] px-5 py-20 sm:px-8 md:py-28">
        <Reveal>
          <SectionHead
            index="04"
            kicker={t("home.brands.kicker")}
            title={t("home.brands.title")}
            intro={t("home.brands.intro")}
            dark
            action={
              <Link to="/brands" className="btn btn-line-light self-start md:self-auto">
                {t("home.brands.cta")} <Arrow />
              </Link>
            }
          />
        </Reveal>
        <div className="grid grid-cols-1 gap-px border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((b, i) => (
            <Reveal key={b.slug} delay={(i % 4) * 60} className="bg-ink">
              <Link
                to={`/brand/${b.slug}`}
                className="group relative flex h-full min-h-56 flex-col justify-between overflow-hidden bg-ink p-6 transition-colors hover:bg-graphite"
              >
                <span
                  className="slash absolute -end-8 -top-8 size-28 origin-top-right scale-0 bg-signal transition-transform duration-500 group-hover:scale-100"
                  aria-hidden
                />
                <span className="mono text-xs text-white/40">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <span
                    className="block text-5xl font-extrabold tracking-tight sm:text-6xl"
                    style={{ fontFamily: "Archivo, sans-serif", letterSpacing: "-0.04em" }}
                  >
                    {b.name}
                  </span>
                  <span className="mt-2 block text-sm text-white/60">{tr(b.focus)}</span>
                  <span className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                    <span className="mono text-xs text-white/50">{t("common.nProducts", { n: n(countProducts({ brand: b.slug })) })}</span>
                    <span className="flex gap-1.5">
                      {b.categories.map((slug) => {
                        const c = categories.find((x) => x.slug === slug)!;
                        return <CategoryIcon key={slug} name={c.icon} className="size-4 text-white/60 group-hover:text-signal" />;
                      })}
                    </span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
          <div className="hidden bg-ink lg:block" />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Libya-first ───────────────────────── */

function LibyaStrip() {
  const { t } = useI18n();
  const cells = [
    { icon: Globe, t: t("home.libya.c1t"), d: t("home.libya.c1d") },
    { icon: Phone, t: t("home.libya.c2t"), d: t("home.libya.c2d") },
    { icon: Coins, t: t("home.libya.c3t"), d: t("home.libya.c3d") },
    { icon: MessageCircle, t: t("home.libya.c4t"), d: t("home.libya.c4d") },
  ];
  return (
    <section className="mx-auto max-w-[1360px] px-5 py-20 sm:px-8 md:py-28">
      <Reveal>
        <SectionHead index="05" kicker={t("home.libya.kicker")} title={t("home.libya.title")} />
      </Reveal>
      <div className="grid gap-px border border-ink/20 bg-ink/20 sm:grid-cols-2 lg:grid-cols-4">
        {cells.map((c, i) => (
          <Reveal key={c.t} delay={i * 80} className="bg-paper">
            <div className="h-full bg-paper p-7">
              <c.icon className="size-8 text-signal" strokeWidth={1.5} />
              <h3 className="display mt-8 text-xl">{c.t}</h3>
              <p className="mt-2 text-sm text-ink/65">{c.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── CTA ───────────────────────── */

function FinalCta() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-signal text-white">
      <div className="slash pointer-events-none absolute inset-y-0 start-0 w-1/3 bg-signal-deep" aria-hidden />
      <div className="relative mx-auto flex max-w-[1360px] flex-col gap-10 px-5 py-20 sm:px-8 md:py-28 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <ClipboardList className="mb-6 size-10" strokeWidth={1.5} />
          <h2 className="display text-4xl sm:text-5xl md:text-6xl">{t("home.cta.title")}</h2>
          <p className="mt-6 max-w-xl text-lg text-white/85">{t("home.cta.sub")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/quote/request" className="btn btn-ink">
            {t("home.cta.primary")} <Arrow />
          </Link>
          <Link to="/catalogue" className="btn btn-line-light">
            {t("home.cta.secondary")}
          </Link>
          <WhatsAppButton className="btn btn-line-light" />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  usePageTitle();
  return (
    <>
      <Hero />
      <BrandMarquee />
      <CategoryIndex />
      <HowItWorks />
      <Featured />
      <BrandsSection />
      <LibyaStrip />
      <FinalCta />
    </>
  );
}
