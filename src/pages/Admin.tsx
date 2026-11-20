import { useEffect, useMemo, useState } from "react";
import { Download, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import type { RfqPayload } from "@/services/rfq";
import { AdminProductManager } from "@/components/AdminProductManager";

type Submission = {
  reference: string;
  submitted_at: string;
  status: "new" | "reviewing" | "quoted" | "closed";
  payload: RfqPayload;
};

const TOKEN_KEY = "mis.rfq.admin-token.v1";

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? "");
  const [draft, setDraft] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [nextBefore, setNextBefore] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [view, setView] = useState<"rfqs" | "products">("rfqs");

  async function load(auth = token, before?: string, append = false) {
    if (!auth) return;
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ limit: "50" });
      if (before) query.set("before", before);
      const response = await fetch(`/api/rfqs?${query}`, { headers: { Authorization: `Bearer ${auth}` }, cache: "no-store" });
      if (response.status === 401) throw new Error("That admin key was not accepted. Check the key and try again.");
      if (!response.ok) throw new Error(response.status === 503 ? "The request service is unavailable. Check the server configuration." : "Could not load quote requests.");
      const data = await response.json() as { submissions: Submission[]; nextBefore: string | null };
      setSubmissions((current) => append ? [...current, ...data.submissions.filter((row) => !current.some((item) => item.reference === row.reference))] : data.submissions);
      setNextBefore(data.nextBefore);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load quote requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) void load(token); /* load once when the session token is restored */ }, []);

  function login(event: React.FormEvent) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    sessionStorage.setItem(TOKEN_KEY, value);
    setToken(value);
    void load(value);
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(""); setDraft(""); setSubmissions([]); setSelected(null); setNextBefore(null); setError(""); setView("rfqs");
  }

  async function download(path: string, name: string) {
    try {
      const response = await fetch(`/api/rfq-attachments?path=${encodeURIComponent(path)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error(response.status === 401 ? "Admin key expired. Sign in again." : "Attachment download failed.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = name; link.click();
      URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Attachment download failed."); }
  }

  async function updateStatus(row: Submission, status: Submission["status"]) {
    if (row.status === status) return;
    setUpdatingStatus(true); setError("");
    try {
      const response = await fetch("/api/rfqs", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reference: row.reference, status }),
      });
      if (!response.ok) throw new Error(response.status === 401 ? "Admin key expired. Sign in again." : "Could not update request status.");
      const updated = await response.json() as { status: Submission["status"] };
      setSubmissions((current) => current.map((item) => item.reference === row.reference ? { ...item, status: updated.status } : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update request status."); }
    finally { setUpdatingStatus(false); }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? submissions.filter((row) => [row.reference, row.payload.contact.name, row.payload.contact.email, row.payload.company.name].some((value) => value.toLowerCase().includes(q))) : submissions;
  }, [submissions, search]);
  const active = submissions.find((row) => row.reference === selected) ?? filtered[0];

  return <main className="min-h-screen bg-paper text-ink">
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="Master Industrial Supplies home">
          <span className="grid h-10 w-10 place-items-center bg-ink text-lg font-black text-white">M<span className="text-signal">/</span>S</span>
          <span><span className="block text-sm font-extrabold uppercase tracking-wide">Master Industrial Supplies</span><span className="label text-mist">Quote request admin</span></span>
        </a>
        {token && <div className="flex items-center gap-2">{view === "rfqs" ? <><button onClick={() => setView("products")} className="btn btn-line btn-sm">Retail products</button><button onClick={() => void load()} disabled={loading} className="btn btn-line btn-sm"><RefreshCw size={15} className={loading ? "spin" : ""}/> Refresh</button></> : <button onClick={() => setView("rfqs")} className="btn btn-line btn-sm">Quote requests</button>}<button onClick={logout} className="btn btn-ink btn-sm"><LogOut size={15}/> Sign out</button></div>}
      </div>
    </header>
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      {!token ? <section className="mx-auto max-w-lg border border-line bg-white p-7 shadow-sm md:p-10">
        <ShieldCheck className="mb-5 text-signal" size={30}/><p className="label mb-3 text-signal">Restricted area</p><h1 className="display mb-4 text-4xl">Admin sign in</h1><p className="mb-7 text-sm leading-6 text-steel">Enter the RFQ admin key to view quote requests and securely download their attachments.</p>
        <form onSubmit={login} className="space-y-4"><label className="block text-sm font-semibold" htmlFor="admin-key">Admin key</label><input id="admin-key" className="field" type="password" autoComplete="current-password" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Paste admin key" required/><button className="btn btn-red w-full" type="submit" disabled={loading}>{loading ? "Checking…" : "Open dashboard"}</button></form>
        {error && <p role="alert" className="mt-4 border-l-2 border-signal bg-red-50 p-3 text-sm text-signal-deep">{error}</p>}
      </section> : view === "products" ? <section><div className="mb-6"><p className="label mb-2 text-signal">Sales workspace</p><h1 className="display text-4xl md:text-5xl">Retail products</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-mist">Publish a product only after its price, sale unit, and stock count are confirmed. Every other item remains quote-only.</p></div><AdminProductManager token={token}/></section> : <>
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="label mb-2 text-signal">Sales workspace</p><h1 className="display text-4xl md:text-5xl">Quote requests</h1><p className="mt-3 text-sm text-mist">{submissions.length} loaded · newest first</p></div><input aria-label="Search quote requests" className="field max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, company, reference…"/></div>
        {error && <p role="alert" className="mb-5 border-l-2 border-signal bg-red-50 p-3 text-sm text-signal-deep">{error}</p>}
        {loading && submissions.length === 0 ? <p className="border border-line bg-white p-8 text-sm">Loading quote requests…</p> : <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)]">
          <section aria-label="Requests" className="space-y-2">{filtered.map((row) => <button key={row.reference} onClick={() => setSelected(row.reference)} className={`w-full border p-4 text-left transition ${active?.reference === row.reference ? "border-ink bg-white shadow-sm" : "border-line bg-bone hover:border-mist"}`}><div className="mb-2 flex items-center justify-between gap-3"><span className="mono text-xs font-semibold">{row.reference}</span><span className="label text-mist">{row.status}</span></div><p className="font-semibold">{row.payload.contact.name}</p><p className="mt-1 truncate text-sm text-steel">{row.payload.company.name} · {row.payload.contact.email}</p><p className="label mt-3 text-mist">{new Date(row.submitted_at).toLocaleString()}</p></button>)}{!filtered.length && <div className="border border-line bg-white p-6 text-sm text-mist">{submissions.length ? "No requests match your search." : "No quote requests have been submitted yet."}</div>}{nextBefore && <button className="btn btn-line w-full" onClick={() => void load(token, nextBefore, true)} disabled={loading}>{loading ? "Loading…" : "Load older requests"}</button>}</section>
          {active ? <article className="border border-line bg-white p-5 md:p-8"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-5"><div><p className="label mb-2 text-signal">{active.status}</p><h2 className="mono text-xl font-bold">{active.reference}</h2><p className="mt-2 text-sm text-mist">Received {new Date(active.submitted_at).toLocaleString()}</p></div><div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor="rfq-status">Update request status</label><select id="rfq-status" className="field min-w-36 py-2 text-sm" value={active.status} onChange={(event) => void updateStatus(active, event.target.value as Submission["status"])} disabled={updatingStatus}><option value="new">New</option><option value="reviewing">Reviewing</option><option value="quoted">Quoted</option><option value="closed">Closed</option></select><span className="bg-paper px-3 py-2 text-sm font-semibold">{active.payload.delivery.currency} · {active.payload.delivery.urgency}</span></div></div>
            <div className="grid gap-6 py-6 sm:grid-cols-2"><Info title="Contact" lines={[active.payload.contact.name, active.payload.contact.jobTitle, active.payload.contact.email, active.payload.contact.phone, active.payload.contact.whatsapp ? "WhatsApp available" : ""]}/><Info title="Company" lines={[active.payload.company.name, active.payload.company.sector, active.payload.company.registry]}/><Info title="Delivery" lines={[active.payload.delivery.city, active.payload.delivery.address, active.payload.delivery.method, active.payload.delivery.requiredBy ? `Required by ${active.payload.delivery.requiredBy}` : ""]}/></div>
            <section className="border-t border-line py-5"><h3 className="label mb-3">Requested items · {active.payload.items.length}</h3>{active.payload.items.length ? <div className="divide-y divide-line">{active.payload.items.map((item, index) => <div key={`${item.productId}-${index}`} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><div><p className="font-semibold">{item.name}</p><p className="text-mist">{item.brand} · {item.ref}{item.note ? ` · ${item.note}` : ""}</p></div><span className="mono">Qty {item.qty}</span></div>)}</div> : <p className="text-sm text-mist">No catalog items listed.</p>}{active.payload.requirements && <p className="mt-4 whitespace-pre-wrap border-l-2 border-signal bg-bone p-4 text-sm leading-6">{active.payload.requirements}</p>}</section>
            {!!active.payload.attachments.length && <section className="border-t border-line pt-5"><h3 className="label mb-3">Attachments · {active.payload.attachments.length}</h3><div className="flex flex-wrap gap-2">{active.payload.attachments.map((file) => <button key={file.path} onClick={() => void download(file.path, file.name)} className="btn btn-line btn-sm"><Download size={15}/>{file.name} ({Math.ceil(file.size / 1024)} KB)</button>)}</div></section>}
          </article> : <div className="grid min-h-64 place-items-center border border-line bg-white p-8 text-center text-sm text-mist">Select a request to view its details.</div>}
        </div>}
      </>}
    </div>
  </main>;
}

function Info({ title, lines }: { title: string; lines: string[] }) {
  return <section><h3 className="label mb-2 text-mist">{title}</h3>{lines.filter(Boolean).map((line, index) => <p key={index} className="break-words text-sm leading-6">{line}</p>)}</section>;
}
