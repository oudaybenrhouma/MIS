import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ProductOffer = {
  productId: string;
  retailEnabled: boolean;
  price: number;
  currency: "LYD" | "USD" | "EUR";
  quantityAvailable: number;
  salesUnit: string;
  minimumOrderQuantity: number;
  updatedAt: string;
};

type ProductOfferContextValue = { offers: Map<string, ProductOffer>; refresh: () => Promise<void> };
const ProductOfferContext = createContext<ProductOfferContextValue>({ offers: new Map(), refresh: async () => {} });

export function ProductOfferProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Map<string, ProductOffer>>(new Map());
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/product-offers", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { offers: Record<string, unknown>[] };
      const next = new Map<string, ProductOffer>();
      for (const row of data.offers) {
        const offer = {
          productId: String(row.product_id), retailEnabled: Boolean(row.retail_enabled), price: Number(row.price),
          currency: row.currency as ProductOffer["currency"], quantityAvailable: Number(row.quantity_available),
          salesUnit: String(row.sales_unit), minimumOrderQuantity: Number(row.minimum_order_quantity), updatedAt: String(row.updated_at),
        };
        if (offer.productId && offer.retailEnabled && Number.isFinite(offer.price) && Number.isFinite(offer.quantityAvailable)) next.set(offer.productId, offer);
      }
      setOffers(next);
    } catch {
      // RFQ browsing remains available if the optional retail-offer service is down.
    }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const value = useMemo(() => ({ offers, refresh }), [offers, refresh]);
  return <ProductOfferContext.Provider value={value}>{children}</ProductOfferContext.Provider>;
}

export function useProductOffer(productId: string) {
  return useContext(ProductOfferContext).offers.get(productId);
}

export function useProductOffers() {
  return useContext(ProductOfferContext);
}
