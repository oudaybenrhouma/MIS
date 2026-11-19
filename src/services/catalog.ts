/**
 * Catalogue data-access layer.
 * ---------------------------------------------------------------
 * The UI only talks to these functions. They are synchronous over
 * local mock data today; when a backend exists, swap the bodies for
 * fetch() calls (and make the hooks async / use a data library).
 */
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import type { Lang, Product } from "@/data/types";

export type SortKey = "name" | "brand" | "ref" | "category";

export interface CatalogQuery {
  q?: string;
  categories?: string[];
  brands?: string[];
  sort?: SortKey;
}

/** Normalise Arabic + Latin text so that search is forgiving. */
export function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // tashkeel + tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // Arabic-Indic digits
    .trim();
}

const haystackCache = new Map<string, string>();
function haystack(p: Product): string {
  let h = haystackCache.get(p.id);
  if (!h) {
    const brand = brands.find((b) => b.slug === p.brand);
    const cat = categories.find((c) => c.slug === p.category);
    h = normalise(
      [
        p.ref,
        p.name.en,
        p.name.ar,
        p.description.en,
        p.description.ar,
        brand?.name,
        brand?.focus.en,
        brand?.focus.ar,
        cat?.name.en,
        cat?.name.ar,
      ]
        .filter(Boolean)
        .join(" ")
    );
    haystackCache.set(p.id, h);
  }
  return h;
}

function matches(p: Product, query: CatalogQuery, skip?: "categories" | "brands"): boolean {
  if (skip !== "categories" && query.categories?.length && !query.categories.includes(p.category)) return false;
  if (skip !== "brands" && query.brands?.length && !query.brands.includes(p.brand)) return false;
  if (query.q) {
    const tokens = normalise(query.q).split(/\s+/).filter(Boolean);
    const h = haystack(p);
    if (!tokens.every((t) => h.includes(t))) return false;
  }
  return true;
}

export function queryProducts(query: CatalogQuery, lang: Lang): Product[] {
  const list = products.filter((p) => matches(p, query));
  const sort = query.sort ?? "name";
  const brandName = (p: Product) => brands.find((b) => b.slug === p.brand)?.name ?? "";
  const catIndex = (p: Product) => categories.findIndex((c) => c.slug === p.category);
  const locale = lang === "ar" ? "ar" : "en";

  return [...list].sort((a, b) => {
    switch (sort) {
      case "brand":
        return brandName(a).localeCompare(brandName(b)) || a.ref.localeCompare(b.ref);
      case "ref":
        return a.ref.localeCompare(b.ref);
      case "category":
        return catIndex(a) - catIndex(b) || a.ref.localeCompare(b.ref);
      default:
        return a.name[lang].localeCompare(b.name[lang], locale);
    }
  });
}

/** Facet counts — each facet ignores its own selection so users can widen choices. */
export function facetCounts(query: CatalogQuery) {
  const cat: Record<string, number> = {};
  const brd: Record<string, number> = {};
  for (const p of products) {
    if (matches(p, query, "categories")) cat[p.category] = (cat[p.category] ?? 0) + 1;
    if (matches(p, query, "brands")) brd[p.brand] = (brd[p.brand] ?? 0) + 1;
  }
  return { categories: cat, brands: brd };
}

export const getProduct = (id: string) => products.find((p) => p.id === id);

export function getRelated(product: Product, limit = 4): Product[] {
  const score = (p: Product) => (p.brand === product.brand ? 2 : 0) + (p.category === product.category ? 3 : 0);
  return products
    .filter((p) => p.id !== product.id && score(p) > 0)
    .sort((a, b) => score(b) - score(a) || a.ref.localeCompare(b.ref))
    .slice(0, limit);
}

export const countProducts = (filter: { category?: string; brand?: string }) =>
  products.filter(
    (p) => (!filter.category || p.category === filter.category) && (!filter.brand || p.brand === filter.brand)
  ).length;

export function featuredProducts(limit = 8): Product[] {
  // Show the breadth of the supplied portfolio before repeating a brand.
  const seenBrands = new Set<string>();
  const first: Product[] = [];
  for (const p of products) {
    if (!seenBrands.has(p.brand)) {
      seenBrands.add(p.brand);
      first.push(p);
    }
  }
  if (first.length >= limit) return first.slice(0, limit);
  const seenProducts = new Set(first.map((product) => product.id));
  for (const p of products) {
    if (!seenProducts.has(p.id)) {
      seenProducts.add(p.id);
      first.push(p);
      if (first.length >= limit) break;
    }
  }
  return first;
}

export function brandsInCategory(slug: string) {
  const slugs = new Set(products.filter((p) => p.category === slug).map((p) => p.brand));
  return brands.filter((b) => slugs.has(b.slug));
}

export function categoriesForBrand(slug: string) {
  const slugs = new Set(products.filter((p) => p.brand === slug).map((p) => p.category));
  return categories.filter((c) => slugs.has(c.slug));
}
