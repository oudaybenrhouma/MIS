# MIS — Master Industrial Supplies

React, TypeScript, Vite and Tailwind website for the MIS product catalogue and request-for-quotation flow. Arabic is the default language; English is also available.

## Catalogue data

The catalogue includes 9,238 product records imported from the supplier database provided to MIS: HAZET, VIGOR, Wera, WSP, ECS and RENNSTEIG. The Brands page also lists Djois | Tarifold and NOVAP, which have product images in the supplied folder but no structured product list.

Supplier prices and stock levels were not present in the supplied data. The website therefore keeps its request-for-quotation flow and does not display prices or claim availability. Product names are preserved in their source language when translations were not supplied.

The imported records are in `src/data/source-products.json`; selected supplier product photos are in `public/catalog/`. The rest of the website reads products through `src/services/catalog.ts`.

To re-import from the source folder, export the RENNSTEIG workbook and run the importer:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/export-openxml-catalogues.ps1 -SourceRoot "C:\path\to\IDS database\IDS database" -OutputFile ".catalog-import\rennsteig.json"
node scripts/import-source-catalog.mjs "C:\path\to\IDS database\IDS database"
```

The importer copies a representative set of product photos into the site; it does not copy the full multi-gigabyte image archive.

## Business details and RFQ backend

- `src/config/site.ts` holds phone, WhatsApp, email, address, hours, map, and attachment settings. Empty contact fields show placeholders.
- `src/services/rfq.ts` currently stores requests in the browser. Connect it to a server endpoint before using it as a production RFQ inbox.

## Development

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Vercel serves the Vite build from `dist` and rewrites direct page requests to the single-page app entry point.
