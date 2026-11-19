/**
 * ─────────────────────────────────────────────────────────────
 *  MIS — site configuration
 *  Everything business-specific lives here. Leave a value empty
 *  ("") and the UI shows a clearly marked placeholder instead of
 *  inventing information.
 * ─────────────────────────────────────────────────────────────
 */

import type { L } from "@/data/types";

export const siteConfig = {
  name: {
    en: "Master Industrial Supplies",
    ar: "الإمداد الصناعي المتقن",
  } satisfies L,
  shortName: "MIS",

  contact: {
    /** Landline / main phone, international format e.g. "+218 21 000 0000" */
    phone: "",
    /** WhatsApp number, digits only with country code e.g. "218910000000" */
    whatsapp: "",
    email: "",
    address: { en: "", ar: "" } satisfies L,
    hours: { en: "", ar: "" } satisfies L,
    mapEmbedUrl: "",
  },

  /** What is shown in place of any empty contact value. */
  placeholders: {
    phone: "+218 XX XXX XXXX",
    whatsapp: "+218 9X XXX XXXX",
    email: "name@your-domain.ly",
    address: {
      en: "Address — to be configured",
      ar: "العنوان — يُضاف لاحقاً",
    } satisfies L,
    hours: {
      en: "Working hours — to be configured",
      ar: "ساعات العمل — تُضاف لاحقاً",
    } satisfies L,
  },

  rfq: {
    maxAttachments: 5,
    maxAttachmentMB: 10,
    acceptedExtensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".dwg", ".dxf", ".step", ".stp", ".png", ".jpg", ".jpeg", ".zip"],
    /** Override the built-in Vercel API endpoint only when needed. */
    endpoint: "",
  },
};

export function whatsappLink(text?: string) {
  const number = siteConfig.contact.whatsapp.replace(/\D/g, "");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  // Without a configured number wa.me still opens WhatsApp with the prefilled message.
  return number ? `https://wa.me/${number}${q}` : `https://wa.me/${q}`;
}

export const isWhatsappConfigured = () => siteConfig.contact.whatsapp.replace(/\D/g, "").length > 6;
