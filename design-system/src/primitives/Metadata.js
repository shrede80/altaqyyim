/* components/primitives/Metadata.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: Metadata
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

const LATIN_RUN = /^[\d\s:\-\/.,]+$/;

/** سطر بيانات واحد مضغوط — الفاصل الرسمي «—» (النقطة الوسطى غير موجودة في الخط 🔒). */
function Metadata({
  fields = [],
  density = "full",
  style,
  ...rest
}) {
  const items = (density === "compact" ? fields.slice(0, 2) : fields).filter(Boolean);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexWrap: "nowrap",
      alignItems: "center",
      gap: "var(--space-sm)",
      fontSize: "var(--type-xs)",
      fontWeight: "var(--font-medium)",
      lineHeight: "var(--lh-xs)",
      color: "var(--text-muted)",
      ...style
    }
  }, rest), items.map((f, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "\u2014"), /*#__PURE__*/React.createElement("span", {
    style: typeof f === "string" && LATIN_RUN.test(f) ? {
      direction: "ltr",
      unicodeBidi: "isolate",
      fontVariantNumeric: "tabular-nums"
    } : undefined
  }, f))));
}

Object.assign(Ds, { Metadata });
})(window.Ds = window.Ds || {}, window.React);
