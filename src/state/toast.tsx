import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { useI18n } from "@/i18n";

interface Toast {
  id: number;
  message: string;
  action?: { label: string; to: string };
}

interface ToastValue {
  push: (message: string, action?: Toast["action"]) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const { t } = useI18n();

  const dismiss = useCallback((id: number) => setToasts((l) => l.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (message: string, action?: Toast["action"]) => {
      const id = ++idRef.current;
      setToasts((l) => [...l.slice(-2), { id, message, action }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 border-s-4 border-signal bg-ink p-3 ps-4 text-sm text-white shadow-2xl"
            role="status"
          >
            <Check className="size-4 shrink-0 text-signal" />
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <Link
                to={toast.action.to}
                onClick={() => dismiss(toast.id)}
                className="shrink-0 border-b border-white/50 font-semibold hover:border-signal hover:text-signal"
              >
                {toast.action.label}
              </Link>
            )}
            <button onClick={() => dismiss(toast.id)} aria-label={t("nav.close")} className="shrink-0 text-white/60 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
