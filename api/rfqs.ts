import { randomBytes } from "node:crypto";
import { head } from "@vercel/blob";
import { getDatabase } from "./_database";
import { attachmentTypes, isAdminAuthorized, jsonError, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS, validAdminTokenConfigured } from "./_shared";

type Attachment = { name: string; size: number; path: string };
type RfqPayload = {
  contact: { name: string; jobTitle: string; phone: string; email: string; whatsapp: boolean };
  company: { name: string; registry: string; sector: string };
  delivery: { city: string; address: string; method: string; urgency: string; requiredBy: string; currency: string };
  requirements: string;
  items: { productId: string; ref: string; name: string; brand: string; qty: number; note: string }[];
  attachments: Attachment[];
  lang: "ar" | "en";
};

const cities = new Set(["tripoli", "benghazi", "misrata", "zawiya", "zliten", "khoms", "zuwara", "gharyan", "sabha", "sirte", "ajdabiya", "bayda", "marj", "derna", "tobruk", "brega", "ubari", "murzuq", "other"]);
const sectors = new Set(["", "oilGas", "power", "manufacturing", "construction", "maintenance", "trading", "public", "other"]);
const attachmentPathPattern = /^rfq-attachments\/[0-9a-f-]{36}\.[a-z0-9]{1,8}$/i;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+218(?:9\d{8}|[2-8]\d{7,8})$/;
const methods = new Set(["site", "pickup", "tbd"]);
const urgencies = new Set(["standard", "urgent", "project"]);
const currencies = new Set(["LYD", "USD", "EUR"]);

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "GET") return listSubmissions(request);
  if (request.method === "POST") return createSubmission(request);
  return jsonError("METHOD_NOT_ALLOWED", 405);
}

async function createSubmission(request: Request): Promise<Response> {
  if (!process.env.DATABASE_URL) return jsonError("DATABASE_NOT_CONFIGURED", 503);
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) return jsonError("ORIGIN_NOT_ALLOWED", 403);

  try {
    const raw = await request.text();
    if (raw.length > 256 * 1024) return jsonError("REQUEST_TOO_LARGE", 413);
    const payload = JSON.parse(raw) as unknown;
    const validationError = validatePayload(payload);
    if (validationError) return jsonError(validationError, 400);
    const rfq = payload as RfqPayload;

    const verifiedAttachments = await Promise.all(rfq.attachments.map(async (attachment) => {
      const metadata = await head(attachment.path);
      const extension = attachment.name.split(".").pop()?.toLowerCase() ?? "";
      return metadata.size === attachment.size && metadata.contentType === attachmentTypes[extension];
    }));
    if (verifiedAttachments.some((valid) => !valid)) return jsonError("ATTACHMENT_VERIFICATION_FAILED", 400);

    const now = new Date();
    const date = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const reference = `MIS-RFQ-${date}-${randomBytes(4).toString("hex").toUpperCase()}`;
    const sql = getDatabase();
    const [row] = await sql`
      INSERT INTO mis_rfq_submissions (reference, payload)
      VALUES (${reference}, ${JSON.stringify(rfq)}::jsonb)
      RETURNING submitted_at
    `;
    const submittedAt = new Date(row.submitted_at).toISOString();
    return Response.json(
      { ...rfq, reference, submittedAt },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") return jsonError("DATABASE_NOT_CONFIGURED", 503);
    if (error instanceof SyntaxError) return jsonError("INVALID_JSON", 400);
    return jsonError("SUBMISSION_FAILED", 503);
  }
}

async function listSubmissions(request: Request): Promise<Response> {
  if (!validAdminTokenConfigured()) return jsonError("ADMIN_NOT_CONFIGURED", 503);
  if (!isAdminAuthorized(request)) return jsonError("UNAUTHORIZED", 401);
  try {
    const sql = getDatabase();
    const url = new URL(request.url);
    const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "50", 10) || 50));
    const beforeValue = url.searchParams.get("before");
    const before = beforeValue ? new Date(beforeValue) : null;
    if (before && !Number.isFinite(before.getTime())) return jsonError("INVALID_CURSOR", 400);
    const rows = before
      ? await sql`SELECT reference, submitted_at, status, payload FROM mis_rfq_submissions WHERE submitted_at < ${before.toISOString()} ORDER BY submitted_at DESC LIMIT ${limit}`
      : await sql`SELECT reference, submitted_at, status, payload FROM mis_rfq_submissions ORDER BY submitted_at DESC LIMIT ${limit}`;
    return Response.json(
      { submissions: rows, nextBefore: rows.length === limit ? rows[rows.length - 1].submitted_at : null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return jsonError("SUBMISSIONS_UNAVAILABLE", 503);
  }
}

