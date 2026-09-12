import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JudgeScoringApp } from "@/components/judge/scoring-app";

export default async function JudgeCompetitionPage({
  params,
}: {
  params: Promise<{ competitionId: string }>;
}) {
  const { competitionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/judge/no-access");

  const { data: assignment } = await supabase
    .from("judge_assignments")
    .select("id")
    .eq("competition_id", competitionId)
    .eq("judge_id", user.id)
    .maybeSingle();
  if (!assignment) redirect("/judge/no-access");

  const { data: competition } = await supabase
    .from("competitions")
    .select("id, name")
    .eq("id", competitionId)
    .maybeSingle();
  if (!competition) notFound();

  const [{ data: criteria }, { data: participants }, { data: scores }, { data: editRequests }] = await Promise.all([
    supabase.from("criteria").select("*").eq("competition_id", competitionId).order("order_index"),
    supabase.from("participants").select("*").eq("competition_id", competitionId).order("created_at"),
    supabase
      .from("scores")
      .select("participant_id, criterion_id, points, is_locked")
      .eq("competition_id", competitionId)
      .eq("judge_id", user.id),
    supabase
      .from("score_edit_requests")
      .select("participant_id")
      .eq("competition_id", competitionId)
      .eq("judge_id", user.id),
  ]);

  return (
    <JudgeScoringApp
      competitionId={competitionId}
      competitionName={competition.name}
      judgeId={user.id}
      criteria={criteria ?? []}
      participants={participants ?? []}
      initialScores={scores ?? []}
      requestedEditParticipantIds={(editRequests ?? []).map((r) => r.participant_id)}
    />
  );
}
