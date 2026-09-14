/* components/blocks/VideoFrame.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: VideoFrame
   يعتمد على: Logo (ربط متأخر عبر Ds — لا يهم ترتيب التحميل)
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

const RATIOS = {
  "16:9": "16 / 9",
  "9:16": "9 / 16",
  "1:1": "1 / 1"
};

/**
 * إطار الفيديو — قيم نسبية، منطقة أمان ٨٪ 🔒.
 * الشعار أعلى يمين وحده — لا ختم في الزاوية المقابلة.
 */
function VideoFrame({
  ratio = "16:9",
  section = "radio",
  program,
  stage = "ink",
  base = "",
  showLogo = true,
  children,
  style,
  ...rest
}) {
  const dark = stage === "ink";
  const narrow = ratio === "9:16";
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-stage": dark ? "ink" : undefined,
    style: {
      position: "relative",
      aspectRatio: RATIOS[ratio] || RATIOS["16:9"],
      background: dark ? "var(--color-ink)" : "var(--color-paper)",
      color: dark ? "var(--color-paper)" : "var(--color-ink)",
      containerType: "size",
      overflow: "hidden",
      borderRadius: "var(--radius-none)",
      ...style
    }
  }, rest), showLogo && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "8%",
      right: "8%",
      zIndex: 3
    }
  }, /*#__PURE__*/React.createElement(Ds.Logo, {
    variant: narrow ? "mark" : "wordmark",
    tone: dark ? "white" : "black",
    height: narrow ? "3cqh" : "4cqh",
    base: base,
    opacity: dark ? 0.85 : 1
  })), program && !narrow && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: "8%",
      left: "8%",
      zIndex: 3,
      fontSize: "clamp(11px,1.6cqh,20px)",
      fontWeight: "var(--font-medium)",
      opacity: 0.7
    }
  }, program), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: "8%",
      zIndex: 2,
      display: "grid"
    }
  }, children));
}

Object.assign(Ds, { VideoFrame });
})(window.Ds = window.Ds || {}, window.React);
