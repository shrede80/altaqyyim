// pdf-lib يرسم كل حرف بالترتيب المنطقي من اليسار لليمين دون تشكيل سياقي
// (لا يدعم OpenType shaping)، فالنص العربي الخام يظهر منفصل الحروف ومقلوب
// الاتجاه. الحل القياسي المستخدم مع pdf-lib/jsPDF: تحويل كل حرف إلى صورته
// السياقية الصحيحة (Arabic Presentation Forms) عبر arabic-reshaper، ثم عكس
// ترتيب الحروف ليصبح رسمها من اليسار لليمين مطابقاً بصرياً للقراءة من اليمين
// لليسار. يفترض هذا أن كل سلسلة نص مُمرَّرة عربية بالكامل أو لاتينية بالكامل؛
// لا يُطبَّق bidi كامل لخلط الاتجاهين داخل السطر نفسه (غير مطلوب في جداول
// هذا التصدير لأن كل عمود يُرسم بمعزل عن الآخر).
import { convertArabic } from "arabic-reshaper";

const ARABIC_RE = /[؀-ۿ]/;

export function shapeForPdf(text: string): string {
  if (!ARABIC_RE.test(text)) return text;
  const reshaped = convertArabic(text);
  return Array.from(reshaped).reverse().join("");
}
