import { notFound } from "next/navigation";
import { requireOrganizer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TemplateEditor } from "@/components/organizer/template-editor";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrganizer();
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("evaluation_templates")
    .select("id, name, description, org_id")
    .eq("id", id)
    .eq("org_id", ctx.orgId)
    .maybeSingle();

  if (!template) notFound();

  const { data: criteria } = await supabase
    .from("template_criteria")
    .select("id, template_id, name, description, max_points, weight_percent, order_index")
    .eq("template_id", id)
    .order("order_index");

  return (
    <TemplateEditor
      orgId={ctx.orgId}
      templateId={template.id}
      initialName={template.name}
      initialDescription={template.description ?? ""}
      initialCriteria={criteria ?? []}
    />
  );
}
