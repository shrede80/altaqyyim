"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// data-theme يتغيّر فقط عبر toggle() أدناه، لذا مستمعو التغيير محليون هنا
// (لا حاجة لمراقبة MutationObserver) — تماماً كما يوصي useSyncExternalStore
// للحالة الخارجية (DOM/localStorage) بدل استدعاء setState داخل Effect.
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Theme {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("taqyeem_theme", next);
    } catch {
      // localStorage قد يكون غير متاح (وضع خاص) — التبديل يبقى يعمل لهذه الجلسة فقط
    }
    notify();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 text-base ${className}`}
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
