// تصدير PDF حقيقي (وليس نافذة طباعة المتصفح) عبر pdf-lib، بخط Amiri العربي
// مضمَّناً في الملف نفسه، مع تشكيل عربي صحيح (راجع arabic-text.ts).
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { shapeForPdf } from "./arabic-text";

export interface RankingPdfRow {
  rank: number;
  name: string;
  finalScore: number;
}

export interface RankingPdfInput {
  competitionName: string;
  publishedAtLabel: string;
  rows: RankingPdfRow[];
}

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const ROW_HEIGHT = 34;

async function loadFont(url: string) {
  const res = await fetch(url);
  return res.arrayBuffer();
}

export async function buildRankingPdf({ competitionName, publishedAtLabel, rows }: RankingPdfInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const [regularBytes, boldBytes] = await Promise.all([
    loadFont("/fonts/amiri-arabic-400.woff"),
    loadFont("/fonts/amiri-arabic-700.woff"),
  ]);
  const regular = await pdfDoc.embedFont(regularBytes, { subset: true });
  const bold = await pdfDoc.embedFont(boldBytes, { subset: true });

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function drawRtl(text: string, page: PDFPage, rightX: number, yPos: number, size: number, font: PDFFont, color = rgb(0.067, 0.067, 0.067)) {
    const shaped = shapeForPdf(text);
    const width = font.widthOfTextAtSize(shaped, size);
    page.drawText(shaped, { x: rightX - width, y: yPos, size, font, color });
    return width;
  }

  function drawHeader(p: PDFPage) {
    p.drawRectangle({ x: 0, y: PAGE_HEIGHT - 96, width: PAGE_WIDTH, height: 96, color: rgb(1, 0.698, 0.173) });
    drawRtl(competitionName, p, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 52, 14, bold);
    drawRtl("الترتيب النهائي", p, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 78, 22, bold);
  }

  drawHeader(page);
  y = PAGE_HEIGHT - 96 - 36;

  // شريط رؤوس الأعمدة
  page.drawRectangle({ x: MARGIN, y: y - 8, width: PAGE_WIDTH - MARGIN * 2, height: 26, color: rgb(0.067, 0.067, 0.067) });
  drawRtl("الترتيب", page, PAGE_WIDTH - MARGIN - 6, y, 11, bold, rgb(1, 1, 1));
  drawRtl("المتسابق", page, PAGE_WIDTH - MARGIN - 90, y, 11, bold, rgb(1, 1, 1));
  drawRtl("النتيجة النهائية", page, MARGIN + 140, y, 11, bold, rgb(1, 1, 1));

  y -= 34;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (y < MARGIN + ROW_HEIGHT) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }

    if (i % 2 === 0) {
      page.drawRectangle({
        x: MARGIN,
        y: y - 10,
        width: PAGE_WIDTH - MARGIN * 2,
        height: ROW_HEIGHT,
        color: rgb(0.98, 0.98, 0.973),
      });
    }

    const badgeColor = row.rank === 1 ? rgb(1, 0.698, 0.173) : rgb(0.941, 0.933, 0.918);
    page.drawCircle({ x: PAGE_WIDTH - MARGIN - 14, y: y + 2, size: 12, color: badgeColor });
    const rankText = String(row.rank);
    const rankWidth = bold.widthOfTextAtSize(rankText, 11);
    page.drawText(rankText, {
      x: PAGE_WIDTH - MARGIN - 14 - rankWidth / 2,
      y: y - 2,
      size: 11,
      font: bold,
      color: rgb(0.067, 0.067, 0.067),
    });

    drawRtl(row.name, page, PAGE_WIDTH - MARGIN - 40, y, 13, regular);
    page.drawText(row.finalScore.toFixed(2), { x: MARGIN + 20, y: y - 2, size: 15, font: bold, color: rgb(0.067, 0.067, 0.067) });

    y -= ROW_HEIGHT;
  }

  drawRtl(`معتمد عبر منصة التقييم — ${publishedAtLabel}`, page, PAGE_WIDTH - MARGIN, MARGIN / 2, 9, regular, rgb(0.541, 0.541, 0.541));

  return pdfDoc.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
