/* components/primitives/Logo.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: Logo
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

const SRC = {
  wordmark: {
    black: "assets/logo-wordmark-black.png",
    white: "assets/logo-wordmark-white.png"
  },
  mark: {
    black: "assets/logo-mark-black.png",
    white: "assets/logo-mark-white.png"
  }
};

/**
 * الشعار الرسمي كأصل — بنسختيه فقط، بلا تلوين ولا إعادة رسم 🔒.
 * variant: wordmark (نصي) · mark (أيقونة). tone: black للفاتح · white للداكن.
 * base: مسار جذر المشروع نسبةً للصفحة (مثال: "../../").
 */
function Logo({
  variant = "wordmark",
  tone = "black",
  height = 32,
  base = "",
  opacity,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("img", _extends({
    src: base + SRC[variant][tone],
    alt: "\u0645\u0630\u064A\u0627\u0639",
    style: {
      height,
      width: "auto",
      opacity,
      boxShadow: "none",
      ...style
    }
  }, rest));
}

Object.assign(Ds, { Logo });
})(window.Ds = window.Ds || {}, window.React);
