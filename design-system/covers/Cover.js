/* Cover — غلاف برنامج مربّع (1:1).
   يصدّر: Cover
   يعتمد على: Board, Bar, Numeral, Logo (ربط متأخر عبر Ds)

   نسخة مُعاد بناؤها من Cover الأصلي لتستخدم بدائيات المكتبة بدل إعادة بنائها يدويًا:
   Board بدل لوح مبنيّ باليد، وLogo بدل window.__resources، وخاصية color الرسمية في Bar
   بدل تجاوزها عبر style. المخرج البصري مطابق للأصل بالبكسل (راجع changelog.md).

   ⚠️ لم يُستخدَم Ds.Headline هنا رغم أنه يغطي نفس واجهة expression — لأنه يفرض
   هندسة مختلفة (هامش الحافة -10% لا -12%، وعرض 110%/58% لا 112%/70%، ويصفّر خلوص
   الأذيال عند غياب الشريط). اعتماده يغيّر المخرج البصري، وهذا قرار هوية يخصّ صاحب
   النظام لا قرار إعادة هيكلة. راجع "تعارضات تحتاج حسمًا" في system.md.
*/
(function (Ds, React) {
"use strict";

/* خريطة القسم → اسم اللون، بنفس ترميز HeaderBlock/ContentCard في المكتبة
   (skill→ink · doc→clay · radio→signal). تُنتج نفس ألوان --section-* تمامًا،
   لكن بصيغة تقبلها خاصية color الرسمية في Bar. */
const SECTION_COLOR = { radio: "signal", doc: "clay", skill: "ink" };

function Cover({ surface = "paper", section = "radio", name, line, expression = "bar/under", numeral, tone }) {
  const dark = surface === "ink" || surface === "clay";
  // لون الشريط: لون القسم الرسمي افتراضيًا؛ تمرير tone صراحةً = استثناء مقصود 🔒
  const barColor = tone || SECTION_COLOR[section] || "signal";
  // تحجيم الاسم قرار المكوّن لا قرار صفحة العرض: مع رقم بطل يتنازل درجة
  const nameSize = expression === "numeral/hero" ? "var(--canvas-3xl)" : "var(--canvas-4xl)";

  return React.createElement(
    Ds.Board,
    {
      surface: surface,
      radius: "sm",
      padding: 0,
      style: { aspectRatio: "1 / 1", containerType: "size", position: "relative", overflow: "hidden" },
    },
    React.createElement(
      "div",
      { style: { position: "absolute", inset: "8%", display: "grid", alignContent: "end", gap: "var(--canvas-lg)" } },

      expression === "numeral/hero" &&
        React.createElement(Ds.Numeral, {
          value: numeral,
          scale: "hero",
          // --canvas-hero أكبر من افتراضي Numeral (رقم يملأ غلافًا 1:1)،
          // و--lh-numeral-hero هو الاستثناء الوحيد المصرَّح به لارتفاع سطر تحت ١ 🔒
          style: { fontSize: "var(--canvas-hero)", lineHeight: "var(--lh-numeral-hero)" },
        }),

      React.createElement(
        "div",
        null,
        // خلوص أذيال الحروف العربية قبل الشريط — إلزامي على العنوان نفسه 🔒
        React.createElement(
          "div",
          {
            style: {
              fontSize: nameSize,
              lineHeight: "var(--lh-lg)",
              fontWeight: "var(--font-black)",
              paddingBlockEnd: ".45em",
            },
          },
          name
        ),
        expression === "bar/under" &&
          React.createElement(Ds.Bar, { variant: "under", color: barColor, width: "70%", thickness: "2.1cqh" }),
        expression === "bar/edge" &&
          React.createElement(Ds.Bar, {
            variant: "edge",
            color: barColor,
            width: "112%",
            thickness: "2.1cqh",
            // Bar لا يوفّر خاصية لمقدار الفيض، وافتراضه -5%؛ هذا الغلاف يفيض -12%
            style: { marginInlineEnd: "-12%" },
          })
      ),

      React.createElement(
        "div",
        {
          style: {
            fontSize: "var(--canvas-xl)",
            fontWeight: "var(--font-medium)",
            color: "var(--text-muted)",
            lineHeight: "var(--lh-xs)",
            paddingInlineStart: "var(--canvas-4xl)",
          },
        },
        line
      )
    ),

    // الشعار الرسمي كأصل، بنسختيه فقط، بلا تلوين ولا إعادة رسم 🔒
    React.createElement(Ds.Logo, {
      variant: "mark",
      tone: dark ? "white" : "black",
      height: "var(--canvas-2xl)",
      opacity: "var(--opacity-secondary)",
      base: Cover.assetBase,
      style: { position: "absolute", bottom: "8%", right: "8%" },
    })
  );
}

/* جذر الأصول نسبةً للصفحة المستضيفة (Logo يبني عليه مسار الشعار). */
Cover.assetBase = "../";

Object.assign(Ds, { Cover });
})(window.Ds = window.Ds || {}, window.React);
