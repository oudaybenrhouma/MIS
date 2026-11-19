import { LayoutGrid, List, Search, X } from "lucide-react";
import { useI18n } from "@/i18n";
import type { SortKey } from "@/services/catalog";

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const { t } = useI18n();
  return (
    <label className="relative block flex-1">
      <span className="sr-only">{t("nav.search")}</span>
      <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-mist" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field !h-12 !ps-10 !pe-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t("common.clear")}
          className="absolute end-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-mist hover:text-ink"
        >
          <X className="size-4" />
        </button>
      )}
    </label>
  );
}

export function SortSelect({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const { t } = useI18n();
  return (
    <label className="flex items-center gap-2">
      <span className="label hidden text-mist sm:block">{t("common.sortBy")}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="field !h-12 !w-auto !py-0 pe-8 font-semibold"
      >
        <option value="name">{t("catalogue.sortName")}</option>
        <option value="brand">{t("catalogue.sortBrand")}</option>
        <option value="ref">{t("catalogue.sortRef")}</option>
        <option value="category">{t("catalogue.sortCategory")}</option>
      </select>
    </label>
  );
}

export function ViewToggle({ value, onChange }: { value: "grid" | "list"; onChange: (v: "grid" | "list") => void }) {
  const { t } = useI18n();
  const base = "flex size-12 items-center justify-center transition-colors";
  return (
    <div className="hidden border-[1.5px] border-ink bg-white sm:flex" role="group">
      <button
        type="button"
        aria-pressed={value === "grid"}
        aria-label={t("common.grid")}
        onClick={() => onChange("grid")}
        className={`${base} ${value === "grid" ? "bg-ink text-white" : "hover:bg-ink/5"}`}
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        type="button"
        aria-pressed={value === "list"}
        aria-label={t("common.list")}
        onClick={() => onChange("list")}
        className={`${base} ${value === "list" ? "bg-ink text-white" : "hover:bg-ink/5"}`}
      >
        <List className="size-4" />
      </button>
    </div>
  );
}
