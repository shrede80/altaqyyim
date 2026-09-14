/* components/blocks/QuoteBlock.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: QuoteBlock
   يعتمد على: Bar, Board, Metadata (ربط متأخر عبر Ds — لا يهم ترتيب التحميل)
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/**
 * اقتباس قابل للنشر وحده — لا علامات تنصيص مرسومة كزخرفة.
 * variant: standalone (منشور) · inline (داخل مقال)
 */
function QuoteBlock({
  quote,
  speaker,
  role,
  program,
  section = "radio",
  variant = "standalone",
  canvas = false,
  style,
  ...rest
}) {
  const standalone = variant === "standalone";
  const size = canvas ? "var(--canvas-2xl)" : standalone ? "var(--type-2xl)" : "var(--type-xl)";
  const barColor = section === "skill" ? "paper" : section === "doc" ? "clay" : "signal";
  return /*#__PURE__*/React.createElement(Ds.Board, _extends({
    surface: standalone ? "ink" : "paper",
    padding: standalone ? "var(--space-3xl)" : "var(--space-xl)",
    style: {
      position: "relative",
      display: "grid",
      gap: "var(--space-lg)",
      alignContent: "space-between",
      height: "100%",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 0,
      marginBlockStart: standalone ? "var(--space-xl)" : 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: size,
      lineHeight: "var(--lh-2xl)",
      fontWeight: "var(--font-black)",
      margin: 0,
      maxWidth: "18ch"
    }
  }, quote), /*#__PURE__*/React.createElement(Ds.Bar, {
    variant: "under",
    color: barColor,
    width: "46%"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-2xs)"
    }
  }, speaker && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: canvas ? "var(--canvas-lg)" : "var(--type-lg)",
      fontWeight: "var(--font-bold)",
      lineHeight: "var(--lh-lg)",
      margin: 0
    }
  }, speaker), /*#__PURE__*/React.createElement(Ds.Metadata, {
    fields: [role, program].filter(Boolean)
  })));
}

Object.assign(Ds, { QuoteBlock });
})(window.Ds = window.Ds || {}, window.React);
