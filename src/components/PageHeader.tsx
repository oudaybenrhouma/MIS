import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items, dark = false }: { items: Crumb[]; dark?: boolean }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("nav.breadcrumb")} className="label flex flex-wrap items-center gap-1.5">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {c.to ? (
            <Link to={c.to} className={dark ? "text-white/60 hover:text-white" : "text-mist hover:text-ink"}>
              {c.label}
            </Link>
          ) : (
            <span aria-current="page" className={dark ? "text-white" : "text-ink"}>
              {c.label}
            </span>
          )}
          {i < items.length - 1 && <ChevronRight className="size-3 opacity-50 rtl:rotate-180" />}
        </span>
      ))}
    </nav>
  );
}

/** Dark, blueprint-style page header shared by the inner pages. */
export function PageHeader({
  kicker,
  title,
  intro,
  crumbs,
  aside,
  children,
}: {
  kicker?: string;
  title: ReactNode;
  intro?: string;
  crumbs?: Crumb[];
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="bp-grid-dark relative overflow-hidden bg-ink text-white">
      <div className="slash pointer-events-none absolute inset-y-0 end-0 hidden w-1/5 bg-signal md:block" aria-hidden />
      <div className="relative mx-auto max-w-[1360px] px-5 pt-8 pb-12 sm:px-8 md:pb-16">
        {crumbs && <Breadcrumbs items={crumbs} dark />}
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            {kicker && (
              <p className="label mb-4 flex items-center gap-3 text-signal">
                <span className="h-px w-8 bg-signal" /> {kicker}
              </p>
            )}
            <h1 className="display text-4xl sm:text-5xl md:text-6xl">{title}</h1>
            {intro && <p className="mt-5 max-w-2xl text-base text-white/70 md:text-lg">{intro}</p>}
          </div>
          {aside && <div className="relative z-10 shrink-0">{aside}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

export function SectionHead({
  index,
  kicker,
  title,
  intro,
  dark = false,
  action,
}: {
  index?: string;
  kicker: string;
  title: string;
  intro?: string;
  dark?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className={`label mb-4 flex items-center gap-3 ${dark ? "text-signal" : "text-signal"}`}>
          {index && <span className="mono">{index}</span>}
          <span className="h-px w-8 bg-current" /> {kicker}
        </p>
        <h2 className="display text-3xl sm:text-4xl md:text-5xl">{title}</h2>
        {intro && <p className={`mt-4 text-base md:text-lg ${dark ? "text-white/65" : "text-ink/65"}`}>{intro}</p>}
      </div>
      {action}
    </div>
  );
}
