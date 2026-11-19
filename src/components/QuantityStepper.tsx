import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n";

export function QuantityStepper({
  value,
  onChange,
  onRemove,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  /** When provided, the minus button becomes a remove button at quantity 1. */
  onRemove?: () => void;
  size?: "sm" | "md";
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (Number.isFinite(n) && n >= 1) onChange(n);
    else setDraft(String(value));
  };

  const h = size === "sm" ? "h-9" : "h-12";
  const btn = `${h} ${size === "sm" ? "w-9" : "w-11"} flex shrink-0 items-center justify-center transition-colors hover:bg-ink hover:text-white`;
  const removing = value <= 1 && onRemove;

  return (
    <div className={`inline-flex ${h} items-stretch border-[1.5px] border-ink bg-white`} dir="ltr">
      <button
        type="button"
        className={btn}
        aria-label={removing ? t("common.remove") : t("common.decrease")}
        onClick={() => (removing ? onRemove!() : onChange(Math.max(1, value - 1)))}
      >
        {removing ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
      </button>
      <input
        inputMode="numeric"
        aria-label={t("common.quantity")}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 5))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur(), undefined)}
        className={`mono ${size === "sm" ? "w-10 text-sm" : "w-14"} border-x-[1.5px] border-ink bg-transparent text-center font-semibold outline-none focus:bg-signal/10`}
      />
      <button type="button" className={btn} aria-label={t("common.increase")} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}
