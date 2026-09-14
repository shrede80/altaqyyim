/* components/blocks/ContentCard.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: ContentCard
   يعتمد على: Bar, Board, ImageSurface, Metadata, Numeral, Tag (ربط متأخر عبر Ds — لا يهم ترتيب التحميل)
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

const SECTION_LABEL = {
  radio: "الإذاعي",
  doc: "الوثائقي",
  skill: "المهاري"
};

/**
 * بطاقة المحتوى الموحّدة: برنامج · حلقة · مقال · مضغوطة.
 * 🔒 قاعدة الشبكة: داخل شبكة من ٣ عناصر فأكثر مرّر inGrid لحذف الشريط.
 */
function ContentCard({
  title,
  section = "radio",
  program,
  description,
  date,
  duration,
  episode,
  image,
  imageMode = "raw",
  ratio = "16:9",
  variant = "episode",
  inGrid = false,
  surface = "paper",
  href,
  style,
  ...rest
}) {
  const compact = variant === "compact";
  const showBar = !inGrid && !compact;
  const barColor = section === "skill" ? "ink" : section === "doc" ? "clay" : "signal";
  const titleSize = variant === "program" ? "var(--type-xl)" : compact ? "var(--type-md)" : "var(--type-lg)";
  const El = href ? "a" : "div";
  const meta = [SECTION_LABEL[section], program, date, duration].filter(Boolean);
  return /*#__PURE__*/React.createElement(Ds.Board, _extends({
    as: "div",
    surface: surface,
    padding: compact ? "var(--space-md)" : "var(--space-lg)",
    style: {
      display: "grid",
      gap: compact ? "var(--space-sm)" : "var(--space-md)",
      border: surface === "paper" ? "1px solid var(--border-hairline)" : "none",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(Ds.Metadata, {
    fields: compact ? meta.slice(0, 2) : meta
  }), !compact && /*#__PURE__*/React.createElement(Ds.ImageSurface, {
    src: image,
    mode: image ? imageMode : "none",
    state: section,
    ratio: ratio,
    placement: section === "doc" ? "crop" : "contained"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-xs)",
      justifyItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement(El, {
    href: href,
    style: {
      border: "none",
      color: "inherit",
      display: "grid",
      gap: "var(--space-2xs)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: titleSize,
      lineHeight: "var(--lh-lg)",
      fontWeight: "var(--font-black)",
      margin: 0
    }
  }, title), showBar && /*#__PURE__*/React.createElement(Ds.Bar, {
    variant: "under",
    color: barColor,
    width: "72%"
  })), description && !compact && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--type-sm)",
      lineHeight: "var(--lh-sm)",
      color: "var(--text-muted)",
      margin: 0
    }
  }, description), episode != null && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-xs)",
      marginBlockStart: "var(--space-2xs)"
    }
  }, /*#__PURE__*/React.createElement(Ds.Tag, {
    tone: "outline"
  }, "\u0627\u0644\u062D\u0644\u0642\u0629 ", /*#__PURE__*/React.createElement(Ds.Numeral, {
    value: episode
  })))));
}

Object.assign(Ds, { ContentCard });
})(window.Ds = window.Ds || {}, window.React);
