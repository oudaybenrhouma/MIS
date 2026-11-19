import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Loader2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useI18n } from "@/i18n";
import { isWhatsappConfigured, siteConfig, whatsappLink } from "@/config/site";
import { PageHeader } from "@/components/PageHeader";
import { Arrow, useContact, usePageTitle } from "@/components/common";

function InfoCard({
  icon,
  label,
  value,
  configured,
  href,
  mono,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  configured: boolean;
  href?: string;
  mono?: boolean;
}) {
  const { t } = useI18n();
  const body = (
    <>
      <span className="flex size-11 items-center justify-center bg-ink text-white">{icon}</span>
      <div className="min-w-0">
        <p className="label text-mist">{label}</p>
        <p className={`mt-1 font-semibold break-words ${mono ? "mono" : ""} ${configured ? "" : "text-ink/45"}`}>{value}</p>
        {!configured && <p className="mt-1 text-[11px] text-mist">{t("common.toBeConfigured")}</p>}
      </div>
    </>
  );
  const cls = `flex items-start gap-4 border p-5 transition-colors ${
    configured ? "border-ink/20 bg-white hover:border-ink" : "border-dashed border-ink/30 bg-transparent"
  }`;
  return configured && href ? (
    <a href={href} className={cls}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default function Contact() {
  const { t } = useI18n();
  const c = useContact();
  usePageTitle(t("contact.kicker"));
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900)); // mock; wire to a backend later
    setBusy(false);
    setSent(true);
  };

  return (
    <>
      <PageHeader
        crumbs={[{ label: t("nav.home"), to: "/" }, { label: t("contact.kicker") }]}
        kicker={t("contact.kicker")}
        title={t("contact.title")}
        intro={t("contact.intro")}
      />

      <section className="mx-auto grid max-w-[1360px] gap-12 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-2">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<Phone className="size-5" />}
              label={t("contact.phone")}
              value={c.phone.value}
              configured={c.phone.configured}
              href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
              mono
            />
            <InfoCard
              icon={<MessageCircle className="size-5" />}
              label={t("contact.whatsapp")}
              value={c.whatsapp.value}
              configured={isWhatsappConfigured()}
              href={whatsappLink()}
              mono
            />
            <InfoCard
              icon={<Mail className="size-5" />}
              label={t("contact.email")}
              value={c.email.value}
              configured={c.email.configured}
              href={`mailto:${siteConfig.contact.email}`}
              mono
            />
            <InfoCard icon={<Clock className="size-5" />} label={t("contact.hours")} value={c.hours.value} configured={c.hours.configured} />
            <div className="sm:col-span-2">
              <InfoCard icon={<MapPin className="size-5" />} label={t("contact.address")} value={c.address.value} configured={c.address.configured} />
            </div>
          </div>
          <p className="mono mt-4 text-xs text-mist">{t("contact.placeholderNote")}</p>

          <div className="bp-grid-light mt-8 flex aspect-[16/9] items-center justify-center border border-dashed border-ink/30 bg-[#e9e7e1]">
            {siteConfig.contact.mapEmbedUrl ? (
              <iframe title="Map" src={siteConfig.contact.mapEmbedUrl} className="size-full border-0" loading="lazy" />
            ) : (
              <span className="label flex items-center gap-2 text-ink/50">
                <MapPin className="size-4" /> {t("contact.map")}
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-col items-start gap-3 bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="display text-xl">{t("contact.rfqTitle")}</p>
              <p className="mt-1 max-w-sm text-sm text-white/65">{t("contact.rfqText")}</p>
            </div>
            <Link to="/catalogue" className="btn btn-red shrink-0">
              {t("nav.catalogue")} <Arrow />
            </Link>
          </div>
        </div>

        <div className="border-[1.5px] border-ink bg-white p-6 shadow-[8px_8px_0_var(--color-signal)] sm:p-8 rtl:shadow-[-8px_8px_0_var(--color-signal)] lg:self-start">
          {sent ? (
            <div className="flex flex-col items-start py-8">
              <CheckCircle2 className="size-12 text-signal" strokeWidth={1.5} />
              <h2 className="display mt-5 text-3xl">{t("contact.sentTitle")}</h2>
              <p className="mt-3 text-ink/65">{t("contact.sentText")}</p>
              <button className="btn btn-line mt-6" onClick={() => setSent(false)}>
                {t("contact.sendAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h2 className="display text-2xl md:text-3xl">{t("contact.formTitle")}</h2>
              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-sm font-semibold">{t("contact.name")}</label>
                <input id="c-name" required className="field" autoComplete="name" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-phone" className="mb-1.5 block text-sm font-semibold">{t("contact.phoneField")}</label>
                  <div className="flex" dir="ltr">
                    <span className="mono flex items-center bg-ink px-3 text-sm font-semibold text-white">+218</span>
                    <input id="c-phone" type="tel" inputMode="tel" placeholder="91 234 5678" className="field mono" />
                  </div>
                </div>
                <div>
                  <label htmlFor="c-email" className="mb-1.5 block text-sm font-semibold">{t("contact.email")}</label>
                  <input id="c-email" type="email" dir="ltr" className="field" autoComplete="email" />
                </div>
              </div>
              <div>
                <label htmlFor="c-msg" className="mb-1.5 block text-sm font-semibold">{t("contact.message")}</label>
                <textarea id="c-msg" required className="field min-h-36 resize-y" />
              </div>
              <button className="btn btn-ink w-full" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="spin size-4" /> {t("contact.sending")}
                  </>
                ) : (
                  t("contact.send")
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
