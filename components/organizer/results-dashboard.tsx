"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeCompetitionResults, type RawScoreRow } from "@/lib/results";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { buildRankingPdf, downloadPdf } from "@/lib/export/ranking-pdf";
import { buildResultsWorkbook, downloadWorkbook } from "@/lib/export/results-workbook";
import type { AggregationRule, Competition, Criterion, Participant } from "@/lib/types";

const ruleLabels: Record<AggregationRule, string> = {
  simple_average: "متوسط بسيط",
  drop_high_low: "إسقاط أعلى وأقل درجة",
  weighted_average: "متوسط مرجّح",
};

export function ResultsDashboard({
  competition,
  criteria,
  participants,
  assignedJudgeIds,
  judgeWeights,
  initialScores,
}: {
  competition: Competition;
  criteria: Criterion[];
  participants: Participant[];
  assignedJudgeIds: string[];
  judgeWeights: Record<string, number>;
  initialScores: RawScoreRow[];
}) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [status, setStatus] = useState(competition.status);
  const [publishedAt, setPublishedAt] = useState(competition.published_at);
  const [scores, setScores] = useState<RawScoreRow[]>(initialScores);
  const [publishStage, setPublishStage] = useState<"idle" | "confirm" | "published">(
    competition.status === "published" ? "published" : "idle",
  );
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const channel = supabase
      .channel(`scores-${competition.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores", filter: `competition_id=eq.${competition.id}` },
        async () => {
          const { data } = await supabase
            .from("scores")
            .select("participant_id, criterion_id, judge_id, points")
            .eq("competition_id", competition.id);
          setScores(data ?? []);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competition.id]);

  const { rows, allComplete } = useMemo(
    () =>
      computeCompetitionResults({
        criteria,
        participants,
        assignedJudgeIds,
        scores,
        aggregationRule: competition.aggregation_rule,
        judgeWeights,
      }),
    [criteria, participants, assignedJudgeIds, scores, competition.aggregation_rule, judgeWeights],
  );

  async function updateStatus(next: "scoring_open" | "scoring_closed") {
    setBusy(true);
    setErrorMessage("");
    const { error } = await supabase.from("competitions").update({ status: next }).eq("id", competition.id);
    setBusy(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setStatus(next);
    showToast(next === "scoring_open" ? "تم فتح التحكيم للمحكّمين" : "تم إغلاق التحكيم", "success");
  }

  async function onPublishClick() {
    if (publishStage === "published") return;
    if (!canPublish) return;

    if (publishStage === "idle") {
      setPublishStage("confirm");
      return;
    }

    setBusy(true);
    const publishedNow = new Date().toISOString();
    const { error } = await supabase
      .from("competitions")
      .update({ status: "published", published_at: publishedNow })
      .eq("id", competition.id);
    setBusy(false);
    if (error) {
      setErrorMessage(error.message);
      setPublishStage("idle");
      return;
    }
    setStatus("published");
    setPublishedAt(publishedNow);
    setPublishStage("published");
    showToast("تم اعتماد ونشر النتائج النهائية", "success");
  }

  async function onExportPdf() {
    try {
      const bytes = await buildRankingPdf({
        competitionName: competition.name,
        publishedAtLabel: publishedAt ? new Date(publishedAt).toLocaleString("ar") : "",
        rows: rows.map((r, i) => ({ rank: i + 1, name: r.name, finalScore: r.finalScore })),
      });
      downloadPdf(bytes, `الترتيب-النهائي-${competition.name}.pdf`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "تعذّر إنشاء ملف PDF", "danger");
    }
  }

  async function onExportExcel() {
    try {
      const judgeLabels = assignedJudgeIds.map((_, i) => `محكّم ${i + 1}`);
      const scoresByParticipantCriterionJudge: Record<string, Record<string, (number | null)[]>> = {};
      for (const p of participants) {
        scoresByParticipantCriterionJudge[p.id] = {};
        for (const c of criteria) {
          scoresByParticipantCriterionJudge[p.id][c.id] = assignedJudgeIds.map((judgeId) => {
            const found = scores.find(
              (s) => s.participant_id === p.id && s.criterion_id === c.id && s.judge_id === judgeId,
            );
            return found ? found.points : null;
          });
        }
      }
      const buffer = await buildResultsWorkbook({
        competitionName: competition.name,
        judgeLabels,
        rows,
        scoresByParticipantCriterionJudge,
      });
      downloadWorkbook(buffer, `نتائج-${competition.name}.xlsx`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "تعذّر إنشاء ملف Excel", "danger");
    }
  }

  const canPublish = status === "scoring_closed" && allComplete && rows.length > 0;

  let publishLabel = "اعتماد ونشر النتائج النهائية";
  if (publishStage === "published") publishLabel = "✓ تم النشر";
  else if (publishStage === "confirm") publishLabel = "تأكيد النشر النهائي — اضغط مرة أخرى";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
            لوحة النتائج — {competition.name}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            نتيجة حيّة تتحدّث مع كل درجة يسجّلها المحكّمون
          </p>
        </div>
        <Badge tone="warning">قاعدة التجميع: {ruleLabels[competition.aggregation_rule]}</Badge>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-bold" style={{ color: "var(--color-text-tertiary)" }}>
            حالة المسابقة:
          </span>
          <Badge
            tone={
              status === "draft"
                ? "neutral"
                : status === "scoring_open"
                  ? "info"
                  : status === "scoring_closed"
                    ? "warning"
                    : "success"
            }
          >
            {status === "draft"
              ? "مسودة"
              : status === "scoring_open"
                ? "التحكيم مفتوح"
                : status === "scoring_closed"
                  ? "التحكيم مغلق"
                  : "منشورة"}
          </Badge>
        </div>
        {status === "draft" ? (
          <Button onClick={() => updateStatus("scoring_open")} disabled={busy}>
            فتح التحكيم للمحكّمين
          </Button>
        ) : status === "scoring_open" ? (
          <Button variant="secondary" onClick={() => updateStatus("scoring_closed")} disabled={busy}>
            إغلاق التحكيم
          </Button>
        ) : null}
      </Card>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      {rows.length === 0 ? (
        <EmptyState title="لا توجد نتائج بعد" description="أضف متسابقين وابدأ التحكيم لتظهر النتائج هنا حيّة." />
      ) : (
        <div className="flex flex-col gap-3.5">
          {rows.map((row, i) => (
            <Card key={row.participantId} className="flex flex-wrap items-center gap-4">
              <div
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[15px] font-extrabold"
                style={{
                  background: i === 0 ? "var(--color-primary)" : "var(--color-track)",
                  color: i === 0 ? "var(--color-on-primary)" : "var(--color-text-secondary)",
                }}
              >
                {i + 1}
              </div>
              <div className="min-w-[180px] flex-1">
                <div className="text-base font-bold">{row.name}</div>
                <div className="mt-2 flex max-w-[220px] items-center gap-2">
                  <ProgressBar percent={row.completionPercent} tone={row.completionPercent === 100 ? "success" : "primary"} />
                  <span className="text-xs font-bold" style={{ color: "var(--color-text-tertiary)" }}>
                    {row.completionPercent}%
                  </span>
                </div>
              </div>
              <Badge tone={row.completionPercent === 100 ? "success" : "warning"}>
                {row.completionPercent === 100 ? "مكتمل" : "مسودة"}
              </Badge>
              <div className="flex-none text-left">
                <div className="text-[22px] font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
                  {row.finalScore.toFixed(2)}
                </div>
                <div className="text-[11.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                  النتيجة النهائية
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-1.5 flex flex-col items-end gap-2">
        <Button onClick={onPublishClick} disabled={!canPublish || busy || publishStage === "published"} variant={publishStage === "published" ? "ghost" : "primary"}>
          {publishLabel}
        </Button>
        {!canPublish && publishStage === "idle" ? (
          <p className="text-[12.5px] font-bold" style={{ color: "var(--color-danger)" }}>
            {status !== "scoring_closed"
              ? "أغلق التحكيم أولاً قبل النشر"
              : "لا يمكن النشر قبل اكتمال تحكيم جميع المتسابقين"}
          </p>
        ) : null}
        {publishStage === "published" && publishedAt ? (
          <p className="text-[12.5px] font-bold" style={{ color: "var(--color-success)" }}>
            نُشرت النتائج في {new Date(publishedAt).toLocaleString("ar")}
          </p>
        ) : null}
      </div>

      {status === "published" ? (
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={onExportExcel}>
            تصدير Excel (تفصيلي)
          </Button>
          <Button variant="secondary" onClick={onExportPdf}>
            تصدير PDF (الترتيب النهائي)
          </Button>
        </div>
      ) : null}
    </div>
  );
}
