/**
 * RFQ submission service (mock).
 * ---------------------------------------------------------------
 * Today: generates a reference and stores the submission in localStorage
 * so the full flow (form → confirmation) can be tested without a backend.
 *
 * Later: POST `RfqPayload` (as multipart/form-data with the files) to
 * `siteConfig.rfq.endpoint` and return the reference issued by the server.
 */
import { siteConfig } from "@/config/site";

export interface RfqPayload {
  contact: {
    name: string;
    jobTitle: string;
    phone: string; // normalised, +218…
    email: string;
    whatsapp: boolean;
  };
  company: {
    name: string;
    registry: string;
    sector: string;
  };
  delivery: {
    city: string;
    address: string;
    method: "site" | "pickup" | "tbd";
    urgency: "standard" | "urgent" | "project";
    requiredBy: string;
    currency: "LYD" | "USD" | "EUR";
  };
  requirements: string;
  items: { productId: string; ref: string; name: string; brand: string; qty: number; note: string }[];
  attachments: { name: string; size: number }[];
  lang: "ar" | "en";
}

export interface RfqSubmission extends RfqPayload {
  reference: string;
  submittedAt: string;
}

const KEY = "mis.rfq.submissions.v1";

function makeReference(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `MIS-RFQ-${yy}${mm}${dd}-${suffix}`;
}

function readAll(): RfqSubmission[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export async function submitRfq(payload: RfqPayload, _files: File[]): Promise<RfqSubmission> {
  void _files; // files would be uploaded to siteConfig.rfq.endpoint
  void siteConfig.rfq.endpoint;
  await new Promise((r) => setTimeout(r, 1300)); // simulate network latency
  const submission: RfqSubmission = { ...payload, reference: makeReference(), submittedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify([submission, ...readAll()].slice(0, 20)));
  } catch {
    /* ignore */
  }
  return submission;
}

export const getSubmission = (reference: string) => readAll().find((s) => s.reference === reference) ?? null;

/** Libyan number normalisation: accepts 91 234 5678, 091…, +218 91…, 00218… */
export function normaliseLibyanPhone(input: string): string | null {
  let d = input.replace(/[\s\-().]/g, "");
  d = d.replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660));
  if (d.startsWith("+218")) d = d.slice(4);
  else if (d.startsWith("00218")) d = d.slice(5);
  else if (d.startsWith("218") && d.length >= 11) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  if (!/^\d+$/.test(d)) return null;
  const mobile = /^9\d{8}$/.test(d); // 9X XXX XXXX
  const landline = /^[2-8]\d{7,8}$/.test(d);
  if (!mobile && !landline) return null;
  return `+218${d}`;
}

export function formatLibyanPhone(e164: string): string {
  const d = e164.replace("+218", "");
  return `+218 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`.trim();
}
