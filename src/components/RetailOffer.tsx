import { useI18n } from "@/i18n";
import { useProductOffer } from "@/state/productOffers";

export function RetailOffer({ productId, compact = false }: { productId: string; compact?: boolean }) {
  const offer = useProductOffer(productId);
  const { lang, t } = useI18n();
  if (!offer) return null;
  const price = new Intl.NumberFormat(lang === "ar" ? "ar-LY" : "en-LY", {
    style: "currency", currency: offer.currency, maximumFractionDigits: 3,
  }).format(offer.price);
  const inStock = offer.quantityAvailable >= offer.minimumOrderQuantity;
  return (
    <div className={`border-s-2 border-signal bg-bone ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
      <p className={`font-bold ${compact ? "text-sm" : "text-lg"}`} dir="auto">{price} <span className="font-normal text-mist">/ {offer.salesUnit}</span></p>
      <p className="mt-1 text-xs text-mist">{inStock ? t("product.stockAvailable", { n: offer.quantityAvailable }) : t("product.stockUnavailable")}</p>
    </div>
  );
}
