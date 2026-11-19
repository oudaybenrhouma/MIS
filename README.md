# MIS — Master Industrial Supplies

React, TypeScript, Vite and Tailwind website for the MIS product catalogue and request-for-quotation flow. Arabic is the default language; English is also available.

## Catalogue data

The catalogue includes 9,238 product records imported from the supplier database provided to MIS: HAZET, VIGOR, Wera, WSP, ECS and RENNSTEIG. The Brands page also lists Djois | Tarifold and NOVAP, which have product images in the supplied folder but no structured product list.

Supplier prices and stock levels were not present in the supplied data. The website therefore keeps its request-for-quotation flow and does not display prices or claim availability. Product names are preserved in their source language when translations were not supplied.

The imported records are in `src/data/source-products.json`; 9,157 of the 9,238 product records have a local image, using 8,768 distinct source photos in `public/catalog/`. JPEG photos are resized to 700 px and compressed for web delivery. The rest of the website reads products through `src/services/catalog.ts`.

To re-import from the source folder, export the RENNSTEIG workbook and run the importer:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/export-openxml-catalogues.ps1 -SourceRoot "C:\path\to\IDS database\IDS database" -OutputFile ".catalog-import\rennsteig.json"
node scripts/import-source-catalog.mjs "C:\path\to\IDS database\IDS database"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/optimize-catalog-images.ps1 -ManifestFile ".catalog-import\image-manifest.json" -OutputDirectory "public\catalog" -Prune
```

The importer matches product references to the available source photos; the optimizer converts matching images to web-sized JPEGs and prunes stale catalog photos. It does not copy the full multi-gigabyte image archive.

## Business details and RFQ backend

- `src/config/site.ts` holds phone, WhatsApp, email, address, hours, map, and attachment settings. Empty contact fields show placeholders.
- Quote requests are accepted by Vercel Functions in `api/`, stored in Neon Postgres, and their attachments go to a private Vercel Blob store. Confirmation details stay in the visitor's current browser session.
- Create a Neon database and a **private** Blob store from the Vercel project's Storage tab. Set `DATABASE_URL` and `RFQ_ADMIN_TOKEN` for the project; link the Blob store so Vercel provides `BLOB_READ_WRITE_TOKEN` (and `BLOB_STORE_ID` where required). Set all variables in Production, Preview, and Development as needed.
- Run `database/schema.sql` in the Neon SQL Editor before accepting quote requests. The API returns HTTP 503 with a clear form message until database and Blob credentials are connected.
- For local development, use `vercel env pull .env.local` and `vercel dev` so the API functions and storage bindings are available. `npm run dev` serves only the Vite frontend.
- Admin-only API: `GET /api/rfqs` lists recent requests, and `GET /api/rfq-attachments?path=...` downloads an attachment. Both require `Authorization: Bearer <RFQ_ADMIN_TOKEN>`; keep this token private.

## Development

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Vercel serves the Vite build from `dist` and rewrites direct page requests to the single-page app entry point.
