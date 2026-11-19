import { randomUUID } from "node:crypto";
import { get, issueSignedToken, presignUrl } from "@vercel/blob";
import { attachmentTypes, isAdminAuthorized, jsonError, MAX_ATTACHMENT_BYTES, validAdminTokenConfigured } from "./_shared.js";

const pathnamePattern = /^rfq-attachments\/[0-9a-f-]{36}\.[a-z0-9]{1,8}$/i;

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "POST") return createUploadUrl(request);
  if (request.method === "GET") return downloadAttachment(request);
  return jsonError("METHOD_NOT_ALLOWED", 405);
}

async function createUploadUrl(request: Request): Promise<Response> {
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    return jsonError("BLOB_NOT_CONFIGURED", 503);
  }

  try {
    const body = (await request.json()) as { name?: unknown; size?: unknown };
    if (typeof body.name !== "string" || typeof body.size !== "number") return jsonError("INVALID_FILE", 400);

    const extension = body.name.split(".").pop()?.toLowerCase() ?? "";
    const contentType = attachmentTypes[extension];
    if (!contentType) return jsonError("FILE_TYPE_NOT_ALLOWED", 400);
    if (!Number.isInteger(body.size) || body.size < 1 || body.size > MAX_ATTACHMENT_BYTES) {
      return jsonError("FILE_SIZE_NOT_ALLOWED", 400);
    }

    const pathname = `rfq-attachments/${randomUUID()}.${extension}`;
    const validUntil = Date.now() + 5 * 60 * 1000;
    const signedToken = await issueSignedToken({
      pathname,
      operations: ["put"],
      allowedContentTypes: [contentType],
      maximumSizeInBytes: Math.min(body.size, MAX_ATTACHMENT_BYTES),
      validUntil,
    });
    const { presignedUrl } = await presignUrl(signedToken, {
      operation: "put",
      pathname,
      access: "private",
      allowedContentTypes: [contentType],
      maximumSizeInBytes: Math.min(body.size, MAX_ATTACHMENT_BYTES),
      validUntil,
      addRandomSuffix: false,
      allowOverwrite: false,
    });

    return Response.json({ pathname, presignedUrl, contentType }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError("UPLOAD_URL_FAILED", 503);
  }
}

async function downloadAttachment(request: Request): Promise<Response> {
  if (!validAdminTokenConfigured()) return jsonError("ADMIN_NOT_CONFIGURED", 503);
  if (!isAdminAuthorized(request)) return jsonError("UNAUTHORIZED", 401);

  const pathname = new URL(request.url).searchParams.get("path") ?? "";
  if (!pathnamePattern.test(pathname)) return jsonError("INVALID_ATTACHMENT", 400);

  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200) return jsonError("ATTACHMENT_NOT_FOUND", 404);
    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Content-Disposition": "attachment",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return jsonError("ATTACHMENT_NOT_FOUND", 404);
  }
}
