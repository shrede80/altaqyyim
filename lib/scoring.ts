// منطق تجميع درجات التحكيم — وحدة مستقلة قابلة لإعادة الاستخدام.
// TypeScript port of scoring.js مع نفس القواعد الحسابية بالضبط.

import type { AggregationRule } from "./types";

export interface Criterion {
  id: string;
  weightPercent: number;
}

export type ScoresByCriterion = Record<string, number[]>;

export interface CriterionResult {
  criterionId: string;
  average: number;
  weightPercent: number;
  contribution: number;
}

export interface ParticipantResult {
  perCriterion: CriterionResult[];
  finalScore: number;
}

export function averageSimple(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// إسقاط أعلى وأقل درجة — يتطلب 3 محكّمين فأكثر، وإلا يُستخدم المتوسط البسيط كبديل آمن
export function averageDropHighLow(values: number[]): number {
  if (values.length < 3) return averageSimple(values);
  const sorted = [...values].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, -1);
  return averageSimple(trimmed);
}

// متوسط مرجّح حسب وزن تصويت كل محكّم
export function averageWeighted(values: number[], weights?: number[]): number {
  const w = weights && weights.length === values.length ? weights : values.map(() => 1);
  const totalWeight = w.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return averageSimple(values);
  const weightedSum = values.reduce((sum, v, i) => sum + v * w[i], 0);
  return weightedSum / totalWeight;
}

export function aggregateCriterionScores(
  judgeScores: number[],
  rule: AggregationRule,
  judgeWeights?: number[],
): number {
  switch (rule) {
    case "drop_high_low":
      return averageDropHighLow(judgeScores);
    case "weighted_average":
      return averageWeighted(judgeScores, judgeWeights);
    case "simple_average":
    default:
      return averageSimple(judgeScores);
  }
}

// النتيجة النهائية = مجموع (متوسط كل بند × وزن البند%)
export function computeFinalScore(criteriaResults: CriterionResult[]): number {
  return criteriaResults.reduce((sum, c) => sum + c.average * (c.weightPercent / 100), 0);
}

export function computeParticipantResult(
  criteria: Criterion[],
  scoresByCriterion: ScoresByCriterion,
  rule: AggregationRule,
  judgeWeights?: number[],
): ParticipantResult {
  const perCriterion = criteria.map((c) => {
    const values = scoresByCriterion[c.id] || [];
    const average = aggregateCriterionScores(values, rule, judgeWeights);
    return {
      criterionId: c.id,
      average,
      weightPercent: c.weightPercent,
      contribution: average * (c.weightPercent / 100),
    };
  });
  const finalScore = perCriterion.reduce((s, c) => s + c.contribution, 0);
  return { perCriterion, finalScore };
}
