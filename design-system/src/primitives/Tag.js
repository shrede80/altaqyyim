/* components/primitives/Tag.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: Tag
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/** وسم مائل مغلق — لا وسم بلا نص. tone: outline · signal · clay · ink */
function Tag({
  label,
  tone = "outline",
  children,
  style,
  ...rest
}) {
  const T = {
    outline: {
      background: "transparent",
      color: "var(--text-primary)",
      border: "1px solid var(--border-hairline)"
    },
    signal: {
      background: "var(--color-signal)",
      color: "var(--color-ink)",
      border: "none"
    },
    clay: {
      background: "var(--color-clay)",
      color: "var(--color-paper)",
      border: "none"
    },
    ink: {
      background: "var(--color-ink)",
      color: "var(--color-paper)",
      border: "none"
    },
    paper: {
      background: "var(--color-paper)",
      color: "var(--color-ink)",
      border: "none"
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-block",
      transform: "skewX(-8deg)",
      borderRadius: "var(--radius-xs)",
      padding: "var(--space-2xs) var(--space-sm)",
      fontSize: "var(--type-xs)",
      fontWeight: "var(--font-medium)",
      lineHeight: "var(--lh-xs)",
      whiteSpace: "nowrap",
      ...T[tone],
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      transform: "skewX(8deg)"
    }
  }, label ?? children));
}

Object.assign(Ds, { Tag });
})(window.Ds = window.Ds || {}, window.React);
