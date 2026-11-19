import catalogue from "./source-products.json";
import type { Product } from "./types";

/** Product rows imported from the supplier databases provided to MIS. */
export const products = catalogue as Product[];