function validatePayload(value: unknown): string | null {
  if (!isRecord(value)) return "INVALID_SUBMISSION";
  const { contact, company, delivery, items, attachments, requirements, lang } = value;
  if (!isRecord(contact) || !isRecord(company) || !isRecord(delivery)) return "INVALID_SUBMISSION";
  if (!text(contact.name, 1, 160) || !text(contact.jobTitle, 0, 120) || !text(contact.phone, 1, 20) || !phonePattern.test(contact.phone)) return "INVALID_CONTACT";
  if (!text(contact.email, 3, 254) || !emailPattern.test(contact.email) || typeof contact.whatsapp !== "boolean") return "INVALID_CONTACT";
  if (!text(company.name, 1, 180) || !text(company.registry, 0, 100) || typeof company.sector !== "string" || !sectors.has(company.sector)) return "INVALID_COMPANY";
  if (!text(delivery.city, 1, 40) || !cities.has(delivery.city) || !text(delivery.address, 0, 300)) return "INVALID_DELIVERY";
  if (typeof delivery.method !== "string" || !methods.has(delivery.method) || typeof delivery.urgency !== "string" || !urgencies.has(delivery.urgency)) return "INVALID_DELIVERY";
  if (typeof delivery.currency !== "string" || !currencies.has(delivery.currency)) return "INVALID_DELIVERY";
  if (delivery.method !== "pickup" && !text(delivery.address, 1, 300)) return "INVALID_DELIVERY";
  if (!text(delivery.requiredBy, 0, 10) || (delivery.requiredBy && !/^\d{4}-\d{2}-\d{2}$/.test(delivery.requiredBy))) return "INVALID_DELIVERY";
  if (typeof requirements !== "string" || requirements.length > 4000 || (items as unknown[] | undefined)?.length === 0 && !requirements.trim() && (attachments as unknown[] | undefined)?.length === 0) return "INVALID_REQUIREMENTS";
  if (!Array.isArray(items) || items.length > 100) return "INVALID_ITEMS";
  for (const item of items) {
    if (!isRecord(item) || !text(item.productId, 1, 180) || !text(item.ref, 1, 120) || !text(item.name, 1, 240) || !text(item.brand, 1, 100)) return "INVALID_ITEMS";
    if (!Number.isInteger(item.qty) || (item.qty as number) < 1 || (item.qty as number) > 99999 || !text(item.note, 0, 240)) return "INVALID_ITEMS";
  }
  if (!Array.isArray(attachments) || attachments.length > MAX_ATTACHMENTS) return "INVALID_ATTACHMENTS";
  let totalBytes = 0;
  for (const attachment of attachments) {
    if (!isRecord(attachment) || !text(attachment.name, 1, 240) || !Number.isInteger(attachment.size) || (attachment.size as number) < 1 || (attachment.size as number) > MAX_ATTACHMENT_BYTES) return "INVALID_ATTACHMENTS";
    const extension = (attachment.name as string).split(".").pop()?.toLowerCase() ?? "";
    if (!attachmentTypes[extension] || typeof attachment.path !== "string" || !attachmentPathPattern.test(attachment.path)) return "INVALID_ATTACHMENTS";
    if (!attachment.path.endsWith(`.${extension}`)) return "INVALID_ATTACHMENTS";
    totalBytes += attachment.size as number;
  }
  if (totalBytes > MAX_ATTACHMENTS * MAX_ATTACHMENT_BYTES || (lang !== "ar" && lang !== "en")) return "INVALID_SUBMISSION";
  return null;
}

function text(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.length <= max;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
