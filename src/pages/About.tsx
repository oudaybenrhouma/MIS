import { Link } from "react-router-dom";
import { Compass, Eye, MapPinned, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Arrow, usePageTitle } from "@/components/common";

export default function About() {
  const { t, tr } = useI18n();
  usePageTitle(t("about.kicker"));

  const values = [
    { icon: Compass, t: t("about.v1t"), d: t("about.v1d") },
    { icon: ShieldCheck, t: t("about.v2t"), d: t("about.v2d") },
    { icon: Eye, t: t("about.v3t"), d: t("about.v3d") },
    { icon: MapPinned, t: t("about.v4t"), d: t("about.v4d") },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("about.kicker") }]}
        kicker={t("about.kicker")}
        title={t("about.title")}
        intro={t("about.intro")}
      />

      <section className="mx-auto grid max-w-[1360px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-12 md:py-24">
        <Reveal className="md:col-span-4">
          <p className="label flex items-center gap-3 text-signal">
            <span className="mono">01</span>
            <span className="h-px w-8 bg-current" /> {t("about.whatTitle")}
          </p>
        </Reveal>
        <Reveal className="md:col-span-8" delay={100}>
          <p className="display text-2xl sm:text-3xl md:text-4xl" style={{ lineHeight: 1.3, letterSpacing: "-0.02em", fontWeight: 700 }}>
            {t("about.whatText")}
          </p>
        </Reveal>
      </section>

      <section className="bp-grid-dark bg-ink text-white">
        <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 md:py-24">
          <Reveal>
            <p className="label mb-10 flex items-center gap-3 text-signal">
              <span className="mono">02</span>
              <span className="h-px w-8 bg-current" /> {t("about.valuesTitle")}
            </p>
          </Reveal>
          <div className="grid gap-px border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.t} delay={i * 80} className="bg-ink">
                <div className="h-full bg-ink p-7">
                  <v.icon className="size-8 text-signal" strokeWidth={1.5} />
                  <h3 className="display mt-10 text-2xl">{v.t}</h3>
                  <p className="mt-3 text-sm text-white/65">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 md:py-24">
        <Reveal>
          <p className="label mb-3 flex items-center gap-3 text-signal">
            <span className="mono">03</span>
            <span className="h-px w-8 bg-current" /> {t("about.portfolioTitle")}
          </p>
          <p className="mb-10 max-w-2xl text-lg text-ink/70">{t("about.portfolioText")}</p>
        </Reveal>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="label mb-3 text-ink">{t("common.brands")}</h3>
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  to={`/brand/${b.slug}`}
                  className="border-[1.5px] border-ink bg-white px-4 py-2 text-lg font-bold transition-colors hover:bg-ink hover:text-white"
                  style={{ fontFamily: "Archivo, sans-serif" }}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="label mb-3 text-ink">{t("common.categories")}</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/category/${c.slug}`} className="flex items-center gap-3 border border-ink/15 bg-white p-3 text-sm font-semibold transition-colors hover:border-signal hover:text-signal">
                    <CategoryIcon name={c.icon} className="size-5 shrink-0" /> {tr(c.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 pb-16 sm:px-8 md:pb-24">
        <div className="bp-grid-light border-2 border-dashed border-ink/30 bg-white/60 p-8 md:p-12">
          <p className="label text-mist">{t("about.profileTitle")}</p>
          <p className="mt-3 max-w-2xl text-lg text-ink/70">{t("about.profileText")}</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {["—", "—", "—"].map((_, i) => (
              <div key={i} className="mono border border-dashed border-ink/30 px-3 py-4 text-xs text-mist">
                {t("about.profilePlaceholder")}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-signal text-white">
        <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
          <h2 className="display text-3xl md:text-4xl">{t("about.ctaTitle")}</h2>
          <Link to="/quote/request" className="btn btn-ink">
            {t("nav.requestQuote")} <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
