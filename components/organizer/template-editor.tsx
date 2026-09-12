"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import type { TemplateCriterion } from "@/lib/types";

interface DraftCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: string;
  weight: string;
}

let draftIdCounter = 0;
function nextDraftId() {
  draftIdCounter += 1;
  return `draft-${draftIdCounter}`;
}

export function TemplateEditor({
  orgId,
  templateId,
  initialName = "",
  initialDescription = "",
  initialCriteria = [],
}: {
  orgId: string;
  templateId?: string;
  initialName?: string;
  initialDescription?: string;
  initialCriteria?: TemplateCriterion[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [criteria, setCriteria] = useState<DraftCriterion[]>(
    initialCriteria
      .sort((a, b) => a.order_index - b.order_index)
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? "",
        maxPoints: String(c.max_points),
        weight: String(c.weight_percent),
      })),
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function addCriterion() {
    setCriteria((prev) => [
      ...prev,
      { id: nextDraftId(), name: "", description: "", maxPoints: "10", weight: "0" },
    ]);
  }

  function updateCriterion(id: string, patch: Partial<DraftCriterion>) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCriterion(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }

  const weightSum = Math.round(criteria.reduce((acc, c) => acc + (parseFloat(c.weight) || 0), 0) * 10) / 10;
  const hasCriteria = criteria.length > 0;
  const weightValid = hasCriteria && Math.abs(weightSum - 100) < 0.05;
  const namesValid = criteria.every((c) => c.name.trim().length > 0);
  // تحقق فعلي يمنع الحفظ برمجياً عند عدم اكتمال الشروط — لا مجرد تعطيل بصري للزر.
  const canSave = name.trim().length > 0 && weightValid && namesValid && !saving;

  async function persistTemplate() {
    const trimmedName = name.trim();
    const criteriaPayload = criteria.map((c, index) => ({
      name: c.name.trim(),
      description: c.description.trim() || null,
      max_points: Number(c.maxPoints) || 1,
      weight_percent: Number(c.weight) || 0,
      order_index: index,
    }));

    if (templateId) {
      const { error: updateError } = await supabase
        .from("evaluation_templates")
        .update({ name: trimmedName, description: description.trim() || null })
        .eq("id", templateId);
      if (updateError) throw updateError;

      const { error: deleteError } = await supabase
        .from("template_criteria")
        .delete()
        .eq("template_id", templateId);
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from("template_criteria")
        .insert(criteriaPayload.map((c) => ({ ...c, template_id: templateId })));
      if (insertError) throw insertError;

      return templateId;
    }

    const { data: created, error: createError } = await supabase
      .from("evaluation_templates")
      .insert({ org_id: orgId, name: trimmedName, description: description.trim() || null })
      .select("id")
      .single();
    if (createError || !created) throw createError ?? new Error("تعذّر إنشاء القالب");

    const { error: insertError } = await supabase
      .from("template_criteria")
      .insert(criteriaPayload.map((c) => ({ ...c, template_id: created.id })));
    if (insertError) throw insertError;

    return created.id as string;
  }

  async function onSave(redirectToNewCompetition: boolean) {
    if (!canSave) return;
    setSaving(true);
    setErrorMessage("");
    try {
      const savedId = await persistTemplate();
      if (redirectToNewCompetition) {
        showToast("تم حفظ القالب — سيُنشأ نسخة مستقلة من بنوده عند الربط بمسابقة", "info");
        router.push(`/organizer/competitions/new?templateId=${savedId}`);
      } else {
        showToast("تم حفظ القالب", "success");
        router.push(`/organizer/templates/${savedId}`);
        router.refresh();
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "تعذّر حفظ القالب");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          {templateId ? "تعديل القالب" : "قالب تقييم جديد"}
        </h1>
        <p className="mt-1.5 text-[15px]" style={{ color: "var(--color-text-secondary)" }}>
          عرّف بنود التقييم مرة واحدة، وأعد استخدامها في أي مسابقة قادمة.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>اسم القالب</Label>
          <Input placeholder="مثال: قالب تحكيم الخطابة" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>
            وصف القالب <span className="font-medium" style={{ color: "var(--color-text-tertiary)" }}>(اختياري)</span>
          </Label>
          <Textarea
            rows={2}
            placeholder="وصف مختصر لمتى يُستخدم هذا القالب"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          بنود التقييم
        </h2>
        {hasCriteria ? (
          <button
            type="button"
            onClick={addCriterion}
            className="rounded-lg border-2 px-4 py-2.5 text-sm font-bold"
            style={{ borderColor: "var(--color-secondary)", color: "var(--color-secondary)" }}
          >
            + إضافة بند
          </button>
        ) : null}
      </div>

      {hasCriteria ? (
        <div className="flex flex-col gap-3.5">
          {criteria.map((item) => (
            <Card key={item.id} className="flex flex-wrap items-start gap-3.5">
              <div className="flex min-w-[220px] flex-[2] flex-col gap-1.5">
                <Label className="text-xs" >اسم البند</Label>
                <Input
                  placeholder="مثال: وضوح الأداء الصوتي"
                  value={item.name}
                  onChange={(e) => updateCriterion(item.id, { name: e.target.value })}
                />
              </div>
              <div className="flex min-w-[220px] flex-[2] flex-col gap-1.5">
                <Label className="text-xs">وصف (اختياري)</Label>
                <Input
                  placeholder="ماذا يقيّم هذا البند بالضبط"
                  value={item.description}
                  onChange={(e) => updateCriterion(item.id, { description: e.target.value })}
                />
              </div>
              <div className="flex w-[110px] flex-col gap-1.5">
                <Label className="text-xs">أقصى نقاط</Label>
                <Input
                  type="number"
                  min={1}
                  value={item.maxPoints}
                  onChange={(e) => updateCriterion(item.id, { maxPoints: e.target.value })}
                />
              </div>
              <div className="flex w-[110px] flex-col gap-1.5">
                <Label className="text-xs">الوزن %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={item.weight}
                  onChange={(e) => updateCriterion(item.id, { weight: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeCriterion(item.id)}
                aria-label="حذف البند"
                className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                ×
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="لا توجد بنود بعد"
          action={
            <button
              type="button"
              onClick={addCriterion}
              className="mt-1.5 rounded-xl px-6 py-3.5 text-[15px] font-bold"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              + إضافة أول بند
            </button>
          }
        />
      )}

      {hasCriteria && !weightValid ? (
        <ErrorBanner message={`مجموع الأوزان الحالي ${weightSum}% — يجب أن يساوي 100% قبل الحفظ.`} />
      ) : null}
      {hasCriteria && weightValid ? (
        <p className="text-[13.5px] font-bold" style={{ color: "var(--color-success)" }}>
          الأوزان متوازنة (100%) ✓
        </p>
      ) : null}
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      <div className="mt-1.5 flex flex-wrap items-center gap-3.5">
        <Button onClick={() => onSave(false)} disabled={!canSave}>
          {saving ? "جارٍ الحفظ..." : "حفظ القالب"}
        </Button>
        <Button variant="secondary" onClick={() => onSave(true)} disabled={!canSave}>
          استخدام في مسابقة جديدة
        </Button>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
        عند الربط بمسابقة، تُنسخ هذه البنود نسخة ثابتة مستقلة — تعديل القالب لاحقاً لا يؤثر على مسابقات أُنشئت منه سابقاً.
      </p>
    </div>
  );
}
