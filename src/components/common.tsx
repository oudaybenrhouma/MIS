import { useEffect } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n";
import { isWhatsappConfigured, siteConfig, whatsappLink } from "@/config/site";

/** Arrow that mirrors itself in RTL. */
export function Arrow({ className = "size-4" }: { className?: string }) {
  return <ArrowRight className={`${className} rtl:-scale-x-100`} aria-hidden />;
}

export function usePageTitle(title?: string) {
  const { lang } = useI18n();
  useEffect(() => {
    const base = lang === "ar" ? "MIS — ماستر للتوريدات الصناعية" : "MIS — Master Industrial Supplies";
    document.title = title ? `${title} | ${base}` : base;
  }, [title, lang]);
}

export function WhatsAppButton({
  text,
  label,
  className = "btn btn-line",
}: {
  text?: string;
  label?: string;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <a href={whatsappLink(text)} target="_blank" rel="noopener noreferrer" className={className}>
      <MessageCircle className="size-4" /> {label ?? t("common.whatsapp")}
    </a>
  );
}

/** Contact values with clearly marked placeholders for unset config. */
export function useContact() {
  const { lang } = useI18n();
  const c = siteConfig.contact;
  const p = siteConfig.placeholders;
  return {
    phone: { value: c.phone || p.phone, configured: Boolean(c.phone) },
    whatsapp: {
      value: c.whatsapp ? `+${c.whatsapp.replace(/\D/g, "")}` : p.whatsapp,
      configured: isWhatsappConfigured(),
    },
    email: { value: c.email || p.email, configured: Boolean(c.email) },
    address: { value: c.address[lang] || p.address[lang], configured: Boolean(c.address[lang]) },
    hours: { value: c.hours[lang] || p.hours[lang], configured: Boolean(c.hours[lang]) },
  };
}
