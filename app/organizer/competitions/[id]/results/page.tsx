import { notFound } from "next/navigation";
import { requireOrganizer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ResultsDashboard } from "@/components/organizer/results-dashboard";

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrganizer();
  const supabase = await createClient();

  const { data: competition } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .eq("org_id", ctx.orgId)
    .maybeSingle();
  if (!competition) notFound();

  const [{ data: criteria }, { data: participants }, { data: assignments }, { data: scores }] = await Promise.all([
    supabase.from("criteria").select("*").eq("competition_id", id).order("order_index"),
    supabase.from("participants").select("*").eq("competition_id", id).order("created_at"),
    supabase.from("judge_assignments").select("judge_id").eq("competition_id", id),
    supabase.from("scores").select("participant_id, criterion_id, judge_id, points").eq("competition_id", id),
  ]);

  const assignedJudgeIds = (assignments ?? []).map((a) => a.judge_id);
  const judgeWeights = (competition.aggregation_config as { judgeWeights?: Record<string, number> } | null)
    ?.judgeWeights ?? {};

  return (
    <ResultsDashboard
      competition={competition}
      criteria={criteria ?? []}
      participants={participants ?? []}
      assignedJudgeIds={assignedJudgeIds}
      judgeWeights={judgeWeights}
      initialScores={scores ?? []}
    />
  );
}
