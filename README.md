# MIS — Master Industrial Supplies (RFQ catalogue)

React + Vite + Tailwind. Arabic (default, RTL) and English (LTR). A quotation platform — no checkout, no prices, no stock.

## 1. Add the official logo
Drop the **unmodified** file at `src/assets/brand/mis-logo.png` (`.svg`, `.jpg`, `.webp` also work).
It is used as-is everywhere (height-constrained only). Until then a neutral dashed placeholder is shown.

## 2. Fill in business details
`src/config/site.ts` — phone, WhatsApp (digits, e.g. `218910000000`), email, address, hours, map embed URL,
attachment limits. Empty values render as clearly marked placeholders.

## 3. Connect the real catalogue
- `src/data/brands.ts`, `categories.ts` — add entries; menus, filters, counts and pages follow automatically.
- `src/data/products.ts` — replace the generated placeholder rows (same `Product` shape, set `placeholder: false`,
  add `image` URLs and `specs`).
- `src/services/catalog.ts` — the only module the UI uses to read products. Swap its bodies for API calls.

## 4. Connect the RFQ backend
`src/services/rfq.ts` — `submitRfq()` currently stores the request in `localStorage` and returns a reference
(`MIS-RFQ-YYMMDD-XXXX`). POST the payload + files to `siteConfig.rfq.endpoint` and return the server reference.

## Structure
```
src/config     site configuration
src/data       typed bilingual data (brands, categories, products, cities)
src/i18n       en / ar dictionaries + provider (dir/lang switching)
src/state      quotation list (reducer + localStorage), toasts
src/services   catalogue + RFQ data-access layer
src/components shared UI      src/pages routes
```
