/* components/blocks/HeaderBlock.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: HeaderBlock
   يعتمد على: Bar, ImageSurface, Metadata, Numeral (ربط متأخر عبر Ds — لا يهم ترتيب التحميل)
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
 * رأس موحّد: مقال · غلاف برنامج · ملصق. بنية واحدة = بيانات + عنوان + تعبير + صورة.
 * expression: bar/under · bar/edge · numeral/hero
 */
function HeaderBlock({
  title,
  program,
  section = "radio",
  intro,
  metaFields,
  image,
  imageMode = "raw",
  variant = "article",
  expression = "bar/under",
  numeral,
  imagePlacement = "below",
  canvas = false,
  ratio = "16:9",
  style,
  ...rest
}) {
  const poster = variant === "poster";
  const cover = variant === "cover";
  const titleSize = canvas ? poster || cover ? "var(--canvas-3xl)" : "var(--canvas-2xl)" : poster || cover ? "var(--type-3xl)" : "var(--type-2xl)";
  const barColor = section === "skill" ? "ink" : section === "doc" ? "clay" : "signal";
  const fields = metaFields || [SECTION_LABEL[section], program].filter(Boolean);
  // عمودان فقط عند وجود صورة فعلية — بلا صورة يبقى العنوان بعرض كامل فلا يتقطّع كلمةً كلمة
  const side = imagePlacement === "side" && !!image;
  const titleBlock = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 0,
      justifyItems: "stretch"
    }
  }, expression === "numeral/hero" && numeral != null && /*#__PURE__*/React.createElement(Ds.Numeral, {
    value: numeral,
    scale: "hero",
    canvas: canvas,
    style: {
      marginBlockEnd: "var(--space-xs)"
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: titleSize,
      lineHeight: "var(--lh-3xl)",
      fontWeight: "var(--font-black)",
      margin: 0,
      maxWidth: "16ch",
      paddingBlockEnd: ".45em"
    }
  }, title), (expression === "bar/under" || expression === "bar/edge") && /*#__PURE__*/React.createElement(Ds.Bar, {
    variant: expression === "bar/edge" ? "edge" : "under",
    color: barColor,
    width: expression === "bar/edge" ? "108%" : "64%"
  }));
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      position: "relative",
      display: "grid",
      gap: "var(--space-xl)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      display: side ? "grid" : "block",
      gridTemplateColumns: side ? "1.15fr .85fr" : undefined,
      gap: "var(--space-2xl)",
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement(Ds.Metadata, {
    fields: fields
  }), titleBlock, intro && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: canvas ? "var(--canvas-md)" : "var(--type-md)",
      fontWeight: "var(--font-medium)",
      lineHeight: "var(--lh-md)",
      margin: 0,
      maxWidth: "48ch"
    }
  }, intro)), side && image && /*#__PURE__*/React.createElement(Ds.ImageSurface, {
    src: image,
    mode: imageMode,
    state: section,
    ratio: "3:4",
    placement: "beside"
  })), !side && imagePlacement !== "none" && (image || cover || poster) && /*#__PURE__*/React.createElement(Ds.ImageSurface, {
    src: image,
    mode: image ? imageMode : "none",
    state: section,
    ratio: ratio,
    placement: section === "doc" ? "crop" : "contained"
  }));
}

Object.assign(Ds, { HeaderBlock });
})(window.Ds = window.Ds || {}, window.React);
