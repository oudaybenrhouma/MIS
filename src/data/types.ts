export type Lang = "ar" | "en";

/** Localised string. Every piece of catalogue content is bilingual. */
export type L = { ar: string; en: string };

export type CategoryIconName =
  | "ruler"
  | "droplets"
  | "zap"
  | "shield"
  | "cog"
  | "box"
  | "gauge"
  | "wrench";

export interface Category {
  slug: string;
  /** Two-letter drawing code, e.g. "MC" */
  code: string;
  icon: CategoryIconName;
  name: L;
  short: L;
  description: L;
}

export interface Brand {
  slug: string;
  name: string;
  monogram: string;
  focus: L;
  description: L;
  /** category slugs */
  categories: string[];
}

export interface ProductSpec {
  label: L;
  value: L;
}

export interface Product {
  id: string;
  ref: string;
  brand: string; // brand slug
  category: string; // category slug
  name: L;
  description: L;
  /** Real catalogue images go here later. null → neutral placeholder is rendered. */
  image: string | null;
  specs: ProductSpec[];
  /** Flag so real catalogue rows can drop it. */
  placeholder: boolean;
}

export interface QuoteItem {
  productId: string;
  qty: number;
  note: string;
}
