import Link from "next/link";
import { requireOrganizer } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignOutButton } from "@/components/organizer/sign-out-button";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrganizer();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <header
        className="sticky top-0 z-10 border-b"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-5 py-3">
          <Link href="/organizer/dashboard" className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-extrabold"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)", fontFamily: "var(--font-heading)" }}
            >
              ت
            </div>
            <span className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
              التقييم
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="hidden text-xs sm:inline" style={{ color: "var(--color-text-tertiary)" }}>
              {ctx.email}
            </span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] px-5 py-8 sm:px-6">{children}</main>
    </div>
  );
}
