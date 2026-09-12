import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireOrganizer } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorBanner } from "@/components/ui/states";
import type { CompetitionStatus } from "@/lib/types";

const statusMeta: Record<CompetitionStatus, { label: string; tone: "neutral" | "info" | "warning" | "success" }> = {
  draft: { label: "مسودة", tone: "neutral" },
  scoring_open: { label: "التحكيم مفتوح", tone: "info" },
  scoring_closed: { label: "التحكيم مغلق", tone: "warning" },
  published: { label: "منشورة", tone: "success" },
};

export default async function OrganizerDashboardPage() {
  const ctx = await requireOrganizer();
  const supabase = await createClient();

  const { data: competitions, error } = await supabase
    .from("competitions")
    .select("id, name, status, created_at, participants(count), judge_assignments(count)")
    .eq("org_id", ctx.orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            مسابقاتي
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            إدارة مسابقات ناديك ومتابعة حالة التحكيم
          </p>
        </div>
        <Link
          href="/organizer/competitions/new"
          className="rounded-xl px-5 py-3 text-sm font-bold"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          + مسابقة جديدة
        </Link>
      </div>

      {error ? (
        <ErrorBanner message={`تعذّر تحميل المسابقات: ${error.message}`} />
      ) : !competitions || competitions.length === 0 ? (
        <EmptyState
          title="لا توجد مسابقات بعد"
          description="أنشئ أول مسابقة لناديك وابدأ بتحديد بنود التقييم والمحكّمين."
          action={
            <Link
              href="/organizer/competitions/new"
              className="mt-1.5 rounded-xl px-5 py-3 text-sm font-bold"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              + إنشاء مسابقة جديدة
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {competitions.map((c) => {
            const meta = statusMeta[c.status as CompetitionStatus];
            const participantsCount = (c.participants as unknown as { count: number }[])[0]?.count ?? 0;
            const judgesCount = (c.judge_assignments as unknown as { count: number }[])[0]?.count ?? 0;
            return (
              <Card key={c.id} className="flex flex-wrap items-center gap-4">
                <div className="min-w-[200px] flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold">{c.name}</span>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <div className="mt-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {participantsCount} متسابق · {judgesCount} محكّمين · أُنشئت{" "}
                    {new Date(c.created_at).toLocaleDateString("ar")}
                  </div>
                </div>
                <Link
                  href={`/organizer/competitions/${c.id}/results`}
                  className="text-sm font-bold"
                  style={{ color: "var(--color-info)" }}
                >
                  فتح ←
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
