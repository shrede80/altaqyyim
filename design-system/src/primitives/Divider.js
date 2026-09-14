/* components/primitives/Divider.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: Divider
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/** فاصل — خط شعري للقوائم والجداول وأقسام المحتوى الطويل. */
function Divider({
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("hr", _extends({
    style: {
      border: "none",
      borderTop: "1px solid var(--border-hairline)",
      margin: "var(--space-lg) 0",
      ...style
    }
  }, rest));
}

Object.assign(Ds, { Divider });
})(window.Ds = window.Ds || {}, window.React);
