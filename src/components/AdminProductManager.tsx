import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { products } from "@/data/products";
import { getBrand } from "@/data/brands";
import { normalise } from "@/services/catalog";
import { useProductOffers, type ProductOffer } from "@/state/productOffers";

type OfferRow = {
  product_id: string;
  retail_enabled: boolean;
  price: number | string | null;
  currency: "LYD" | "USD" | "EUR";
  quantity_available: number | null;
  sales_unit: string | null;
  minimum_order_quantity: number;
  updated_at: string;
};

const blankForm = { retailEnabled: false, price: "", currency: "LYD" as ProductOffer["currency"], quantity: "", salesUnit: "", minimum: "1" };

export function AdminProductManager({ token }: { token: string }) {
  const [rows, setRows] = useState<OfferRow[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { refresh } = useProductOffers();

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/product-offers?admin=1", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (response.status === 401) throw new Error("Admin key expired. Sign out and sign in again.");
        if (!response.ok) throw new Error("Could not load product retail settings. Check the database migration is applied.");
        const data = await response.json() as { offers: OfferRow[] };
        if (active) setRows(data.offers);
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Could not load product retail settings."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [token]);

  const found = useMemo(() => {
    const q = normalise(query);
    if (!q) return products.slice(0, 30);
    return products.filter((product) => normalise(`${product.ref} ${product.id} ${product.name.en} ${product.name.ar} ${getBrand(product.brand)?.name ?? ""}`).includes(q)).slice(0, 50);
  }, [query]);
  const selected = products.find((product) => product.id === selectedId) ?? found[0] ?? null;
  const offerById = useMemo(() => new Map(rows.map((row) => [row.product_id, row])), [rows]);
  const activeCount = rows.filter((row) => row.retail_enabled).length;

  useEffect(() => {
    if (!selected) { setForm(blankForm); return; }
    const row = offerById.get(selected.id);
    setForm(row ? {
      retailEnabled: row.retail_enabled, price: row.price === null ? "" : String(row.price), currency: row.currency,
      quantity: row.quantity_available === null ? "" : String(row.quantity_available), salesUnit: row.sales_unit ?? "",
      minimum: String(row.minimum_order_quantity),
    } : blankForm);
    setNotice("");
  }, [selected?.id, offerById]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const price = form.price.trim() ? Number(form.price) : null;
    const quantity = form.quantity.trim() ? Number(form.quantity) : null;
    const minimumOrderQuantity = Number(form.minimum);
    if (form.retailEnabled && (price === null || !Number.isFinite(price) || price <= 0 || !Number.isInteger(quantity) || !form.salesUnit.trim() || !Number.isInteger(minimumOrderQuantity) || minimumOrderQuantity < 1)) {
      setError("To enable retail, enter a confirmed price, whole-number stock quantity, sales unit, and minimum order quantity.");
      return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/product-offers", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected.id, retailEnabled: form.retailEnabled, price,
          currency: form.currency, quantityAvailable: quantity, salesUnit: form.salesUnit.trim() || null,
          minimumOrderQuantity: Number.isInteger(minimumOrderQuantity) && minimumOrderQuantity > 0 ? minimumOrderQuantity : 1,
        }),
      });
      if (!response.ok) throw new Error(response.status === 401 ? "Admin key expired. Sign out and sign in again." : "Could not save this product's retail settings.");
      const data = await response.json() as { offer: OfferRow };
      setRows((current) => [...current.filter((row) => row.product_id !== data.offer.product_id), data.offer]);
      setNotice(form.retailEnabled ? "Retail offer saved. The price and stock will appear on the public catalogue." : "Product saved as quote-only. Public pricing and stock are hidden.");
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save product settings."); }
    finally { setSaving(false); }
  }

  return <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.3fr)]">
    <section className="border border-line bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="display text-2xl">Product catalogue</h2><span className="label text-mist">{activeCount} retail</span></div>
      <label className="relative block"><span className="sr-only">Search catalogue</span><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-mist"/><input className="field ps-10" value={query} onChange={(event) => { setQuery(event.target.value); setSelectedId(""); }} placeholder="Search name, brand, or reference"/></label>
      <div className="mt-3 max-h-[65vh] space-y-1 overflow-y-auto">{found.map((product) => {
        const row = offerById.get(product.id);
        const brand = getBrand(product.brand);
        return <button key={product.id} type="button" onClick={() => setSelectedId(product.id)} className={`flex w-full items-center gap-3 border p-2 text-start ${selected?.id === product.id ? "border-ink bg-paper" : "border-transparent hover:border-line hover:bg-bone"}`}>
          <img src={product.image ?? undefined} alt="" loading="lazy" className="size-12 shrink-0 bg-paper object-contain"/>
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{product.name.en}</span><span className="mono block truncate text-[10px] text-mist">{brand?.name} · {product.ref}</span></span>
          <span className={`label shrink-0 ${row?.retail_enabled ? "text-signal" : "text-mist"}`}>{row?.retail_enabled ? "Retail" : "Quote"}</span>
        </button>;
      })}{!found.length && <p className="p-5 text-sm text-mist">No products match that search.</p>}</div>
      <p className="mt-3 text-xs text-mist">Showing up to 50 matching products. All {products.length.toLocaleString()} supplier catalogue items remain quote-only until explicitly enabled.</p>
    </section>

    {selected ? <form onSubmit={save} className="border border-line bg-white p-5 md:p-7">
      <p className="label mb-2 text-signal">Offer settings</p><h2 className="display text-2xl">{selected.name.en}</h2><p className="mono mt-2 text-xs text-mist">{selected.ref} · {selected.id}</p>
      <div className="mt-6 flex items-start gap-3 border border-line bg-bone p-4"><input id="retail-enabled" type="checkbox" checked={form.retailEnabled} onChange={(event) => setForm({ ...form, retailEnabled: event.target.checked })} className="mt-1 size-4 accent-[var(--color-signal)]"/><label htmlFor="retail-enabled"><span className="block font-semibold">Show as a retail offer</span><span className="mt-1 block text-xs leading-5 text-mist">Only enable after MIS confirms price, available stock, and sales unit. Otherwise the item stays quote-only.</span></label></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Retail price"><input className="field" type="number" min="0.001" step="0.001" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Leave blank until confirmed"/></Field>
        <Field label="Currency"><select className="field" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value as ProductOffer["currency"] })}><option value="LYD">LYD — Libyan dinar</option><option value="USD">USD — US dollar</option><option value="EUR">EUR — Euro</option></select></Field>
        <Field label="Available quantity"><input className="field" type="number" min="0" step="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="Leave blank if unknown"/></Field>
        <Field label="Sales unit"><input className="field" maxLength={60} value={form.salesUnit} onChange={(event) => setForm({ ...form, salesUnit: event.target.value })} placeholder="e.g. piece, box of 10"/></Field>
        <Field label="Minimum order quantity"><input className="field" type="number" min="1" step="1" value={form.minimum} onChange={(event) => setForm({ ...form, minimum: event.target.value })}/></Field>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3"><button className="btn btn-red" disabled={saving || loading}>{saving ? "Saving…" : "Save product settings"}</button>{loading && <span className="text-sm text-mist">Loading current offers…</span>}</div>
      {error && <p role="alert" className="mt-4 border-s-2 border-signal bg-red-50 p-3 text-sm text-signal-deep">{error}</p>}{notice && <p role="status" className="mt-4 border-s-2 border-green-700 bg-green-50 p-3 text-sm text-green-900">{notice}</p>}
      <p className="mt-6 border-t border-line pt-4 text-xs leading-5 text-mist">Retail settings only publish price and stock. The website does not take payment or promise delivery yet; those terms will be confirmed with customers.</p>
    </form> : <div className="grid min-h-64 place-items-center border border-line bg-white p-8 text-sm text-mist">Select a product to review its retail settings.</div>}
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2 text-sm font-semibold">{label}{children}</label>;
}
