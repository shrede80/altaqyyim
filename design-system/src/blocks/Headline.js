/* components/blocks/Headline.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: Headline
   يعتمد على: Bar, Numeral (ربط متأخر عبر Ds — لا يهم ترتيب التحميل)
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/**
 * العنوان التوقيعي — يضمن خلوص أذيال الحروف داخليًا 🔒
 * يمنع تكرار (حجم + ارتفاع سطر + خلوص + شريط) في كل تطبيق.
 * expression: bar/under · bar/edge · numeral/hero · none
 */
function Headline({
  title,
  expression = "bar/under",
  color = "signal",
  numeral,
  size = "var(--type-2xl)",
  numeralSize,
  barWidth,
  barThickness,
  clearance = ".45em",
  leading = 1.26,
  maxWidth,
  as = "h2",
  style,
  ...rest
}) {
  const El = as;
  const isBar = expression === "bar/under" || expression === "bar/edge";
  const edge = expression === "bar/edge";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "grid",
      ...style
    }
  }, rest), expression === "numeral/hero" && numeral != null && /*#__PURE__*/React.createElement(Ds.Numeral, {
    value: numeral,
    scale: "hero",
    style: {
      fontSize: numeralSize || size,
      lineHeight: 1.02
    }
  }), /*#__PURE__*/React.createElement(El, {
    style: {
      fontSize: size,
      lineHeight: leading,
      fontWeight: "var(--font-black)",
      margin: 0,
      maxWidth,
      paddingBlockEnd: isBar ? clearance : 0
    }
  }, title), isBar && /*#__PURE__*/React.createElement(Ds.Bar, {
    variant: edge ? "edge" : "under",
    color: color,
    width: barWidth || (edge ? "110%" : "58%"),
    thickness: barThickness,
    style: edge ? {
      marginInlineEnd: "-10%"
    } : undefined
  }));
}

Object.assign(Ds, { Headline });
})(window.Ds = window.Ds || {}, window.React);
