import { describe, expect, it } from "vitest";
import {
  averageDropHighLow,
  averageSimple,
  averageWeighted,
  aggregateCriterionScores,
  computeFinalScore,
  computeParticipantResult,
} from "./scoring";

describe("averageSimple", () => {
  it("returns 0 for an empty list", () => {
    expect(averageSimple([])).toBe(0);
  });

  it("averages values", () => {
    expect(averageSimple([8, 9, 7])).toBeCloseTo(8);
  });
});

describe("averageDropHighLow", () => {
  it("falls back to simple average with fewer than 3 judges", () => {
    expect(averageDropHighLow([5, 9])).toBeCloseTo(averageSimple([5, 9]));
    expect(averageDropHighLow([7])).toBeCloseTo(7);
    expect(averageDropHighLow([])).toBe(0);
  });

  it("drops the single highest and lowest score with 3+ judges", () => {
    // sorted: 4,5,8 -> drop 4 and 8 -> keep 5
    expect(averageDropHighLow([8, 4, 5])).toBeCloseTo(5);
  });

  it("drops only one highest and one lowest with 4+ judges, keeping duplicates", () => {
    // sorted: 4,6,6,10 -> drop one 4 and one 10 -> keep [6,6]
    expect(averageDropHighLow([10, 6, 4, 6])).toBeCloseTo(6);
  });
});

describe("averageWeighted", () => {
  it("weights each judge's score by their vote weight", () => {
    // (8*3 + 4*1) / (3+1) = 28/4 = 7
    expect(averageWeighted([8, 4], [3, 1])).toBeCloseTo(7);
  });

  it("falls back to unweighted average when weights are missing or mismatched", () => {
    expect(averageWeighted([8, 4])).toBeCloseTo(averageSimple([8, 4]));
    expect(averageWeighted([8, 4], [1])).toBeCloseTo(averageSimple([8, 4]));
  });

  it("falls back to simple average when total weight is zero", () => {
    expect(averageWeighted([8, 4], [0, 0])).toBeCloseTo(averageSimple([8, 4]));
  });
});

describe("aggregateCriterionScores", () => {
  const values = [10, 6, 4];
  it("dispatches to simple_average by default", () => {
    expect(aggregateCriterionScores(values, "simple_average")).toBeCloseTo(averageSimple(values));
  });

  it("dispatches to drop_high_low", () => {
    expect(aggregateCriterionScores(values, "drop_high_low")).toBeCloseTo(6);
  });

  it("dispatches to weighted_average", () => {
    expect(aggregateCriterionScores(values, "weighted_average", [1, 1, 2])).toBeCloseTo(
      averageWeighted(values, [1, 1, 2]),
    );
  });
});

describe("computeFinalScore", () => {
  it("sums each criterion's average weighted by its percent", () => {
    const result = computeFinalScore([
      { criterionId: "a", average: 8, weightPercent: 40, contribution: 0 },
      { criterionId: "b", average: 5, weightPercent: 60, contribution: 0 },
    ]);
    // 8*0.4 + 5*0.6 = 3.2 + 3 = 6.2
    expect(result).toBeCloseTo(6.2);
  });
});

describe("computeParticipantResult", () => {
  const criteria = [
    { id: "content", weightPercent: 60 },
    { id: "timing", weightPercent: 40 },
  ];

  it("computes per-criterion contributions and final score for several weighted criteria", () => {
    const scoresByCriterion = {
      content: [9, 7, 8],
      timing: [4, 5],
    };
    const result = computeParticipantResult(criteria, scoresByCriterion, "simple_average");

    expect(result.perCriterion).toHaveLength(2);
    expect(result.perCriterion[0].average).toBeCloseTo(8); // (9+7+8)/3
    expect(result.perCriterion[0].contribution).toBeCloseTo(4.8); // 8 * 0.6
    expect(result.perCriterion[1].average).toBeCloseTo(4.5); // (4+5)/2
    expect(result.perCriterion[1].contribution).toBeCloseTo(1.8); // 4.5 * 0.4
    expect(result.finalScore).toBeCloseTo(6.6);
  });

  it("treats a missing criterion's scores as an empty list contributing 0", () => {
    const result = computeParticipantResult(criteria, { content: [10] }, "simple_average");
    expect(result.perCriterion[1].average).toBe(0);
    expect(result.finalScore).toBeCloseTo(6); // 10*0.6 + 0*0.4
  });

  it("applies drop_high_low per criterion when 3+ judges scored it", () => {
    const scoresByCriterion = {
      content: [10, 6, 4], // drop 10 and 4 -> 6
      timing: [5, 3], // fewer than 3 -> simple average -> 4
    };
    const result = computeParticipantResult(criteria, scoresByCriterion, "drop_high_low");
    expect(result.perCriterion[0].average).toBeCloseTo(6);
    expect(result.perCriterion[1].average).toBeCloseTo(4);
    expect(result.finalScore).toBeCloseTo(6 * 0.6 + 4 * 0.4);
  });

  it("applies weighted_average per criterion using judge weights", () => {
    const scoresByCriterion = {
      content: [8, 4],
      timing: [10, 2],
    };
    const judgeWeights = [3, 1];
    const result = computeParticipantResult(criteria, scoresByCriterion, "weighted_average", judgeWeights);
    expect(result.perCriterion[0].average).toBeCloseTo(7); // (8*3+4*1)/4
    expect(result.perCriterion[1].average).toBeCloseTo(8); // (10*3+2*1)/4
    expect(result.finalScore).toBeCloseTo(7 * 0.6 + 8 * 0.4);
  });
});
