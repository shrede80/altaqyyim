"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Tone = "success" | "warning" | "info" | "danger";

interface ToastState {
  id: number;
  text: string;
  tone: Tone;
}

interface ToastContextValue {
  showToast: (text: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneColors: Record<Tone, string> = {
  success: "var(--color-success)",
  warning: "var(--color-secondary)",
  info: "var(--color-info)",
  danger: "var(--color-danger)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback((text: string, tone: Tone = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const id = ++idRef.current;
    setToast({ id, text, tone });
    timerRef.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-7 left-1/2 z-50 -translate-x-1/2 transition-all duration-300"
        style={{
          opacity: toast ? 1 : 0,
          transform: `translate(-50%, ${toast ? "0" : "12px"})`,
        }}
      >
        {toast ? (
          <div
            className="whitespace-nowrap rounded-full px-5 py-3 text-[13.5px] font-bold text-white shadow-lg"
            style={{ background: toneColors[toast.tone] }}
          >
            {toast.text}
          </div>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast يجب أن يُستخدم داخل ToastProvider");
  return ctx;
}
