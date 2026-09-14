/* components/blocks/TextSurface.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: TextSurface
   يعتمد على: Board (ربط متأخر عبر Ds — لا يهم ترتيب التحميل)
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/** حاوية نص على أحد الأسطح الأربعة — الحشو ينزل درجة في المقاسات الصغيرة. */
function TextSurface({
  surface = "paper",
  radius = "sm",
  density = "default",
  children,
  style,
  ...rest
}) {
  const pad = density === "compact" ? "var(--space-md)" : density === "loose" ? "var(--space-xl)" : "var(--space-lg)";
  return /*#__PURE__*/React.createElement(Ds.Board, _extends({
    surface: surface,
    radius: radius,
    padding: pad,
    style: {
      display: "grid",
      gap: "var(--space-sm)",
      ...style
    }
  }, rest), children);
}

Object.assign(Ds, { TextSurface });
})(window.Ds = window.Ds || {}, window.React);
