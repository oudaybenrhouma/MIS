import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { get, issueSignedToken, presignUrl } from "@vercel/blob";
import { attachmentTypes, isAdminAuthorized, jsonError, MAX_ATTACHMENT_BYTES, validAdminTokenConfigured, type ApiRequest, type ApiResponse } from "./_shared.js";

const pathnamePattern = /^rfq-attachments\/[0-9a-f-]{36}\.[a-z0-9]{1,8}$/i;

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (request.method === "POST") return createUploadUrl(request, response);
  if (request.method === "GET") return downloadAttachment(request, response);
  jsonError(response, "METHOD_NOT_ALLOWED", 405);
}

async function createUploadUrl(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    return jsonError(response, "BLOB_NOT_CONFIGURED", 503);
  }

  try {
    const body = request.body as { name?: unknown; size?: unknown } | undefined;
    if (!body || typeof body.name !== "string" || typeof body.size !== "number") return jsonError(response, "INVALID_FILE", 400);

    const extension = body.name.split(".").pop()?.toLowerCase() ?? "";
    const contentType = attachmentTypes[extension];
    if (!contentType) return jsonError(response, "FILE_TYPE_NOT_ALLOWED", 400);
    if (!Number.isInteger(body.size) || body.size < 1 || body.size > MAX_ATTACHMENT_BYTES) {
      return jsonError(response, "FILE_SIZE_NOT_ALLOWED", 400);
    }

    const pathname = `rfq-attachments/${randomUUID()}.${extension}`;
    const validUntil = Date.now() + 5 * 60 * 1000;
    const blobAuth = process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {};
    const signedToken = await issueSignedToken({
      ...blobAuth,
      pathname,
      operations: ["put"],
      allowedContentTypes: [contentType],
      maximumSizeInBytes: Math.min(body.size, MAX_ATTACHMENT_BYTES),
      validUntil,
    });
    const { presignedUrl } = await presignUrl(signedToken, {
      ...blobAuth,
      operation: "put",
      pathname,
      access: "private",
      allowedContentTypes: [contentType],
      maximumSizeInBytes: Math.min(body.size, MAX_ATTACHMENT_BYTES),
      validUntil,
      addRandomSuffix: false,
      allowOverwrite: false,
    });

    response.setHeader("Cache-Control", "no-store");
    response.status(200).json({ pathname, presignedUrl, contentType });
  } catch (error) {
    const detail = error instanceof Error
      ? `${error.name}; code=${"code" in error ? String(error.code) : "unknown"}; status=${"statusCode" in error ? String(error.statusCode) : "unknown"}`
      : "unknown error";
    console.error(`[rfq-attachments] upload URL creation failed (${detail})`);
    jsonError(response, "UPLOAD_URL_FAILED", 503);
  }
}

async function downloadAttachment(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (!validAdminTokenConfigured()) return jsonError(response, "ADMIN_NOT_CONFIGURED", 503);
  if (!isAdminAuthorized(request)) return jsonError(response, "UNAUTHORIZED", 401);

  const host = request.headers.host ?? "localhost";
  const pathname = new URL(request.url ?? "/", `https://${host}`).searchParams.get("path") ?? "";
  if (!pathnamePattern.test(pathname)) return jsonError(response, "INVALID_ATTACHMENT", 400);

  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200) return jsonError(response, "ATTACHMENT_NOT_FOUND", 404);
    response.statusCode = 200;
    response.setHeader("Content-Type", result.blob.contentType);
    response.setHeader("Content-Disposition", "attachment");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "private, no-store");
    Readable.fromWeb(result.stream as unknown as import("node:stream/web").ReadableStream<Uint8Array>).pipe(response);
  } catch {
    jsonError(response, "ATTACHMENT_NOT_FOUND", 404);
  }
}
