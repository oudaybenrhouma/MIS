import { siteConfig } from "@/config/site";
import { put } from "@vercel/blob/client";

export interface RfqAttachment {
  name: string;
  size: number;
  path: string;
}

export interface RfqPayload {
  contact: {
    name: string;
    jobTitle: string;
    phone: string;
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
  attachments: RfqAttachment[];
  lang: "ar" | "en";
}

export interface RfqSubmission extends RfqPayload {
  reference: string;
  submittedAt: string;
}

export class RfqServiceError extends Error {
  constructor(readonly code: "service_unavailable" | "upload_failed" | "submission_failed") {
    super(code);
    this.name = "RfqServiceError";
  }
}

interface UploadTicket {
  pathname: string;
  clientToken: string;
  contentType: string;
}

const CURRENT_SUBMISSION_KEY = "mis.rfq.current.v1";

export async function submitRfq(payload: RfqPayload, files: File[]): Promise<RfqSubmission> {
  const attachments: RfqAttachment[] = [];
  for (const file of files) {
    let ticket: UploadTicket;
    try {
      const response = await fetch("/api/rfq-attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size }),
      });
      if (!response.ok) throw new RfqServiceError(response.status === 503 ? "service_unavailable" : "upload_failed");
      ticket = (await response.json()) as UploadTicket;
    } catch (error) {
      if (error instanceof RfqServiceError) throw error;
      throw new RfqServiceError("service_unavailable");
    }

    try {
      const blob = await put(ticket.pathname, file, {
        token: ticket.clientToken,
        access: "private",
        contentType: ticket.contentType,
      });
      attachments.push({ name: file.name, size: file.size, path: blob.pathname });
    } catch (error) {
      if (error instanceof RfqServiceError) throw error;
      throw new RfqServiceError("upload_failed");
    }
  }

  try {
    const response = await fetch(siteConfig.rfq.endpoint || "/api/rfqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, attachments }),
    });
    if (!response.ok) throw new RfqServiceError(response.status === 503 ? "service_unavailable" : "submission_failed");
    const submission = (await response.json()) as RfqSubmission;
    try {
      sessionStorage.setItem(CURRENT_SUBMISSION_KEY, JSON.stringify(submission));
    } catch {
      // The server has stored the request; confirmation can still use the response in this navigation.
    }
    return submission;
  } catch (error) {
    if (error instanceof RfqServiceError) throw error;
    throw new RfqServiceError("service_unavailable");
  }
}

export const getSubmission = (reference: string): RfqSubmission | null => {
  try {
    const current = JSON.parse(sessionStorage.getItem(CURRENT_SUBMISSION_KEY) ?? "null") as RfqSubmission | null;
    return current?.reference === reference ? current : null;
  } catch {
    return null;
  }
};

/** Libyan number normalisation: accepts 91 234 5678, 091…, +218 91…, 00218… */
export function normaliseLibyanPhone(input: string): string | null {
  let d = input.replace(/[\s\-().]/g, "");
  d = d.replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660));
  if (d.startsWith("+218")) d = d.slice(4);
  else if (d.startsWith("00218")) d = d.slice(5);
  else if (d.startsWith("218") && d.length >= 11) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  if (!/^\d+$/.test(d)) return null;
  const mobile = /^9\d{8}$/.test(d);
  const landline = /^[2-8]\d{7,8}$/.test(d);
  if (!mobile && !landline) return null;
  return `+218${d}`;
}

export function formatLibyanPhone(e164: string): string {
  const d = e164.replace("+218", "");
  return `+218 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`.trim();
}
