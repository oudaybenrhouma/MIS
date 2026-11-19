import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { useI18n } from "@/i18n";
import { useQuote } from "@/state/quote";
import { useToast } from "@/state/toast";
import type { Product } from "@/data/types";
import { QuantityStepper } from "./QuantityStepper";

/** Add-to-quotation control. `compact` for cards, `full` for the product page. */
export function AddToQuote({ product, variant = "compact" }: { product: Product; variant?: "compact" | "full" }) {
  const { t, tr } = useI18n();
  const quote = useQuote();
  const toast = useToast();
  const [draftQty, setDraftQty] = useState(1);
  const inList = quote.has(product.id);
  const qty = quote.qtyOf(product.id);

  const add = (n = 1) => {
    quote.add(product.id, n);
    toast.push(`${t("common.added")}: ${tr(product.name)}`, { label: t("common.viewList"), to: "/quote" });
  };

  if (variant === "full") {
    if (!inList) {
      return (
        <div className="flex flex-wrap items-stretch gap-3">
          <QuantityStepper value={draftQty} onChange={setDraftQty} />
          <button type="button" className="btn btn-red h-12 flex-1 basis-48" onClick={() => add(draftQty)}>
            <Plus className="size-4" /> {t("common.add")}
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-stretch gap-3">
          <QuantityStepper value={qty} onChange={(n) => quote.setQty(product.id, n)} />
          <Link to="/quote" className="btn btn-ink h-12 flex-1 basis-48">
            <Check className="size-4" /> {t("common.inList")} · {t("common.viewList")}
          </Link>
        </div>
        <button
          type="button"
          onClick={() => quote.remove(product.id)}
          className="text-sm text-mist underline underline-offset-4 hover:text-signal"
        >
          {t("common.remove")}
        </button>
      </div>
    );
  }

  if (!inList) {
    return (
      <button type="button" className="btn btn-ink btn-sm w-full" onClick={() => add(1)}>
        <Plus className="size-3.5" /> {t("common.addShort")}
      </button>
    );
  }
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-signal">
        <Check className="size-3.5" /> {t("common.inList")}
      </span>
      <QuantityStepper
        size="sm"
        value={qty}
        onChange={(n) => quote.setQty(product.id, n)}
        onRemove={() => quote.remove(product.id)}
      />
    </div>
  );
}
