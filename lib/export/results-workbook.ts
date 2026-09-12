import ExcelJS from "exceljs";
import type { ParticipantResultRow } from "@/lib/results";

export interface WorkbookInput {
  competitionName: string;
  judgeLabels: string[]; // "محكّم 1", "محكّم 2", ... بترتيب ثابت غير مرتبط بهوية حقيقية
  rows: ParticipantResultRow[];
  scoresByParticipantCriterionJudge: Record<string, Record<string, (number | null)[]>>; // [participantId][criterionId] -> نقاط كل محكّم بنفس ترتيب judgeLabels
}

export async function buildResultsWorkbook({
  competitionName,
  judgeLabels,
  rows,
  scoresByParticipantCriterionJudge,
}: WorkbookInput): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "منصة التقييم";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(competitionName.slice(0, 30) || "النتائج", {
    views: [{ rightToLeft: true }],
  });

  const header = ["المتسابق", "البند", ...judgeLabels, "متوسط البند", "وزن البند %", "مساهمة البند", "النتيجة النهائية"];
  sheet.addRow(header);
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111111" } };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  for (const row of rows) {
    for (const c of row.perCriterion) {
      const judgeValues = scoresByParticipantCriterionJudge[row.participantId]?.[c.criterionId] ?? [];
      sheet.addRow([
        row.name,
        c.name,
        ...judgeLabels.map((_, i) => judgeValues[i] ?? null),
        Number(c.average.toFixed(2)),
        c.weightPercent,
        Number(c.contribution.toFixed(2)),
        Number(row.finalScore.toFixed(2)),
      ]);
    }
  }

  sheet.columns.forEach((col, idx) => {
    col.width = idx === 0 || idx === 1 ? 22 : 14;
  });
  sheet.eachRow((row) => {
    row.alignment = { ...row.alignment, horizontal: "center", vertical: "middle" };
  });

  return workbook.xlsx.writeBuffer();
}

export function downloadWorkbook(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
