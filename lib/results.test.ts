import { describe, expect, it } from "vitest";
import { computeCompetitionResults } from "./results";
import type { Criterion, Participant } from "./types";

const criteria: Criterion[] = [
  {
    id: "c1",
    competition_id: "comp",
    name: "المحتوى",
    description: null,
    max_points: 10,
    weight_percent: 60,
    order_index: 0,
    source_template_criterion_id: null,
  },
  {
    id: "c2",
    competition_id: "comp",
    name: "الوقت",
    description: null,
    max_points: 10,
    weight_percent: 40,
    order_index: 1,
    source_template_criterion_id: null,
  },
];

const participants: Participant[] = [
  { id: "p1", competition_id: "comp", type: "individual", name: "نورة", number: null, extra: {}, created_at: "" },
  { id: "p2", competition_id: "comp", type: "individual", name: "خالد", number: null, extra: {}, created_at: "" },
];

describe("computeCompetitionResults", () => {
  it("computes completion percent and ranks participants by final score", () => {
    const { rows, allComplete } = computeCompetitionResults({
      criteria,
      participants,
      assignedJudgeIds: ["j1", "j2"],
      aggregationRule: "simple_average",
      scores: [
        { participant_id: "p1", criterion_id: "c1", judge_id: "j1", points: 9 },
        { participant_id: "p1", criterion_id: "c1", judge_id: "j2", points: 8 },
        { participant_id: "p1", criterion_id: "c2", judge_id: "j1", points: 5 },
        { participant_id: "p1", criterion_id: "c2", judge_id: "j2", points: 4 },
        // خالد: محكّم واحد فقط سجّل له حتى الآن — غير مكتمل
        { participant_id: "p2", criterion_id: "c1", judge_id: "j1", points: 10 },
        { participant_id: "p2", criterion_id: "c2", judge_id: "j1", points: 10 },
      ],
    });

    expect(allComplete).toBe(false);

    const noura = rows.find((r) => r.participantId === "p1")!;
    expect(noura.completionPercent).toBe(100);
    // (9+8)/2 * 0.6 + (5+4)/2 * 0.4 = 8.5*0.6 + 4.5*0.4 = 5.1 + 1.8 = 6.9
    expect(noura.finalScore).toBeCloseTo(6.9);

    const khalid = rows.find((r) => r.participantId === "p2")!;
    expect(khalid.completionPercent).toBe(50);
    // متوسط بسيط لدرجة واحدة فقط لكل بند = 10*0.6 + 10*0.4 = 10
    expect(khalid.finalScore).toBeCloseTo(10);

    // خالد أعلى نتيجة نهائية بالأرقام رغم عدم الاكتمال — الترتيب حسب finalScore فقط
    expect(rows[0].participantId).toBe("p2");
  });

  it("applies per-judge weights only from the judges who actually scored a given criterion", () => {
    const { rows } = computeCompetitionResults({
      criteria,
      participants: [participants[0]],
      assignedJudgeIds: ["j1", "j2", "j3"],
      aggregationRule: "weighted_average",
      judgeWeights: { j1: 3, j2: 1, j3: 5 },
      scores: [
        // j3 (الوزن الأعلى) لم يسجّل هذا البند بعد — يجب ألا يدخل في الحساب
        { participant_id: "p1", criterion_id: "c1", judge_id: "j1", points: 8 },
        { participant_id: "p1", criterion_id: "c1", judge_id: "j2", points: 4 },
        { participant_id: "p1", criterion_id: "c2", judge_id: "j1", points: 6 },
      ],
    });

    const c1 = rows[0].perCriterion.find((c) => c.criterionId === "c1")!;
    // (8*3 + 4*1) / (3+1) = 28/4 = 7
    expect(c1.average).toBeCloseTo(7);
  });
});
