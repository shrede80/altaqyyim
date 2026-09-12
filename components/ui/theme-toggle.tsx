"use client";

import { useEffect, useState } from "react";

function currentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("taqyeem_theme", next);
    } catch {
      // localStorage قد يكون غير متاح (وضع خاص) — التبديل يبقى يعمل لهذه الجلسة فقط
    }
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
