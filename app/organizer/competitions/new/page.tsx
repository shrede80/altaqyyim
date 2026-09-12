import { requireOrganizer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateCompetitionForm } from "@/components/organizer/create-competition-form";

export default async function NewCompetitionPage({
  searchParams,
}: {
  searchParams: Promise<{ templateId?: string }>;
}) {
  const { templateId } = await searchParams;
  const ctx = await requireOrganizer();
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("evaluation_templates")
    .select("id, name, template_criteria(count)")
    .eq("org_id", ctx.orgId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const templateOptions = (templates ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    criteriaCount: (t.template_criteria as unknown as { count: number }[])[0]?.count ?? 0,
  }));

  return (
    <CreateCompetitionForm orgId={ctx.orgId} templates={templateOptions} preselectedTemplateId={templateId} />
  );
}
