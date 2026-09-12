import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requireOrganizer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AssignJudges } from "@/components/organizer/assign-judges";

export default async function JudgesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrganizer();
  const supabase = await createClient();

  const { data: competition } = await supabase
    .from("competitions")
    .select("id")
    .eq("id", id)
    .eq("org_id", ctx.orgId)
    .maybeSingle();
  if (!competition) notFound();

  const [{ data: invitations }, { data: assignments }, hdrs] = await Promise.all([
    supabase
      .from("judge_invitations")
      .select("id, email, token, used_at, accepted_user_id")
      .eq("competition_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("judge_assignments").select("judge_id").eq("competition_id", id),
    headers(),
  ]);

  const origin = `${hdrs.get("x-forwarded-proto") ?? "https"}://${hdrs.get("host")}`;

  return (
    <AssignJudges
      competitionId={id}
      initialInvitations={invitations ?? []}
      initialAssignedJudgeIds={(assignments ?? []).map((a) => a.judge_id)}
      origin={origin}
      invitedBy={ctx.userId}
    />
  );
}
