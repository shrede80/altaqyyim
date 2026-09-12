"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/states";
import type { AggregationRule } from "@/lib/types";

interface TemplateOption {
  id: string;
  name: string;
  criteriaCount: number;
}

const ruleDefs: { key: AggregationRule; label: string; desc: string }[] = [
  { key: "simple_average", label: "متوسط بسيط", desc: "متوسط درجات كل المحكّمين لكل بند" },
  {
    key: "drop_high_low",
    label: "إسقاط أعلى وأقل درجة",
    desc: "يتطلب 3 محكّمين فأكثر — يُسقط الأعلى والأقل ثم يُحسب المتوسط",
  },
  { key: "weighted_average", label: "متوسط مرجّح", desc: "كل محكّم له وزن تصويت مختلف حسب خبرته" },
];

export function CreateCompetitionForm({
  orgId,
  templates,
  preselectedTemplateId,
}: {
  orgId: string;
  templates: TemplateOption[];
  preselectedTemplateId?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [rule, setRule] = useState<AggregationRule>("simple_average");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | "scratch" | null>(
    preselectedTemplateId ?? null,
  );
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canCreate = name.trim().length > 0 && !creating;

  async function onCreate() {
    // تحقق فعلي: زر "إنشاء" لا يستدعي أي API ولا ينتقل عند اسم فارغ،
    // خلافاً لسلوك النموذج الأولي (رابط عادي يبدو معطّلاً بصرياً فقط).
    if (!canCreate) return;

    setCreating(true);
    setErrorMessage("");
    try {
      const templateId = selectedTemplateId && selectedTemplateId !== "scratch" ? selectedTemplateId : null;

      const { data: competition, error: createError } = await supabase
        .from("competitions")
        .insert({
          org_id: orgId,
          template_id: templateId,
          name: name.trim(),
          description: description.trim() || null,
          aggregation_rule: rule,
          starts_at: startsAt || null,
          ends_at: endsAt || null,
          status: "draft",
        })
        .select("id")
        .single();

      if (createError || !competition) throw createError ?? new Error("تعذّر إنشاء المسابقة");

      if (templateId) {
        const { data: templateCriteria, error: fetchCriteriaError } = await supabase
          .from("template_criteria")
          .select("name, description, max_points, weight_percent, order_index, id")
          .eq("template_id", templateId)
          .order("order_index");
        if (fetchCriteriaError) throw fetchCriteriaError;

        if (templateCriteria && templateCriteria.length > 0) {
          // نسخ ثابت مستقل عن القالب الأصلي — تعديل القالب لاحقاً لا يغيّر هذه المسابقة.
          const { error: copyError } = await supabase.from("criteria").insert(
            templateCriteria.map((c) => ({
              competition_id: competition.id,
              name: c.name,
              description: c.description,
              max_points: c.max_points,
              weight_percent: c.weight_percent,
              order_index: c.order_index,
              source_template_criterion_id: c.id,
            })),
          );
          if (copyError) throw copyError;
        }
      }

      router.push(`/organizer/competitions/${competition.id}/participants`);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "تعذّر إنشاء المسابقة");
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          إنشاء مسابقة جديدة
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          حدّد تفاصيل المسابقة وقاعدة تجميع النتائج وقالب التقييم
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>اسم المسابقة</Label>
          <Input placeholder="مثال: مسابقة الخطابة 2026" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>
            وصف <span className="font-medium" style={{ color: "var(--color-text-tertiary)" }}>(اختياري)</span>
          </Label>
          <Textarea rows={2} placeholder="وصف مختصر للمسابقة" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-3.5">
          <div className="flex min-w-[160px] flex-1 flex-col gap-2">
            <Label>تاريخ البدء</Label>
            <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div className="flex min-w-[160px] flex-1 flex-col gap-2">
            <Label>تاريخ الانتهاء</Label>
            <Input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          قاعدة تجميع النتائج
        </h2>
        <div className="flex flex-col gap-2.5">
          {ruleDefs.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRule(r.key)}
              className="flex items-start gap-3 rounded-2xl border-2 p-4 text-right"
              style={{
                background: "var(--color-card)",
                borderColor: rule === r.key ? "var(--color-primary)" : "var(--color-border)",
              }}
            >
              <span
                className="mt-0.5 h-[18px] w-[18px] flex-none rounded-full border-2"
                style={{
                  borderColor: rule === r.key ? "transparent" : "var(--color-border)",
                  background: rule === r.key ? "var(--color-primary)" : "transparent",
                }}
              />
              <span>
                <span className="block text-sm font-bold">{r.label}</span>
                <span className="mt-0.5 block text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {r.desc}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            قالب التقييم
          </h2>
          <Link href="/organizer/templates/new" className="text-xs font-bold" style={{ color: "var(--color-info)" }}>
            + إنشاء قالب جديد
          </Link>
        </div>

        {templates.length === 0 ? (
          <Card className="text-center">
            <p className="text-[13.5px]" style={{ color: "var(--color-text-secondary)" }}>
              لا توجد قوالب محفوظة بعد
            </p>
            <Link href="/organizer/templates/new" className="mt-1 inline-block text-xs font-bold" style={{ color: "var(--color-info)" }}>
              أنشئ قالباً من الصفر ←
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplateId(t.id)}
                className="flex items-center justify-between rounded-2xl border-2 p-3.5 text-right"
                style={{
                  background: "var(--color-card)",
                  borderColor: selectedTemplateId === t.id ? "var(--color-primary)" : "var(--color-border)",
                }}
              >
                <span>
                  <span className="block text-sm font-bold">{t.name}</span>
                  <span className="mt-0.5 block text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {t.criteriaCount} بنود
                  </span>
                </span>
                <span
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-xs font-extrabold"
                  style={{
                    background: selectedTemplateId === t.id ? "var(--color-primary)" : "var(--color-track)",
                    color: selectedTemplateId === t.id ? "var(--color-on-primary)" : "transparent",
                  }}
                >
                  ✓
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedTemplateId("scratch")}
              className="rounded-xl p-2.5 text-center text-sm font-bold"
              style={{
                color: "var(--color-secondary)",
                background: selectedTemplateId === "scratch" ? "var(--color-warning-bg)" : "transparent",
              }}
            >
              أو ابدأ من الصفر بدون قالب
            </button>
          </div>
        )}
      </div>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      <div className="mt-1.5 flex justify-end">
        <Button onClick={onCreate} disabled={!canCreate}>
          {creating ? "جارٍ الإنشاء..." : "إنشاء المسابقة والمتابعة للمتسابقين"}
        </Button>
      </div>
    </div>
  );
}
