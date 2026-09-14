/*
  components.jsx — المكوّنات الموجودة فعلياً في حزمة تركيب أغلفة "مذياع" (V1.1).

  Cover هو المكوّن الوحيد المُعرَّف داخل الملف المصدري. يعتمد داخلياً على
  Bar وNumeral، وكلاهما مستورد من مساحة اسم خارجية (window.Ds_f056d3) ولا
  يوجد تعريفهما في هذا الملف — راجع قسم "فجوات معروفة" في system.md قبل
  محاولة تشغيل هذا الملف بمعزل عن ذلك المصدر.
*/

const NS = window.Ds_f056d3;
const {
  Board, Bar, BarInline, Tag, Divider, Icon, Numeral, Metadata, CTA, Logo,
  ContentCard, QuoteBlock, PersonBlock, HeaderBlock, TextSurface,
  ImageSurface, VideoFrame,
} = NS; // ⚠️ فجوة مصدر خارجي — 17 اسمًا مستوردًا، لا تعريف لأيٍّ منها هنا.

/**
 * Cover — بطاقة غلاف مربّعة (1:1) لبرنامج/محتوى، بثلاثة تعبيرات بصرية بديلة
 * لموضع اللكنة اللونية أسفل الاسم (شريط تحت / شريط على الحافة / رقم بطل).
 *
 * راجع "واجهة خصائص المكوّن" في system.md لشرح كل prop والقيم المسموحة.
 */
function Cover({ surface, section, name, line, expression, numeral, tone }) {
  const dark = surface === "ink" || surface === "clay";
  // لون الشريط: لون القسم الرسمي افتراضيًا؛ تمرير tone صراحةً = استثناء مقصود 🔒
  const toneColor = tone ? `var(--color-${tone})` : `var(--section-${section})`;
  // تحجيم الاسم قرار المكوّن لا قرار صفحة العرض: مع رقم بطل يتنازل درجة
  const nameSize = expression === "numeral/hero" ? "var(--canvas-3xl)" : "var(--canvas-4xl)";
  return (
    <div
      className="sq"
      data-stage={dark ? "ink" : undefined}
      style={{ background: `var(--color-${surface})`, color: dark ? "var(--color-paper)" : "var(--color-ink)" }}
    >
      <div style={{ position: "absolute", inset: "8%", display: "grid", alignContent: "end", gap: "var(--canvas-lg)" }}>
        {expression === "numeral/hero" && (
          <Numeral value={numeral} scale="hero" style={{ fontSize: "var(--canvas-hero)", lineHeight: "var(--lh-numeral-hero)" }} />
        )}
        <div>
          <div style={{ fontSize: nameSize, lineHeight: "var(--lh-lg)", fontWeight: "var(--font-black)", paddingBlockEnd: ".45em" }}>
            {name}
          </div>
          {expression === "bar/under" && (
            <Bar variant="under" width="70%" style={{ background: toneColor, height: "2.1cqh" }} />
          )}
          {expression === "bar/edge" && (
            <Bar variant="edge" width="112%" style={{ background: toneColor, height: "2.1cqh", marginInlineEnd: "-12%" }} />
          )}
        </div>
        <div style={{ fontSize: "var(--canvas-xl)", fontWeight: "var(--font-medium)", color: "var(--text-muted)", lineHeight: "var(--lh-xs)", paddingInlineStart: "var(--canvas-4xl)" }}>
          {line}
        </div>
      </div>
      <img
        src={dark ? window.__resources.markWhite : window.__resources.markBlack}
        alt="مذياع"
        style={{ height: "var(--canvas-2xl)", width: "auto", boxShadow: "none", position: "absolute", bottom: "8%", right: "8%", opacity: "var(--opacity-secondary)" }}
      />
    </div>
  );
}

/*
  ما يلي مثال استخدام (usage sample) من الملف المصدري نفسه، وليس مكوّنًا
  قابلاً لإعادة الاستخدام — يعرض أربعة نماذج Cover داخل حاضنة معاينة شبكية
  (.g / .sq / .lbl، معرّفة في ورقة أنماط منفصلة عن tokens.css لأنها خاصة
  بالمعاينة فقط لا بالنظام القابل للتصدير). أبقيته كما هو دون تعديل منطقي.
*/
function CoverPreviewGrid() {
  return (
    <div className="g">
      <Cover surface="ink" section="radio" name="مدار" line="سؤال محوري واحد لكل ضيف" expression="bar/under" />
      <Cover surface="signal" section="radio" tone="ink" name="ستة أسئلة" line="ستّة أسئلة ثابتة، ضيف متغيّر" expression="numeral/hero" numeral="٦" />
      <Cover surface="paper" section="skill" tone="ink" name="هاوي" line="هواية واحدة تُروى بيد صاحبها" expression="bar/edge" />
      <Cover surface="clay" section="doc" tone="paper" name="حصاد" line="ما خرجنا به من الموسم" expression="bar/under" />
    </div>
  );
}
