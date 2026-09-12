"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useToast } from "@/components/ui/toast";
import {
  enqueuePendingWrite,
  loadPendingWrites,
  savePendingWrites,
  type PendingWrite,
} from "@/lib/offline-queue";
import type { Criterion, Participant } from "@/lib/types";

interface ScoreCell {
  points: number;
  isLocked: boolean;
}

function scoreKey(participantId: string, criterionId: string) {
  return `${participantId}_${criterionId}`;
}

export function JudgeScoringApp({
  competitionId,
  competitionName,
  judgeId,
  criteria,
  participants,
  initialScores,
  requestedEditParticipantIds,
}: {
  competitionId: string;
  competitionName: string;
  judgeId: string;
  criteria: Criterion[];
  participants: Participant[];
  initialScores: { participant_id: string; criterion_id: string; points: number; is_locked: boolean }[];
  requestedEditParticipantIds: string[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  const [screen, setScreen] = useState<"list" | "scoring" | "locked">("list");
  const [currentParticipantId, setCurrentParticipantId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, ScoreCell>>(() => {
    const map: Record<string, ScoreCell> = {};
    for (const s of initialScores) {
      map[scoreKey(s.participant_id, s.criterion_id)] = { points: s.points, isLocked: s.is_locked };
    }
    return map;
  });
  // القيم الأولية تُقرأ مباشرة عند التهيئة (لا داخل Effect) لأن هذا مكوّن
  // عميل بالكامل يُركَّب مرة واحدة لكل مسابقة — لا حاجة لمزامنة SSR هنا.
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [pending, setPending] = useState<PendingWrite[]>(() => loadPendingWrites(competitionId));
  const [requestedEdit, setRequestedEdit] = useState<Set<string>>(new Set(requestedEditParticipantIds));
  const isFlushing = useRef(false);

  const flushPending = useCallback(async () => {
    if (isFlushing.current) return;
    isFlushing.current = true;
    try {
      let queue = loadPendingWrites(competitionId);
      let syncedCount = 0;
      while (queue.length > 0) {
        const item = queue[0];
        try {
          if (item.type === "score") {
            const { error } = await supabase.from("scores").upsert(
              {
                competition_id: item.competitionId,
                judge_id: judgeId,
                participant_id: item.participantId,
                criterion_id: item.criterionId,
                points: item.points,
              },
              { onConflict: "judge_id,participant_id,criterion_id" },
            );
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from("scores")
              .update({ is_locked: true })
              .eq("competition_id", item.competitionId)
              .eq("judge_id", judgeId)
              .eq("participant_id", item.participantId);
            if (error) throw error;
          }
          queue = queue.slice(1);
          savePendingWrites(competitionId, queue);
          setPending(queue);
          syncedCount += 1;
        } catch {
          break; // ما زلنا غير قادرين على المزامنة (مثلاً الاتصال عاد لوهلة ثم انقطع) — نتوقف ونعيد المحاولة لاحقاً
        }
      }
      if (syncedCount > 0) {
        showToast(`تمت مزامنة ${syncedCount} تحديثاً بنجاح`, "success");
      }
    } finally {
      isFlushing.current = false;
    }
  }, [competitionId, judgeId, showToast, supabase]);

  useEffect(() => {
    function onOnline() {
      setIsOnline(true);
      void flushPending();
    }
    function onOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [flushPending]);

  function scoreCountFor(participantId: string) {
    return criteria.filter((c) => scores[scoreKey(participantId, c.id)] !== undefined).length;
  }

  function isParticipantLocked(participantId: string) {
    return criteria.some((c) => scores[scoreKey(participantId, c.id)]?.isLocked);
  }

  function selectParticipant(participantId: string) {
    const locked = isParticipantLocked(participantId);
    let startIndex = 0;
    if (!locked) {
      const idx = criteria.findIndex((c) => scores[scoreKey(participantId, c.id)] === undefined);
      startIndex = idx === -1 ? criteria.length - 1 : idx;
    }
    setCurrentParticipantId(participantId);
    setCurrentIndex(startIndex);
    setScreen("scoring");
  }

  function backToList() {
    setScreen("list");
  }

  async function setScore(participantId: string, criterionId: string, points: number) {
    setScores((prev) => ({ ...prev, [scoreKey(participantId, criterionId)]: { points, isLocked: false } }));

    if (!navigator.onLine) {
      const next = enqueuePendingWrite(competitionId, {
        type: "score",
        competitionId,
        participantId,
        criterionId,
        points,
      });
      setPending(next);
      showToast("تم الحفظ محلياً — سيُزامن عند عودة الاتصال", "warning");
      return;
    }

    const { error } = await supabase.from("scores").upsert(
      {
        competition_id: competitionId,
        judge_id: judgeId,
        participant_id: participantId,
        criterion_id: criterionId,
        points,
      },
      { onConflict: "judge_id,participant_id,criterion_id" },
    );

    if (error) {
      const next = enqueuePendingWrite(competitionId, {
        type: "score",
        competitionId,
        participantId,
        criterionId,
        points,
      });
      setPending(next);
      showToast("تعذّر الحفظ الآن — سيُعاد المحاولة تلقائياً", "warning");
    } else {
      showToast("تم الحفظ", "success");
    }
  }

  async function lockParticipant(participantId: string) {
    setScores((prev) => {
      const next = { ...prev };
      for (const c of criteria) {
        const key = scoreKey(participantId, c.id);
        if (next[key]) next[key] = { ...next[key], isLocked: true };
      }
      return next;
    });
    setScreen("locked");

    if (!navigator.onLine) {
      const next = enqueuePendingWrite(competitionId, { type: "lock", competitionId, participantId });
      setPending(next);
      showToast("سيُقفَل نهائياً عند عودة الاتصال", "warning");
      return;
    }

    const { error } = await supabase
      .from("scores")
      .update({ is_locked: true })
      .eq("competition_id", competitionId)
      .eq("judge_id", judgeId)
      .eq("participant_id", participantId);

    if (error) {
      const next = enqueuePendingWrite(competitionId, { type: "lock", competitionId, participantId });
      setPending(next);
      showToast("تعذّر تأكيد القفل الآن — سيُعاد المحاولة تلقائياً", "warning");
    }
  }

  function goPrev() {
    if (currentIndex === 0) {
      backToList();
      return;
    }
    setCurrentIndex((i) => i - 1);
  }

  async function goNext() {
    if (!currentParticipantId) return;
    const locked = isParticipantLocked(currentParticipantId);
    const isLast = currentIndex >= criteria.length - 1;

    if (locked) {
      if (isLast) backToList();
      else setCurrentIndex((i) => i + 1);
      return;
    }

    if (isLast) {
      await lockParticipant(currentParticipantId);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  async function requestEdit(participantId: string) {
    const { error } = await supabase
      .from("score_edit_requests")
      .insert({ competition_id: competitionId, judge_id: judgeId, participant_id: participantId });
    if (!error) {
      setRequestedEdit((prev) => new Set(prev).add(participantId));
      showToast("تم إرسال الطلب — سيُسجَّل القرار في سجل التدقيق", "info");
    } else {
      showToast("تعذّر إرسال الطلب", "warning");
    }
  }

  const theme = {
    heading: "var(--font-heading)",
  };

  if (screen === "list") {
    return (
      <div className="mx-auto flex min-h-screen max-w-[440px] flex-col gap-4 p-5 pb-16">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-extrabold" style={{ fontFamily: theme.heading }}>
              تسجيل الدرجات
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {competitionName} — اختر متسابقاً لبدء أو مراجعة التقييم
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div
          className="flex w-fit items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 text-[13px] font-bold"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: isOnline ? "var(--color-success)" : "var(--color-danger)" }}
          />
          {isOnline
            ? pending.length > 0
              ? `متصل — جارٍ مزامنة ${pending.length} تحديثاً`
              : "متصل"
            : `غير متصل — ${pending.length} تحديث بانتظار المزامنة`}
        </div>

        <div className="flex flex-col gap-3">
          {participants.map((p) => {
            const done = scoreCountFor(p.id);
            const locked = isParticipantLocked(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => selectParticipant(p.id)}
                className="flex items-center justify-between rounded-2xl border-2 p-4.5 text-right"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
              >
                <div>
                  <div className="text-base font-bold">{p.name}</div>
                  <div className="mt-1 text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
                    {locked ? "مكتمل ومقفل" : `${done} من ${criteria.length} بنود`}
                  </div>
                </div>
                <div
                  className="rounded-lg px-3 py-1.5 text-xs font-bold"
                  style={{
                    background: locked ? "var(--color-success)" : "var(--color-track)",
                    color: locked ? "#fff" : "var(--color-text-tertiary)",
                  }}
                >
                  {locked ? "🔒 مقفل" : done > 0 ? "قيد التسجيل" : "لم يبدأ"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen === "locked" && currentParticipantId) {
    const participant = participants.find((p) => p.id === currentParticipantId);
    const alreadyRequested = requestedEdit.has(currentParticipantId);
    return (
      <div className="mx-auto flex min-h-screen max-w-[440px] flex-col items-center justify-center gap-4 p-5 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-3xl font-extrabold"
          style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}
        >
          ✓
        </div>
        <h1 className="text-xl font-extrabold" style={{ fontFamily: theme.heading }}>
          تم قفل درجات {participant?.name}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          اكتمل تسجيل جميع البنود. أي تعديل لاحق يتطلب طلباً صريحاً يُسجَّل في سجل التدقيق.
        </p>
        <button
          type="button"
          disabled={alreadyRequested}
          onClick={() => requestEdit(currentParticipantId)}
          className="w-full rounded-xl border-2 py-3.5 text-[14.5px] font-bold disabled:opacity-70"
          style={{ borderColor: "var(--color-secondary)", color: "var(--color-secondary)" }}
        >
          {alreadyRequested ? "تم إرسال الطلب ✓" : "طلب فتح للتعديل"}
        </button>
        <button
          type="button"
          onClick={backToList}
          className="w-full rounded-xl py-3.5 text-[15px] font-bold"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          عودة لقائمة المتسابقين
        </button>
      </div>
    );
  }

  // شاشة التسجيل
  const participant = participants.find((p) => p.id === currentParticipantId);
  const criterion = criteria[currentIndex];
  if (!participant || !criterion || !currentParticipantId) return null;

  const locked = isParticipantLocked(currentParticipantId);
  const currentVal = scores[scoreKey(currentParticipantId, criterion.id)]?.points;
  const useSlider = criterion.max_points > 10;
  const total = criteria.length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);
  const isLast = currentIndex >= total - 1;
  const nextDisabled = !locked && currentVal === undefined;
  const nextLabel = locked ? (isLast ? "عودة للقائمة" : "التالي") : isLast ? "إنهاء وقفل الدرجات" : "التالي";

  return (
    <div className="mx-auto flex min-h-screen max-w-[440px] flex-col gap-5 p-5 pb-16">
      <div className="flex items-center gap-3">
        <button type="button" onClick={backToList} aria-label="عودة" className="text-xl">
          →
        </button>
        <div className="flex-1">
          <ProgressBar percent={progressPercent} />
        </div>
      </div>
      <p className="text-[13px] font-bold" style={{ color: "var(--color-text-secondary)" }}>
        البند {currentIndex + 1} من {total} — {participant.name}
      </p>

      {locked ? (
        <div
          className="rounded-xl px-3.5 py-2.5 text-center text-[13px] font-bold"
          style={{ background: "var(--color-warning-bg)", color: "var(--color-secondary)" }}
        >
          🔒 الدرجات مقفلة — للمراجعة فقط
        </div>
      ) : null}

      <div className="rounded-2xl border-2 p-5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
        <div className="text-[19px] font-extrabold" style={{ fontFamily: theme.heading }}>
          {criterion.name}
        </div>
        {criterion.description ? (
          <div className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {criterion.description}
          </div>
        ) : null}
        <div className="mt-2.5 text-xs font-bold" style={{ color: "var(--color-text-tertiary)" }}>
          الحد الأقصى: {criterion.max_points} نقطة
        </div>
      </div>

      {!useSlider ? (
        <div className="flex flex-wrap justify-center gap-2.5">
          {Array.from({ length: criterion.max_points + 1 }, (_, v) => v).map((v) => (
            <button
              key={v}
              type="button"
              disabled={locked}
              onClick={() => setScore(currentParticipantId, criterion.id, v)}
              className="flex h-13 w-13 items-center justify-center rounded-xl border-2 text-base font-bold"
              style={{
                background: currentVal === v ? "var(--color-primary)" : "var(--color-card)",
                color: currentVal === v ? "var(--color-on-primary)" : "var(--color-text)",
                borderColor: currentVal === v ? "transparent" : "var(--color-border)",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl font-extrabold" style={{ color: "var(--color-primary)", fontFamily: theme.heading }}>
            {currentVal === undefined ? "—" : currentVal}
          </div>
          <div className="flex w-full items-center gap-3.5">
            <button
              type="button"
              disabled={locked}
              onClick={() => setScore(currentParticipantId, criterion.id, Math.max(0, (currentVal ?? 0) - 1))}
              className="flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 text-xl font-bold"
              style={{ borderColor: "var(--color-border)" }}
            >
              −
            </button>
            <input
              type="range"
              min={0}
              max={criterion.max_points}
              value={currentVal ?? 0}
              disabled={locked}
              onChange={(e) => setScore(currentParticipantId, criterion.id, Number(e.target.value))}
              className="flex-1"
            />
            <button
              type="button"
              disabled={locked}
              onClick={() =>
                setScore(currentParticipantId, criterion.id, Math.min(criterion.max_points, (currentVal ?? 0) + 1))
              }
              className="flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 text-xl font-bold"
              style={{ borderColor: "var(--color-border)" }}
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="mt-1.5 flex gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="flex-1 rounded-xl border-2 py-3.5 text-[15px] font-bold"
          style={{ borderColor: "var(--color-border)" }}
        >
          السابق
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={nextDisabled}
          className="flex-1 rounded-xl py-3.5 text-[15px] font-bold disabled:cursor-not-allowed"
          style={{
            background: nextDisabled ? "var(--color-track)" : "var(--color-primary)",
            color: nextDisabled ? "var(--color-text-tertiary)" : "var(--color-on-primary)",
          }}
        >
          {nextLabel}
        </button>
      </div>

      {locked ? (
        <button
          type="button"
          onClick={() => requestEdit(currentParticipantId)}
          disabled={requestedEdit.has(currentParticipantId)}
          className="text-center text-[13.5px] font-bold"
          style={{ color: "var(--color-secondary)" }}
        >
          {requestedEdit.has(currentParticipantId) ? "تم إرسال الطلب ✓" : "طلب فتح للتعديل"}
        </button>
      ) : null}
    </div>
  );
}
