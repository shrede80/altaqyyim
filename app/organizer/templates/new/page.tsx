import { requireOrganizer } from "@/lib/auth";
import { TemplateEditor } from "@/components/organizer/template-editor";

export default async function NewTemplatePage() {
  const ctx = await requireOrganizer();
  return <TemplateEditor orgId={ctx.orgId} />;
}
