/* components/primitives/Icon.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: ICON_SET, Icon
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

const CDN = "https://unpkg.com/lucide-static@0.469.0/icons/";

/**
 * أيقونة وظيفية — Stroke 2px على شبكة 24، بلا ميلان وبلا لون بارز.
 * المجموعة المعتمدة ≤ ١٢ أيقونة (§17). تُحمَّل من Lucide (بديل مُعلَن — لا مجموعة أيقونات رسمية مسلَّمة).
 */
const ICON_SET = {
  play: "play",
  pause: "pause",
  time: "clock",
  date: "calendar",
  share: "share-2",
  link: "link",
  download: "download",
  search: "search",
  arrow: "arrow-left",
  menu: "menu",
  close: "x",
  sound: "volume-2"
};
function Icon({
  name = "play",
  size = 24,
  state = "default",
  color = "currentColor",
  style,
  ...rest
}) {
  const file = ICON_SET[name] || name;
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "img",
    "aria-label": name,
    style: {
      display: "inline-block",
      width: size,
      height: size,
      background: color,
      opacity: state === "disabled" ? 0.4 : 1,
      WebkitMask: `url(${CDN}${file}.svg) center / ${Math.round(size * 0.84)}px no-repeat`,
      mask: `url(${CDN}${file}.svg) center / ${Math.round(size * 0.84)}px no-repeat`,
      verticalAlign: "middle",
      ...style
    }
  }, rest));
}

Object.assign(Ds, { ICON_SET, Icon });
})(window.Ds = window.Ds || {}, window.React);
