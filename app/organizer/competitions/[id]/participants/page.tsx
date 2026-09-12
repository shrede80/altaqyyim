import { notFound } from "next/navigation";
import { requireOrganizer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddParticipants } from "@/components/organizer/add-participants";

export default async function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("competition_id", id)
    .order("created_at");

  return <AddParticipants competitionId={id} initialParticipants={participants ?? []} />;
}
