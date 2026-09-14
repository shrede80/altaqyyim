/* components/primitives/Numeral.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: Numeral
   دوال داخلية غير مصدَّرة في الحزمة الأصلية: toArabicDigits
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

const AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const toArabicDigits = v => String(v).replace(/[0-9]/g, d => AR[+d]);

/** رقم عربي Black — hero واحد لكل تصميم. */
function Numeral({
  value,
  scale = "inline",
  canvas = false,
  style,
  ...rest
}) {
  const hero = scale === "hero";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      fontWeight: "var(--font-black)",
      fontSize: hero ? canvas ? "var(--canvas-3xl)" : "var(--type-3xl)" : "inherit",
      lineHeight: hero ? "var(--lh-3xl)" : "inherit",
      display: hero ? "block" : "inline",
      ...style
    }
  }, rest), toArabicDigits(value));
}

Object.assign(Ds, { Numeral });
})(window.Ds = window.Ds || {}, window.React);
