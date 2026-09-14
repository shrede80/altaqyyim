/* components/primitives/Board.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: Board
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

const SURFACES = {
  paper: {
    background: "var(--color-paper)",
    color: "var(--color-ink)"
  },
  ink: {
    background: "var(--color-ink)",
    color: "var(--color-paper)"
  },
  signal: {
    background: "var(--color-signal)",
    color: "var(--color-ink)"
  },
  clay: {
    background: "var(--color-clay)",
    color: "var(--color-paper)"
  },
  none: {
    background: "transparent",
    color: "inherit"
  }
};
const RADII = {
  none: "var(--radius-none)",
  xs: "var(--radius-xs)",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)"
};

/** لوح مصمت — الوحدة الأساسية للتصميم. لون واحد، حافة حادّة، بلا ظل. */
function Board({
  surface = "paper",
  radius = "sm",
  padding = "var(--space-lg)",
  stage,
  style,
  children,
  ...rest
}) {
  const s = SURFACES[surface] || SURFACES.paper;
  const isDark = surface === "ink" || surface === "clay";
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-stage": stage || (isDark ? "ink" : undefined),
    style: {
      background: s.background,
      color: s.color,
      borderRadius: RADII[radius] || RADII.sm,
      padding,
      boxShadow: "none",
      ...style
    }
  }, rest), children);
}

Object.assign(Ds, { Board });
})(window.Ds = window.Ds || {}, window.React);
