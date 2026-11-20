import { getDatabase } from "./_database.js";
import { isAdminAuthorized, jsonError, validAdminTokenConfigured, type ApiRequest, type ApiResponse } from "./_shared.js";

type OfferInput = {
  productId: string;
  retailEnabled: boolean;
  price: number | null;
  currency: "LYD" | "USD" | "EUR";
  quantityAvailable: number | null;
  salesUnit: string | null;
  minimumOrderQuantity: number;
};

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (request.method === "GET") return listOffers(request, response);
  if (request.method === "PATCH") return saveOffer(request, response);
  jsonError(response, "METHOD_NOT_ALLOWED", 405);
}

async function listOffers(request: ApiRequest, response: ApiResponse): Promise<void> {
  const url = new URL(request.url ?? "/", `https://${request.headers.host ?? "localhost"}`);
  const adminView = url.searchParams.get("admin") === "1";
  if (adminView && (!validAdminTokenConfigured() || !isAdminAuthorized(request))) return jsonError(response, "UNAUTHORIZED", 401);
  try {
    const sql = getDatabase();
    const rows = adminView
      ? await sql`SELECT product_id, retail_enabled, price, currency, quantity_available, sales_unit, minimum_order_quantity, updated_at FROM mis_product_offers ORDER BY updated_at DESC LIMIT 10000`
      : await sql`SELECT product_id, retail_enabled, price, currency, quantity_available, sales_unit, minimum_order_quantity, updated_at FROM mis_product_offers WHERE retail_enabled = true AND price IS NOT NULL`;
    response.setHeader("Cache-Control", adminView ? "private, no-store" : "public, max-age=60, stale-while-revalidate=300");
    response.status(200).json({ offers: rows });
  } catch {
    jsonError(response, process.env.DATABASE_URL ? "OFFERS_UNAVAILABLE" : "DATABASE_NOT_CONFIGURED", 503);
  }
}

async function saveOffer(request: ApiRequest, response: ApiResponse): Promise<void> {
  if (!validAdminTokenConfigured()) return jsonError(response, "ADMIN_NOT_CONFIGURED", 503);
  if (!isAdminAuthorized(request)) return jsonError(response, "UNAUTHORIZED", 401);
  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body) as unknown : request.body;
    if (!validOffer(body)) return jsonError(response, "INVALID_PRODUCT_OFFER", 400);
    const offer = body as OfferInput;
    const sql = getDatabase();
    const rows = await sql`
      INSERT INTO mis_product_offers
        (product_id, retail_enabled, price, currency, quantity_available, sales_unit, minimum_order_quantity, updated_at)
      VALUES
        (${offer.productId}, ${offer.retailEnabled}, ${offer.price}, ${offer.currency}, ${offer.quantityAvailable}, ${offer.salesUnit}, ${offer.minimumOrderQuantity}, now())
      ON CONFLICT (product_id) DO UPDATE SET
        retail_enabled = EXCLUDED.retail_enabled,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        quantity_available = EXCLUDED.quantity_available,
        sales_unit = EXCLUDED.sales_unit,
        minimum_order_quantity = EXCLUDED.minimum_order_quantity,
        updated_at = now()
      RETURNING product_id, retail_enabled, price, currency, quantity_available, sales_unit, minimum_order_quantity, updated_at
    `;
    response.setHeader("Cache-Control", "private, no-store");
    response.status(200).json({ offer: rows[0] });
  } catch (error) {
    if (error instanceof SyntaxError) return jsonError(response, "INVALID_JSON", 400);
    jsonError(response, process.env.DATABASE_URL ? "OFFER_SAVE_FAILED" : "DATABASE_NOT_CONFIGURED", 503);
  }
}

function validOffer(value: unknown): value is OfferInput {
  if (!record(value)) return false;
  const { productId, retailEnabled, price, currency, quantityAvailable, salesUnit, minimumOrderQuantity } = value;
  if (typeof productId !== "string" || !/^[A-Za-z0-9._-]{1,180}$/.test(productId) || typeof retailEnabled !== "boolean") return false;
  if (price !== null && (typeof price !== "number" || !Number.isFinite(price) || price <= 0 || price > 1_000_000_000)) return false;
  if (currency !== "LYD" && currency !== "USD" && currency !== "EUR") return false;
  if (quantityAvailable !== null && (typeof quantityAvailable !== "number" || !Number.isInteger(quantityAvailable) || quantityAvailable < 0 || quantityAvailable > 2_000_000_000)) return false;
  if (salesUnit !== null && (typeof salesUnit !== "string" || salesUnit.trim().length < 1 || salesUnit.length > 60)) return false;
  if (!Number.isInteger(minimumOrderQuantity) || (minimumOrderQuantity as number) < 1 || (minimumOrderQuantity as number) > 99999) return false;
  return !retailEnabled || (typeof price === "number" && Number.isInteger(quantityAvailable) && typeof salesUnit === "string" && salesUnit.trim().length > 0);
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
