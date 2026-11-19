import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { useI18n } from "@/i18n";
import type { Product } from "@/data/types";
import { ProductCard } from "./ProductCard";

const PAGE = 12;

export function ProductGrid({
  products,
  view = "grid",
  columns = "xl:grid-cols-4",
  resetKey,
}: {
  products: Product[];
  view?: "grid" | "list";
  columns?: string;
  /** Changing this value resets pagination (e.g. serialised filters). */
  resetKey?: string;
}) {
  const { t, n } = useI18n();
  const [visible, setVisible] = useState(PAGE);

  useEffect(() => setVisible(PAGE), [resetKey]);

  if (!products.length) {
    return (
      <div className="flex flex-col items-center border border-dashed border-ink/25 bg-white/60 px-6 py-16 text-center">
        <SearchX className="size-10 text-mist" strokeWidth={1.25} />
        <h3 className="mt-4 text-xl font-bold">{t("catalogue.noResultsTitle")}</h3>
        <p className="mt-2 max-w-md text-ink/60">{t("catalogue.noResultsText")}</p>
        <Link to="/quote/request" className="btn btn-ink mt-6">
          {t("catalogue.customRequest")}
        </Link>
      </div>
    );
  }

  const shown = products.slice(0, visible);
  return (
    <div>
      <div className={view === "grid" ? `grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 ${columns}` : "flex flex-col gap-3"}>
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} view={view} />
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="mono text-xs text-mist">{t("common.showing", { a: n(shown.length), b: n(products.length) })}</p>
        {visible < products.length && (
          <button className="btn btn-line" onClick={() => setVisible((v) => v + PAGE)}>
            {t("common.loadMore")}
          </button>
        )}
      </div>
    </div>
  );
}
