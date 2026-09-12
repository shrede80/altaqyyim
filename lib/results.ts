// يجمّع الدرجات الخام (كل درجة من كل محكّم) في نتائج جاهزة للعرض في لوحة
// النتائج: متوسط كل بند حسب قاعدة التجميع، النتيجة النهائية، ونسبة اكتمال
// كل متسابق (نسبة المحكّمين المعيّنين الذين سجّلوا كل بنود هذا المتسابق).

import { aggregateCriterionScores, type CriterionResult } from "./scoring";
import type { AggregationRule, Criterion, Participant } from "./types";

export interface RawScoreRow {
  participant_id: string;
  criterion_id: string;
  judge_id: string;
  points: number;
}

export interface ParticipantResultRow {
  participantId: string;
  name: string;
  finalScore: number;
  completionPercent: number;
  perCriterion: (CriterionResult & { name: string })[];
}

export function computeCompetitionResults({
  criteria,
  participants,
  assignedJudgeIds,
  scores,
  aggregationRule,
  judgeWeights,
}: {
  criteria: Criterion[];
  participants: Participant[];
  assignedJudgeIds: string[];
  scores: RawScoreRow[];
  aggregationRule: AggregationRule;
  judgeWeights?: Record<string, number>;
}): { rows: ParticipantResultRow[]; allComplete: boolean } {
  const totalJudges = assignedJudgeIds.length;
  let allComplete = totalJudges > 0;

  const rows = participants.map((p) => {
    let judgesWhoCompletedThisParticipant = 0;
    for (const judgeId of assignedJudgeIds) {
      const scoredAll = criteria.every((c) =>
        scores.some((s) => s.participant_id === p.id && s.criterion_id === c.id && s.judge_id === judgeId),
      );
      if (scoredAll) judgesWhoCompletedThisParticipant += 1;
    }
    const completionPercent = totalJudges > 0 ? Math.round((judgesWhoCompletedThisParticipant / totalJudges) * 100) : 0;
    if (completionPercent < 100) allComplete = false;

    const perCriterion = criteria.map((c) => {
      const rowsForCriterion = scores.filter((s) => s.participant_id === p.id && s.criterion_id === c.id);
      const values = rowsForCriterion.map((r) => r.points);
      // أوزان المحكّمين تُبنى بنفس ترتيب values (ترتيب من سجّل هذا البند فعلياً)،
      // لا بترتيب assignedJudgeIds الثابت — لأن محكّمين مختلفين قد يسجّلون بنوداً مختلفة.
      const weights = rowsForCriterion.map((r) => judgeWeights?.[r.judge_id] ?? 1);
      const average = aggregateCriterionScores(values, aggregationRule, weights);
      return {
        criterionId: c.id,
        name: c.name,
        average,
        weightPercent: c.weight_percent,
        contribution: average * (c.weight_percent / 100),
      };
    });

    const finalScore = perCriterion.reduce((s, c) => s + c.contribution, 0);

    return {
      participantId: p.id,
      name: p.name,
      finalScore,
      completionPercent,
      perCriterion,
    };
  });

  rows.sort((a, b) => b.finalScore - a.finalScore);

  return { rows, allComplete };
}
