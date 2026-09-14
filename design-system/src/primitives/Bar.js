/* components/primitives/Bar.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: Bar, BarInline
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/**
 * الشريط — البصمة الأولى. متوازي أضلاع مائل ٨°، سُمكه ١٥٪ من ارتفاع الحرف.
 * الفجوة ٣٤٪ من حجم الخط المحيط. أذيال الحروف العربية تنزل خارج صندوق السطر،
 * فيجب أن يحمل العنوان نفسه `paddingBlockEnd: .45em` قبل الشريط 🔒.
 * variant: under (تحت الكتلة) · edge (ملاصق للحافة يمتدّ خارجها) · inline (تحت كلمة) · gap (فاصل بين كتلتين)
 */
function Bar({
  variant = "under",
  color = "signal",
  width,
  thickness,
  style,
  ...rest
}) {
  const bg = `var(--color-${color})`;
  const base = {
    background: bg,
    borderRadius: "var(--radius-xs)",
    transform: "skewX(-8deg)",
    boxShadow: "none",
    flex: "none"
  };
  const V = {
    under: {
      height: thickness || "0.15em",
      width: width || "100%",
      marginBlockStart: "0.34em"
    },
    edge: {
      height: thickness || "0.15em",
      width: width || "105%",
      marginInlineEnd: "-5%",
      marginBlockStart: "0.34em"
    },
    inline: {
      height: thickness || "0.13em",
      width: width || "100%",
      marginBlockStart: "0.2em"
    },
    gap: {
      height: thickness || "6px",
      width: width || "18%",
      marginBlock: "var(--space-xl)"
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    "aria-hidden": "true",
    style: {
      ...base,
      ...(V[variant] || V.under),
      ...style
    }
  }, rest));
}

/** كلمة مفتاحية عليها bar/inline — تُستخدم داخل نفس كتلة العنوان فقط. */
function BarInline({
  children,
  color = "signal"
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("span", null, children), /*#__PURE__*/React.createElement(Bar, {
    variant: "inline",
    color: color
  }));
}

Object.assign(Ds, { Bar, BarInline });
})(window.Ds = window.Ds || {}, window.React);
