"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[14.5px] px-6 py-3.5 transition-colors box-border";

// أزرار "معطّلة" في هذا المشروع هي دائماً <button disabled> حقيقي —
// disabled:pointer-events-none يمنع فعلياً أي نقر، لا مجرد تلوين رمادي
// كما كان الحال في النموذج الأولي (راجع القسم 5 من المتطلبات).
const disabledClasses = "disabled:pointer-events-none disabled:cursor-not-allowed";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] disabled:bg-[var(--color-track)] disabled:text-[var(--color-text-tertiary)]",
  secondary:
    "bg-transparent border-2 border-[var(--color-secondary)] text-[var(--color-secondary)] disabled:border-[var(--color-border)] disabled:text-[var(--color-text-tertiary)]",
  ghost:
    "bg-[var(--color-card)] border-2 border-[var(--color-border)] text-[var(--color-text)] disabled:text-[var(--color-text-tertiary)]",
  danger: "bg-[var(--color-danger)] text-white disabled:bg-[var(--color-track)] disabled:text-[var(--color-text-tertiary)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", fullWidth, className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${base} ${disabledClasses} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
});
