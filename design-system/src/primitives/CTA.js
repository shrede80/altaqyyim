/* components/primitives/CTA.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: CTA
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/**
 * CTA — لوح signal ونصّ ink. واحد لكل تصميم، ويُحذف في MINIMAL والفيديو.
 * 🔒 إحالة داخلية فقط: «الرابط في القروب» — لا اشترك ولا تابعنا ولا عدّاد مشاهدات.
 */
function CTA({
  label = "الرابط في القروب",
  as = "span",
  tone = "signal",
  style,
  ...rest
}) {
  const El = as;
  const T = {
    signal: {
      background: "var(--color-signal)",
      color: "var(--color-ink)"
    },
    paper: {
      background: "var(--color-paper)",
      color: "var(--color-ink)"
    },
    ink: {
      background: "var(--color-ink)",
      color: "var(--color-paper)"
    }
  };
  return /*#__PURE__*/React.createElement(El, _extends({
    style: {
      display: "inline-block",
      padding: "var(--space-sm) var(--space-lg)",
      borderRadius: "var(--radius-sm)",
      fontSize: "var(--type-sm)",
      fontWeight: "var(--font-bold)",
      lineHeight: 1.2,
      border: "none",
      boxShadow: "none",
      transition: "opacity var(--motion-fast) var(--motion-ease-out)",
      ...T[tone],
      ...style
    }
  }, rest), label);
}

Object.assign(Ds, { CTA });
})(window.Ds = window.Ds || {}, window.React);
