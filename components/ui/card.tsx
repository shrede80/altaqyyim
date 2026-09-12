export function Card({
  children,
  className = "",
  padding = "lg",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "lg" | "sm";
  style?: React.CSSProperties;
}) {
  const pad = padding === "lg" ? "p-5 sm:p-6" : "p-3.5 sm:p-4";
  return (
    <div
      className={`rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${pad} ${className}`}
      style={{ background: "var(--color-card)", ...style }}
    >
      {children}
    </div>
  );
}
