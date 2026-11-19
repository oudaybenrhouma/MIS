import { useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, FileText, Loader2, Send, ShieldCheck, UploadCloud, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { useQuote } from "@/state/quote";
import { siteConfig } from "@/config/site";
import { libyanCities } from "@/data/cities";
import { getBrand } from "@/data/brands";
import { getProduct } from "@/services/catalog";
import { normaliseLibyanPhone, RfqServiceError, submitRfq, type RfqPayload } from "@/services/rfq";
import { PageHeader } from "@/components/PageHeader";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Arrow, usePageTitle } from "@/components/common";

interface Values {
  name: string;
  jobTitle: string;
  phone: string;
  email: string;
  whatsapp: boolean;
  company: string;
  registry: string;
  sector: string;
  city: string;
  address: string;
  method: "site" | "pickup" | "tbd";
  urgency: "standard" | "urgent" | "project";
  requiredBy: string;
  currency: "LYD" | "USD" | "EUR";
  requirements: string;
  consent: boolean;
}

const initial: Values = {
  name: "",
  jobTitle: "",
  phone: "",
  email: "",
  whatsapp: true,
  company: "",
  registry: "",
  sector: "",
  city: "",
  address: "",
  method: "site",
  urgency: "standard",
  requiredBy: "",
  currency: "LYD",
  requirements: "",
  consent: false,
};

