/* components/blocks/PersonBlock.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: PersonBlock
   يعتمد على: Bar, Board, ImageSurface, Metadata (ربط متأخر عبر Ds — لا يهم ترتيب التحميل)
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/**
 * ضيف / شخص — بنية واحدة: اسم + شريط + مسمّى.
 * variant: announcement (الاسم Primary) · inline (Secondary) · lowerThird (داخل أمان ٨٪)
 */
function PersonBlock({
  name,
  role,
  program,
  section = "radio",
  image,
  variant = "inline",
  canvas = false,
  style,
  ...rest
}) {
  const barColor = section === "skill" ? "paper" : section === "doc" ? "clay" : "signal";
  if (variant === "lowerThird") {
    return /*#__PURE__*/React.createElement(Ds.Board, _extends({
      surface: "ink",
      padding: "var(--space-md) var(--space-xl)",
      style: {
        display: "inline-grid",
        gap: 0,
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: canvas ? "var(--canvas-lg)" : "var(--type-lg)",
        fontWeight: "var(--font-black)",
        lineHeight: "var(--lh-lg)",
        margin: 0
      }
    }, name), /*#__PURE__*/React.createElement(Ds.Bar, {
      variant: "under",
      color: barColor,
      width: "100%",
      style: {
        marginBlockStart: "0.5em"
      }
    }), role && /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: canvas ? "var(--canvas-md)" : "var(--type-md)",
        fontWeight: "var(--font-medium)",
        lineHeight: "var(--lh-md)",
        margin: "var(--space-2xs) 0 0",
        color: "var(--text-muted-inverse)"
      }
    }, role));
  }
  const primary = variant === "announcement";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "grid",
      gap: "var(--space-lg)",
      ...style
    }
  }, rest), (image || primary) && /*#__PURE__*/React.createElement(Ds.ImageSurface, {
    src: image,
    mode: image ? "raw" : "none",
    state: section,
    ratio: "4:5",
    placement: "contained"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-2xs)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: primary ? canvas ? "var(--canvas-2xl)" : "var(--type-2xl)" : "var(--type-lg)",
      fontWeight: primary ? "var(--font-black)" : "var(--font-bold)",
      lineHeight: primary ? "var(--lh-2xl)" : "var(--lh-lg)",
      margin: 0
    }
  }, name), primary && /*#__PURE__*/React.createElement(Ds.Bar, {
    variant: "under",
    color: barColor,
    width: "58%",
    style: {
      marginBlockStart: "0.24em"
    }
  })), /*#__PURE__*/React.createElement(Ds.Metadata, {
    fields: [role, program].filter(Boolean)
  })));
}

Object.assign(Ds, { PersonBlock });
})(window.Ds = window.Ds || {}, window.React);
