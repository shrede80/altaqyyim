import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const fieldBase =
  "w-full box-border rounded-xl border-2 px-3.5 py-3 text-[15px] bg-transparent";
const fieldBorder = "border-[var(--color-border)] text-[var(--color-text)]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${fieldBase} ${fieldBorder} ${className}`} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`${fieldBase} ${fieldBorder} resize-y font-[inherit] ${className}`}
      {...props}
    />
  );
});

export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`text-[13.5px] font-bold text-[var(--color-text)] ${className}`}>
      {children}
    </label>
  );
}
