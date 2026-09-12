export function ProgressBar({ percent, tone = "primary" }: { percent: number; tone?: "primary" | "success" }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fill = tone === "success" ? "var(--color-success)" : "var(--color-primary)";
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full"
      style={{ background: "var(--color-track)" }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-200"
        style={{ width: `${clamped}%`, background: fill }}
      />
    </div>
  );
}
