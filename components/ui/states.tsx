import { Card } from "./card";

export function SkeletonCard() {
  return (
    <Card>
      <div className="flex flex-col gap-2.5">
        <div className="skeleton-pulse h-4 w-2/5 rounded-md" />
        <div className="skeleton-pulse h-3 w-3/5 rounded-md" />
      </div>
    </Card>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3.5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function EmptyState({
  icon = "؟",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3.5 py-14 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-extrabold"
        style={{ background: "var(--color-warning-bg)", color: "var(--color-secondary)" }}
      >
        {icon}
      </div>
      <div className="text-base font-bold" style={{ color: "var(--color-text)" }}>
        {title}
      </div>
      {description ? (
        <div className="max-w-[340px] text-[13.5px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </div>
      ) : null}
      {action}
    </Card>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl px-3.5 py-3 text-center text-[13px] font-bold"
      style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
      role="alert"
    >
      {message}
    </div>
  );
}
