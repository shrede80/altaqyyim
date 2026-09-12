type Tone = "neutral" | "info" | "warning" | "success" | "danger";

const toneStyles: Record<Tone, { bg: string; color: string }> = {
  neutral: { bg: "var(--color-track)", color: "var(--color-text-secondary)" },
  info: { bg: "var(--color-info-bg)", color: "var(--color-info)" },
  warning: { bg: "var(--color-warning-bg)", color: "var(--color-secondary)" },
  success: { bg: "var(--color-success-bg)", color: "var(--color-success)" },
  danger: { bg: "var(--color-danger-bg)", color: "var(--color-danger)" },
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  const s = toneStyles[tone];
  return (
    <span
      className="inline-block rounded-lg px-2.5 py-1 text-[11.5px] font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      {children}
    </span>
  );
}
