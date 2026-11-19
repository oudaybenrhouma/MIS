import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Copy, Printer } from "lucide-react";
import { useI18n } from "@/i18n";
import { libyanCities } from "@/data/cities";
import { getSubmission, formatLibyanPhone } from "@/services/rfq";
import { Arrow, WhatsAppButton, usePageTitle } from "@/components/common";
import NotFound from "./NotFound";

export default function QuoteConfirmation() {
  const { ref = "" } = useParams();
  const { t, tr, n, lang } = useI18n();
  const [copied, setCopied] = useState(false);
  usePageTitle(t("done.kicker"));

  const s = getSubmission(ref);
  if (!s) return <NotFound title={t("done.notFoundTitle")} />;

  const city = libyanCities.find((c) => c.id === s.delivery.city);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(s.reference);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const when = new Intl.DateTimeFormat(lang === "ar" ? "ar-LY-u-nu-latn" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(s.submittedAt));

  const steps = [
    [t("done.n1t"), t("done.n1d")],
    [t("done.n2t"), t("done.n2d")],
    [t("done.n3t"), t("done.n3d")],
  ];

  const Cell = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <div className="border-b border-ink/15 py-4">
      <p className="label text-mist">{k}</p>
      <div className="mt-1 text-sm font-medium">{children}</div>
    </div>
  );

  return (
    <>
      <section className="bp-grid-dark relative overflow-hidden bg-ink text-white">
        <div className="slash pointer-events-none absolute inset-y-0 end-0 hidden w-1/4 bg-signal md:block" aria-hidden />
        <div className="relative mx-auto max-w-[1360px] px-5 py-14 sm:px-8 md:py-20">
          <div className="flex size-16 items-center justify-center bg-signal">
            <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              <path className="draw-check" d="M4 12.5 9.5 18 20 6.5" />
            </svg>
          </div>
          <p className="label mt-8 text-signal">{t("done.kicker")}</p>
          <h1 className="display mt-3 max-w-3xl text-4xl sm:text-5xl md:text-6xl">{t("done.title")}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">{t("done.text")}</p>

          {/* reference ticket */}
          <div className="mt-10 inline-flex max-w-full flex-col gap-4 border-[1.5px] border-dashed border-white/50 bg-white/5 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
            <div>
              <p className="label text-white/60">{t("done.refLabel")}</p>
              <p className="mono mt-1 text-2xl font-semibold break-all sm:text-4xl">{s.reference}</p>
            </div>
            <button onClick={copy} className="btn btn-line-light btn-sm self-start sm:self-center">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? t("done.copied") : t("done.copy")}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1360px] gap-12 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <h2 className="display mb-2 text-2xl md:text-3xl">{t("done.summary")}</h2>
          <p className="mono mb-6 text-xs text-mist">
            {t("done.submittedAt")}: {when}
          </p>

          <div className="grid gap-x-8 sm:grid-cols-2">
            <Cell k={t("done.contact")}>
              <p>{s.contact.name}</p>
              <p className="mono text-ink/60">{formatLibyanPhone(s.contact.phone)}</p>
              <p className="text-ink/60" dir="ltr" style={{ textAlign: lang === "ar" ? "right" : "left" }}>{s.contact.email}</p>
            </Cell>
            <Cell k={t("done.company")}>
              <p>{s.company.name}</p>
              {s.company.sector && <p className="text-ink/60">{t(`rfq.sectors.${s.company.sector}`)}</p>}
            </Cell>
            <Cell k={t("done.delivery")}>
              <p>{city ? tr(city) : ""} {s.delivery.address && `— ${s.delivery.address}`}</p>
              <p className="text-ink/60">
                {t(`rfq.delivery.${s.delivery.method}`)} · {t(`rfq.urgency.${s.delivery.urgency}`)} · <span className="mono">{s.delivery.currency}</span>
              </p>
            </Cell>
            <Cell k={t("done.attachments")}>
              {s.attachments.length ? (
                <ul>
                  {s.attachments.map((a) => (
                    <li key={a.name} className="truncate" dir="auto">{a.name}</li>
                  ))}
                </ul>
              ) : (
                t("done.none")
              )}
            </Cell>
          </div>

          <h3 className="label mt-8 mb-3">{t("done.items")} ({n(s.items.length)})</h3>
          {s.items.length ? (
            <ul className="divide-y divide-ink/15 border-y-2 border-ink">
              {s.items.map((i) => (
                <li key={i.productId} className="flex items-center gap-4 py-3 text-sm">
                  <span className="mono w-32 shrink-0 text-xs text-mist">{i.ref}</span>
                  <span className="flex-1">
                    <span className="label me-2 text-signal">{i.brand}</span>
                    {i.name}
                    {i.note && <span className="block text-xs text-ink/55">“{i.note}”</span>}
                  </span>
                  <span className="mono font-semibold">×{n(i.qty)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">{t("rfq.noItems")}</p>
          )}
          {s.requirements && (
            <div className="mt-6 border-s-4 border-ink/30 bg-white p-4 text-sm whitespace-pre-wrap" dir="auto">
              {s.requirements}
            </div>
          )}
        </div>

        <aside>
          <h2 className="display mb-6 text-2xl md:text-3xl">{t("done.next")}</h2>
          <ol className="space-y-0">
            {steps.map(([title, body], i) => (
              <li key={title} className="relative flex gap-4 pb-8 last:pb-0">
                {i < steps.length - 1 && <span className="absolute start-[19px] top-10 bottom-0 w-px bg-ink/25" aria-hidden />}
                <span className="mono relative flex size-10 shrink-0 items-center justify-center border-[1.5px] border-ink bg-paper font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="text-sm text-ink/65">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="no-print mt-10 flex flex-col gap-3">
            <WhatsAppButton
              text={t("done.waText", { ref: s.reference })}
              label={t("done.followWhatsapp")}
              className="btn btn-ink w-full"
            />
            <button onClick={() => window.print()} className="btn btn-line w-full">
              <Printer className="size-4" /> {t("done.print")}
            </button>
            <Link to="/catalogue" className="btn btn-line w-full">
              {t("done.another")} <Arrow />
            </Link>
          </div>
        </aside>
      </section>
    </>
  );
}
