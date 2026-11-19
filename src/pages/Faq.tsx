import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Arrow, WhatsAppButton, usePageTitle } from "@/components/common";

export default function Faq() {
  const { t, raw } = useI18n();
  usePageTitle(t("faq.kicker"));
  const items = raw<{ q: string; a: string }[]>("faq.items");
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageHeader
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("faq.kicker") }]}
        kicker={t("faq.kicker")}
        title={t("faq.title")}
        intro={t("faq.intro")}
      />
      <section className="mx-auto grid max-w-[1360px] gap-12 px-5 py-12 sm:px-8 md:py-20 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ul className="border-b-2 border-ink">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <li key={i} className="border-t-2 border-ink">
                <h2>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    className="group flex w-full items-center gap-4 py-5 text-start transition-colors hover:text-signal"
                  >
                    <span className="mono w-8 shrink-0 text-xs text-mist">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-lg font-bold md:text-xl">{it.q}</span>
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center border-[1.5px] border-current transition-all ${
                        isOpen ? "rotate-45 bg-signal text-white !border-signal" : ""
                      }`}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h2>
                <div
                  id={`faq-${i}`}
                  role="region"
                  className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 ps-12 text-ink/70 md:text-lg">{it.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="bg-ink p-7 text-white">
            <h2 className="display text-2xl">{t("faq.stillTitle")}</h2>
            <p className="mt-3 text-sm text-white/65">{t("faq.stillText")}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link to="/contact" className="btn btn-red">
                {t("nav.contact")} <Arrow />
              </Link>
              <WhatsAppButton className="btn btn-line-light" />
              <Link to="/quote/request" className="btn btn-line-light">
                {t("nav.requestQuote")}
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