const SECTORS = ["oilGas", "power", "manufacturing", "construction", "maintenance", "trading", "public", "other"];
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function FieldWrap({
  id,
  label,
  error,
  hint,
  required,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={className} data-field={id}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold">
        <span>
          {label} {required && <span className="text-signal" aria-hidden>*</span>}
        </span>
        {!required && <span className="label text-mist">{t("common.optional")}</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-mist">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-signal-deep" role="alert">
          <AlertTriangle className="size-3.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function Section({ no, title, children }: { no: string; title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t-2 border-ink pt-6">
      <legend className="sr-only">{title}</legend>
      <div className="mb-6 flex items-baseline gap-4">
        <span className="mono text-sm font-semibold text-signal">{no}</span>
        <h2 className="display text-2xl md:text-3xl">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}

export default function QuoteRequest() {
  const { t, tr, n, lang } = useI18n();
  const quote = useQuote();
  const navigate = useNavigate();
  usePageTitle(t("rfq.title"));

  const [v, setV] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [attempted, setAttempted] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...v, [key]: value };
    setV(next);
    if (attempted) setErrors(validate(next));
  };

  const input = (key: keyof Values) => ({
    id: key,
    value: v[key] as string,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      set(key, e.target.value as never),
    "aria-invalid": Boolean(errors[key]) || undefined,
    "aria-describedby": errors[key] ? `${key}-err` : undefined,
  });

  function validate(values: Values): Record<string, string> {
    const e: Record<string, string> = {};
    const req = t("rfq.err.required");
    if (!values.name.trim()) e.name = req;
    if (!values.phone.trim()) e.phone = req;
    else if (!normaliseLibyanPhone(values.phone)) e.phone = t("rfq.err.phone");
    if (!values.email.trim()) e.email = req;
    else if (!emailRe.test(values.email.trim())) e.email = t("rfq.err.email");
    if (!values.company.trim()) e.company = req;
    if (!values.city) e.city = req;
    if (values.method !== "pickup" && !values.address.trim()) e.address = req;
    if (!values.consent) e.consent = t("rfq.err.consent");
    if (quote.lineCount === 0 && !values.requirements.trim() && files.length === 0) e.items = t("rfq.err.items");
    return e;
  }

  /* ---- attachments ---- */
  const addFiles = (incoming: FileList | File[]) => {
    const errs: string[] = [];
    const next = [...files];
    const max = siteConfig.rfq.maxAttachments;
    const maxBytes = siteConfig.rfq.maxAttachmentMB * 1024 * 1024;
    for (const f of Array.from(incoming)) {
      const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
      if (!siteConfig.rfq.acceptedExtensions.includes(ext)) errs.push(t("rfq.err.fileType", { name: f.name }));
      else if (f.size > maxBytes) errs.push(t("rfq.err.fileSize", { name: f.name, mb: siteConfig.rfq.maxAttachmentMB }));
      else if (next.length >= max) {
        const m = t("rfq.err.fileCount", { n: max });
        if (!errs.includes(m)) errs.push(m);
      } else if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setFiles(next);
    setFileErrors(errs);
    if (fileInput.current) fileInput.current.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const fmtSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

  /* ---- submit ---- */
  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setAttempted(true);
    setSubmitError("");
    const errs = validate(v);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      requestAnimationFrame(() => {
        const el = document.getElementById(first) ?? document.querySelector(`[data-field="${first}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement | null)?.focus?.({ preventScroll: true });
      });
      return;
    }

    const payload: RfqPayload = {
      contact: {
        name: v.name.trim(),
        jobTitle: v.jobTitle.trim(),
        phone: normaliseLibyanPhone(v.phone)!,
        email: v.email.trim(),
        whatsapp: v.whatsapp,
      },
      company: { name: v.company.trim(), registry: v.registry.trim(), sector: v.sector },
      delivery: {
        city: v.city,
        address: v.address.trim(),
        method: v.method,
        urgency: v.urgency,
        requiredBy: v.requiredBy,
        currency: v.currency,
      },
      requirements: v.requirements.trim(),
      items: quote.items.flatMap((i) => {
        const p = getProduct(i.productId);
        return p
          ? [{ productId: p.id, ref: p.ref, name: tr(p.name), brand: getBrand(p.brand)?.name ?? "", qty: i.qty, note: i.note }]
          : [];
      }),
      attachments: [],
      lang,
    };

    setBusy(true);
    try {
      const res = await submitRfq(payload, files);
      quote.clear();
      navigate(`/quote/confirmation/${res.reference}`, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof RfqServiceError && error.code === "service_unavailable" ? t("rfq.err.backend") : t("rfq.err.failed"));
      setBusy(false);
    }
  };

  const errorCount = Object.keys(errors).length;
  const optionCls = "flex cursor-pointer items-center gap-3 border-[1.5px] border-ink/25 bg-white p-3 text-sm font-medium transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white hover:border-ink";

  return (
    <>
      <PageHeader
        crumbs={[
          { label: t("nav.home"), to: "/" },
          { label: t("quote.kicker"), to: "/quote" },
          { label: t("rfq.kicker") },
        ]}
        kicker={t("rfq.kicker")}
        title={t("rfq.title")}
        intro={t("rfq.intro")}
      />

      <form id="rfq-form" onSubmit={onSubmit} noValidate className="mx-auto grid max-w-[1360px] gap-12 px-5 py-10 sm:px-8 md:py-14 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-12">
          {attempted && errorCount > 0 && (
            <div role="alert" className="flex items-start gap-3 border-s-4 border-signal bg-signal/10 p-4 text-sm font-semibold text-signal-deep">
              <AlertTriangle className="mt-0.5 size-5 shrink-0" /> {t("rfq.err.summary")}
            </div>
          )}

          {/* 1 — contact */}
          <Section no="01" title={t("rfq.s1")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldWrap id="name" label={t("rfq.f.name")} required error={errors.name}>
                <input className="field" autoComplete="name" {...input("name")} />
              </FieldWrap>
              <FieldWrap id="jobTitle" label={t("rfq.f.jobTitle")}>
                <input className="field" autoComplete="organization-title" {...input("jobTitle")} />
              </FieldWrap>
              <FieldWrap id="phone" label={t("rfq.f.phone")} required error={errors.phone} hint={t("rfq.f.phoneHint")}>
                <div className="flex" dir="ltr">
                  <span className="mono flex items-center border-[1.5px] border-e-0 border-ink bg-ink px-3 text-sm font-semibold text-white">
                    🇱🇾 +218
                  </span>
                  <input
                    className="field mono"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="91 234 5678"
                    {...input("phone")}
                  />
                </div>
              </FieldWrap>
              <FieldWrap id="email" label={t("rfq.f.email")} required error={errors.email}>
                <input className="field" type="email" dir="ltr" autoComplete="email" placeholder="name@company.ly" {...input("email")} />
              </FieldWrap>
            </div>
            <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={v.whatsapp}
                onChange={(e) => set("whatsapp", e.target.checked)}
                className="size-4 accent-[var(--color-signal)]"
              />
              {t("rfq.f.whatsappSame")}
            </label>
          </Section>

          {/* 2 — company */}
          <Section no="02" title={t("rfq.s2")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldWrap id="company" label={t("rfq.f.company")} required error={errors.company} className="sm:col-span-2">
                <input className="field" autoComplete="organization" {...input("company")} />
              </FieldWrap>
              <FieldWrap id="registry" label={t("rfq.f.registry")}>
                <input className="field mono" dir="ltr" {...input("registry")} />
              </FieldWrap>
              <FieldWrap id="sector" label={t("rfq.f.sector")}>
                <select className="field" {...input("sector")}>
                  <option value="">{t("rfq.f.selectSector")}</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {t(`rfq.sectors.${s}`)}
                    </option>
                  ))}
                </select>
              </FieldWrap>
            </div>
          </Section>

          {/* 3 — delivery */}
          <Section no="03" title={t("rfq.s3")}>
            <div className="grid gap-5 sm:grid-cols-2">
              <FieldWrap id="city" label={t("rfq.f.city")} required error={errors.city}>
                <select className="field" autoComplete="address-level2" {...input("city")}>
                  <option value="">{t("rfq.f.selectCity")}</option>
                  {libyanCities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {tr(c)}
                    </option>
                  ))}
                </select>
              </FieldWrap>
              <FieldWrap
                id="address"
                label={t("rfq.f.address")}
                required={v.method !== "pickup"}
                error={errors.address}
                hint={t("rfq.f.addressHint")}
              >
                <input className="field" autoComplete="street-address" {...input("address")} />
              </FieldWrap>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">{t("rfq.f.delivery")}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {(["site", "pickup", "tbd"] as const).map((m) => (
                  <label key={m} className={optionCls}>
                    <input type="radio" name="method" className="sr-only" checked={v.method === m} onChange={() => set("method", m)} />
                    {t(`rfq.delivery.${m}`)}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div>
                <p className="mb-2 text-sm font-semibold">{t("rfq.f.urgency")}</p>
                <div className="grid gap-2">
                  {(["standard", "urgent", "project"] as const).map((u) => (
                    <label key={u} className={optionCls}>
                      <input type="radio" name="urgency" className="sr-only" checked={v.urgency === u} onChange={() => set("urgency", u)} />
                      {t(`rfq.urgency.${u}`)}
                    </label>
                  ))}
                </div>
              </div>
              <FieldWrap id="requiredBy" label={t("rfq.f.requiredBy")}>
                <input className="field" type="date" dir="ltr" min={new Date().toISOString().slice(0, 10)} {...input("requiredBy")} />
              </FieldWrap>
              <div>
                <p className="mb-2 text-sm font-semibold">{t("rfq.f.currency")}</p>
                <div className="grid gap-2">
                  {(["LYD", "USD", "EUR"] as const).map((c) => (
                    <label key={c} className={optionCls}>
                      <input type="radio" name="currency" className="sr-only" checked={v.currency === c} onChange={() => set("currency", c)} />
                      <span className="mono">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* 4 — items */}
          <Section no="04" title={t("rfq.s4")}>
            <div data-field="items" className={errors.items ? "outline outline-2 outline-offset-4 outline-signal" : ""}>
              {quote.lineCount === 0 ? (
                <div className="flex flex-col items-start gap-4 border border-dashed border-ink/30 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-ink/65">{t("rfq.noItems")}</p>
                  <Link to="/catalogue" className="btn btn-line btn-sm">
                    {t("rfq.addProducts")}
                  </Link>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-ink/15 border border-ink/15 bg-white">
                    {quote.items.map((i) => {
                      const p = getProduct(i.productId);
                      if (!p) return null;
                      return (
                        <li key={i.productId} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 sm:p-4">
                          <div className="min-w-0 flex-1 basis-56">
                            <p className="label text-signal">{getBrand(p.brand)?.name}</p>
                            <p className="truncate font-semibold">{tr(p.name)}</p>
                            <p className="mono text-xs text-mist">{p.ref}</p>
                            {i.note && <p className="mt-1 text-xs text-ink/60">“{i.note}”</p>}
                          </div>
                          <QuantityStepper size="sm" value={i.qty} onChange={(q) => quote.setQty(p.id, q)} />
                          <button
                            type="button"
                            onClick={() => quote.remove(p.id)}
                            className="flex size-9 items-center justify-center text-mist hover:bg-signal hover:text-white"
                            aria-label={`${t("common.remove")}: ${tr(p.name)}`}
                          >
                            <X className="size-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <Link to="/quote" className="mt-3 inline-block text-sm font-semibold underline underline-offset-4 hover:text-signal">
                    {t("rfq.editList")}
                  </Link>
                </>
              )}
              {errors.items && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-signal-deep" role="alert">
                  <AlertTriangle className="size-4 shrink-0" /> {errors.items}
                </p>
              )}
            </div>
          </Section>

          {/* 5 — requirements + attachments */}
          <Section no="05" title={t("rfq.s5")}>
            <FieldWrap id="requirements" label={t("rfq.f.requirements")} hint={t("rfq.f.requirementsHint")}>
              <textarea className="field min-h-36 resize-y" maxLength={4000} {...input("requirements")} />
            </FieldWrap>

            <div className="mt-6">
              <p className="mb-1.5 flex items-baseline justify-between text-sm font-semibold">
                {t("rfq.f.attachments")} <span className="label text-mist">{t("common.optional")}</span>
              </p>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center gap-2 border-2 border-dashed p-8 text-center transition-colors ${
                  dragging ? "border-signal bg-signal/5" : "border-ink/30 bg-white"
                }`}
              >
                <UploadCloud className="size-8 text-ink/50" strokeWidth={1.5} />
                <p className="text-sm text-ink/70">{t("rfq.f.attachHint")}</p>
                <p className="mono text-xs text-mist">
                  {t("rfq.f.attachLimits", { n: siteConfig.rfq.maxAttachments, mb: siteConfig.rfq.maxAttachmentMB })}
                </p>
                <button type="button" className="btn btn-line btn-sm mt-2" onClick={() => fileInput.current?.click()}>
                  {t("rfq.f.browse")}
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  hidden
                  accept={siteConfig.rfq.acceptedExtensions.join(",")}
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                />
              </div>
              {fileErrors.length > 0 && (
                <ul className="mt-3 space-y-1" role="alert">
                  {fileErrors.map((m) => (
                    <li key={m} className="flex items-center gap-1.5 text-xs font-semibold text-signal-deep">
                      <AlertTriangle className="size-3.5 shrink-0" /> {m}
                    </li>
                  ))}
                </ul>
              )}
              {files.length > 0 && (
                <ul className="mt-3 divide-y divide-ink/15 border border-ink/15 bg-white">
                  {files.map((f) => (
                    <li key={f.name + f.size} className="flex items-center gap-3 p-3 text-sm">
                      <FileText className="size-4 shrink-0 text-signal" />
                      <span className="min-w-0 flex-1 truncate font-medium" dir="auto">
                        {f.name}
                      </span>
                      <span className="mono text-xs text-mist">{fmtSize(f.size)}</span>
                      <button
                        type="button"
                        onClick={() => setFiles(files.filter((x) => x !== f))}
                        aria-label={`${t("rfq.removeFile")}: ${f.name}`}
                        className="flex size-8 items-center justify-center text-mist hover:bg-signal hover:text-white"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>

          {/* consent + submit */}
          <div className="border-t-2 border-ink pt-6">
            <div data-field="consent">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  id="consent"
                  type="checkbox"
                  checked={v.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                  aria-invalid={Boolean(errors.consent) || undefined}
                  className="mt-0.5 size-5 shrink-0 accent-[var(--color-signal)]"
                />
                <span>{t("rfq.f.consent")}</span>
              </label>
              {errors.consent && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-signal-deep" role="alert">
                  <AlertTriangle className="size-3.5" /> {errors.consent}
                </p>
              )}
            </div>
            {submitError && (
              <p className="mt-4 border-s-4 border-signal bg-signal/10 p-3 text-sm font-semibold text-signal-deep" role="alert">
                {submitError}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button type="submit" disabled={busy} className="btn btn-red !px-8 !py-4 text-base">
                {busy ? (
                  <>
                    <Loader2 className="spin size-5" /> {t("rfq.submitting")}
                  </>
                ) : (
                  <>
                    <Send className="size-4 rtl:-scale-x-100" /> {t("rfq.submit")}
                  </>
                )}
              </button>
              <p className="flex items-center gap-2 text-sm text-ink/60">
                <ShieldCheck className="size-4 text-signal" /> {t("rfq.noPayment")}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border-[1.5px] border-ink bg-white p-6">
            <p className="label text-signal">{t("rfq.sidebarTitle")}</p>
            <dl className="mt-4 space-y-2 border-y border-dashed border-ink/30 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">{t("quote.lines")}</dt>
                <dd className="mono font-semibold">{n(quote.lineCount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">{t("quote.units")}</dt>
                <dd className="mono font-semibold">{n(quote.totalUnits)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">{t("rfq.f.attachments")}</dt>
                <dd className="mono font-semibold">{n(files.length)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">{t("rfq.f.currency")}</dt>
                <dd className="mono font-semibold">{v.currency}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-ink/60">{t("quote.priceNote")}</p>
            <Link to="/quote" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:text-signal">
              {t("rfq.editList")} <Arrow className="size-3.5" />
            </Link>
          </div>
        </aside>
      </form>
    </>
  );
}
