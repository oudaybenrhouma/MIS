import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export type ApiRequest = IncomingMessage & { body?: unknown };
export type ApiResponse = ServerResponse & {
  status(code: number): ApiResponse;
  json(body: unknown): ApiResponse;
};

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export const attachmentTypes: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  dwg: "application/acad",
  dxf: "application/dxf",
  step: "application/step",
  stp: "application/step",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  zip: "application/zip",
};

export function jsonError(response: ApiResponse, message: string, status: number): void {
  response.setHeader("Cache-Control", "no-store");
  response.status(status).json({ error: message });
}

export function isAdminAuthorized(request: ApiRequest): boolean {
  const expected = process.env.RFQ_ADMIN_TOKEN;
  const authorization = request.headers.authorization;
  const authorizationHeader = typeof authorization === "string" ? authorization : "";
  const provided = authorizationHeader.startsWith("Bearer ") ? authorizationHeader.slice(7) : "";
  if (!expected || !provided) return false;
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  return expectedBytes.length === providedBytes.length && timingSafeEqual(expectedBytes, providedBytes);
}

export function validAdminTokenConfigured(): boolean {
  return Boolean(process.env.RFQ_ADMIN_TOKEN);
}
