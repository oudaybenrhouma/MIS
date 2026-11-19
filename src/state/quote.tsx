import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { QuoteItem } from "@/data/types";

const STORAGE_KEY = "mis.quote.v1";
const MAX_QTY = 99999;

type Action =
  | { type: "add"; productId: string; qty: number }
  | { type: "setQty"; productId: string; qty: number }
  | { type: "setNote"; productId: string; note: string }
  | { type: "remove"; productId: string }
  | { type: "clear" };

const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.floor(Number.isFinite(n) ? n : 1)));

function reducer(state: QuoteItem[], action: Action): QuoteItem[] {
  switch (action.type) {
    case "add": {
      const existing = state.find((i) => i.productId === action.productId);
      if (existing) {
        return state.map((i) =>
          i.productId === action.productId ? { ...i, qty: clampQty(i.qty + action.qty) } : i
        );
      }
      return [...state, { productId: action.productId, qty: clampQty(action.qty), note: "" }];
    }
    case "setQty":
      return state.map((i) => (i.productId === action.productId ? { ...i, qty: clampQty(action.qty) } : i));
    case "setNote":
      return state.map((i) => (i.productId === action.productId ? { ...i, note: action.note } : i));
    case "remove":
      return state.filter((i) => i.productId !== action.productId);
    case "clear":
      return [];
  }
}

function load(): QuoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => i && typeof i.productId === "string")
      .map((i) => ({ productId: i.productId, qty: clampQty(i.qty), note: String(i.note ?? "") }));
  } catch {
    return [];
  }
}

interface QuoteValue {
  items: QuoteItem[];
  lineCount: number;
  totalUnits: number;
  has: (id: string) => boolean;
  qtyOf: (id: string) => number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  setNote: (id: string, note: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const QuoteContext = createContext<QuoteValue | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const has = useCallback((id: string) => items.some((i) => i.productId === id), [items]);
  const qtyOf = useCallback((id: string) => items.find((i) => i.productId === id)?.qty ?? 0, [items]);

  const value = useMemo<QuoteValue>(
    () => ({
      items,
      lineCount: items.length,
      totalUnits: items.reduce((s, i) => s + i.qty, 0),
      has,
      qtyOf,
      add: (productId, qty = 1) => dispatch({ type: "add", productId, qty }),
      setQty: (productId, qty) => dispatch({ type: "setQty", productId, qty }),
      setNote: (productId, note) => dispatch({ type: "setNote", productId, note }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [items, has, qtyOf]
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside QuoteProvider");
  return ctx;
}
