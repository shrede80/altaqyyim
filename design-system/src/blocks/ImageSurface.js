/* components/blocks/ImageSurface.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: ImageSurface
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

const RATIOS = {
  "1:1": "1 / 1",
  "4:5": "4 / 5",
  "3:4": "3 / 4",
  "16:9": "16 / 9",
  "9:16": "9 / 16"
};

/**
 * حاوية صورة — بعدان مستقلان:
 * mode: raw · archive (دوتون حبر→طين) · none (لا صورة: لوح لوني مصمت)
 * placement: contained · beside · bleed · crop
 * 🔒 كل قالب يجب أن يعمل في mode="none".
 */
function ImageSurface({
  src,
  alt = "",
  mode = "raw",
  placement = "contained",
  ratio = "4:5",
  state = "radio",
  caption,
  source,
  focus = "50% 50%",
  radius = "sm",
  children,
  style,
  ...rest
}) {
  const r = RATIOS[ratio] || RATIOS["4:5"];
  const rad = placement === "bleed" ? "var(--radius-none)" : `var(--radius-${radius})`;
  const frame = {
    position: "relative",
    aspectRatio: r,
    borderRadius: rad,
    overflow: "hidden",
    background: mode === "archive" ? "var(--color-clay)" : "var(--color-ink)",
    boxShadow: "none"
  };
  const imgStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: focus,
    transform: placement === "crop" ? "scale(1.6)" : "none",
    filter: mode === "archive" ? "grayscale(1) contrast(1.15)" : "none",
    mixBlendMode: mode === "archive" ? "luminosity" : "normal"
  };
  return /*#__PURE__*/React.createElement("figure", _extends({
    style: {
      margin: 0,
      display: "grid",
      gap: "var(--space-xs)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: frame
  }, mode === "none" || !src ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: state === "doc" ? "var(--color-clay)" : state === "skill" ? "var(--color-ink)" : "var(--color-signal)",
      display: "grid",
      placeItems: "center",
      padding: "8%"
    }
  }, children) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: imgStyle
  }), children)), (caption || source) && /*#__PURE__*/React.createElement("figcaption", {
    style: {
      fontSize: "var(--type-sm)",
      lineHeight: "var(--lh-sm)",
      color: "var(--text-muted)"
    }
  }, caption, source ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--type-xs)"
    }
  }, caption ? " — " : "", source) : null));
}

Object.assign(Ds, { ImageSurface });
})(window.Ds = window.Ds || {}, window.React);
