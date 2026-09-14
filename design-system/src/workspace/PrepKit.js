/* components/workspace/PrepKit.jsx — مستخرَج من حزمة Ds_f056d3 (format 4)
   يصدّر: PrepStart, PrepSuggest, PrepStage, PrepField, PrepList, PrepBoard, PrepRail, PrepToolbar, PrepTeam, PrepWideToggle, TogglePick, PrepKit
   دوال داخلية غير مصدَّرة في الحزمة الأصلية: exportTransfer, getPick, importTransfer, pushTo, setPick, togglePick, useMobile
 */
(function (Ds, React) {
"use strict";
const _extends = Object.assign;

/* ورشة الإعداد — مكوّنات الأداة.
   اختيارات البداية (مع إمكانية إضافة قسم/برنامج) تُغيّر المسار،
   والاقتراحات تُدرَج بضغطة وتتبدّل من بنك كبير،
   والتصدير يجمع ما كتبه المعِد في صفحة واحدة. */

const PAPER = "#F7F7F7",
  INK = "#000000",
  SIGNAL = "#FFB22C",
  CLAY = "#854836";
const HAIR = "rgba(0,0,0,.12)",
  MUTED = "rgba(0,0,0,.6)";
const pickKey = () => "mudhya.prep:pick:" + location.pathname + location.search;
const optKey = g => "mudhya.prep:opts:" + location.pathname + location.search + ":" + g;
function loadPick() {
  try {
    const v = localStorage.getItem(pickKey());
    return v ? JSON.parse(v) : {};
  } catch (e) {
    return {};
  }
}
function reg() {
  if (!window.__mudhyaPrep) window.__mudhyaPrep = {
    fields: new Map(),
    pick: loadPick()
  };
  return window.__mudhyaPrep;
}
function getPick() {
  return reg().pick || {};
}
function commit(next) {
  const r = reg();
  r.pick = next;
  try {
    localStorage.setItem(pickKey(), JSON.stringify(next));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent("prep:change"));
}
function setPick(group, value) {
  const cur = getPick();
  commit(Object.assign({}, cur, {
    [group]: cur[group] === value ? undefined : value
  }));
}
function togglePick(group, value) {
  const cur = getPick();
  const arr = Array.isArray(cur[group]) ? cur[group].slice() : [];
  const i = arr.indexOf(value);
  if (i > -1) arr.splice(i, 1);else arr.push(value);
  commit(Object.assign({}, cur, {
    [group]: arr
  }));
}
function loadOpts(g) {
  try {
    const v = localStorage.getItem(optKey(g));
    return v ? JSON.parse(v) : [];
  } catch (e) {
    return [];
  }
}
function saveOpts(g, arr) {
  try {
    localStorage.setItem(optKey(g), JSON.stringify(arr));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent("prep:change"));
}
const keyOf = slot => "mudhya.prep:" + location.pathname + location.search + ":" + slot;
function load(slot, fb) {
  try {
    const v = localStorage.getItem(keyOf(slot));
    return v == null ? fb : JSON.parse(v);
  } catch (e) {
    return fb;
  }
}
function store(slot, val) {
  try {
    localStorage.setItem(keyOf(slot), JSON.stringify(val));
  } catch (e) {}
  window.dispatchEvent(new CustomEvent("prep:change"));
}
function pushTo(slot, text) {
  const f = reg().fields.get(slot);
  if (f && f.append) {
    f.append(text);
    return true;
  }
  if (navigator.clipboard) navigator.clipboard.writeText(text);
  return false;
}
function useReg(slot, label, api) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!slot) return;
    reg().fields.set(slot, Object.assign({
      label
    }, api));
    // أول تسجيل فقط يُعلِم المستمعين — تحديّثات المحتوى تُطلق من store() وحدها
    if (ref.current !== slot) {
      ref.current = slot;
      window.dispatchEvent(new CustomEvent("prep:change"));
    }
  });
  React.useEffect(() => () => {
    if (slot) reg().fields.delete(slot);
  }, [slot]);
}
function useBeat() {
  const [, set] = React.useState(0);
  React.useEffect(() => {
    const h = () => set(n => n + 1);
    window.addEventListener("prep:change", h);
    return () => window.removeEventListener("prep:change", h);
  }, []);
}
function useMobile(bp) {
  const q = "(max-width:" + (bp || 820) + "px)";
  const [m, setM] = React.useState(() => typeof matchMedia === "function" ? matchMedia(q).matches : false);
  React.useEffect(() => {
    const mq = matchMedia(q);
    const h = e => setM(e.matches);
    mq.addEventListener ? mq.addEventListener("change", h) : mq.addListener(h);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", h) : mq.removeListener(h);
    };
  }, [q]);
  return m;
}
let sheeted = false;
function sheet() {
  if (sheeted || typeof document === "undefined") return;
  sheeted = true;
  const s = document.createElement("style");
  s.textContent = `
.pk-ed{outline:none}.pk-ed:empty::before{content:attr(data-ph);color:rgba(0,0,0,.35)}.pk-ed:focus{box-shadow:inset 0 0 0 2px ${SIGNAL}}
.pk-btn{cursor:pointer;font-family:inherit}.pk-btn:hover{background:${INK};color:${PAPER}}
.pk-x{opacity:.4;cursor:pointer}.pk-x:hover{opacity:1}.pk-ref:hover{border-color:${INK}}
.pk-chip{cursor:pointer;font-family:inherit;text-align:right;border:1px solid ${HAIR};background:#fff;border-radius:3px;padding:9px 14px;font-size:14px;font-weight:700;line-height:1.4;color:${INK}}
.pk-chip:hover{border-color:${INK}}.pk-chip[data-on="1"]{background:${INK};color:${PAPER};border-color:${INK}}.pk-chip[data-used="1"]{opacity:.45}
#pk-print{position:fixed;left:-99999px;top:0;visibility:hidden;background:#fff;color:#000;direction:rtl;text-align:right}
@media (max-width:820px){
 body{-webkit-text-size-adjust:100%}
 .pk-ed{font-size:16px!important;min-height:44px;padding:9px 10px!important}
 .pk-btn,.pk-chip{min-height:40px;font-size:12.5px!important;padding:8px 12px!important}
 .pk-x{min-width:36px;min-height:36px}
 .pk-rail{position:static!important;padding:10px 12px!important;gap:8px!important}
 .pk-rail ol{display:flex!important;overflow-x:auto;gap:6px;padding-bottom:4px;-webkit-overflow-scrolling:touch}
 .pk-rail ol li{flex:none}.pk-rail ol li button{width:auto!important;white-space:nowrap;border:1px solid ${HAIR}!important;border-radius:3px;padding:6px 10px!important;font-size:12.5px!important}
 .pk-board{grid-template-columns:1fr 1fr!important;gap:8px!important}
 .pk-toolbar{position:sticky;bottom:0;z-index:5;background:${PAPER};padding:8px 0;border-top:1px solid ${HAIR};gap:6px!important}
 .pk-toolbar button{flex:1 1 auto;font-size:12px!important;padding:9px 8px!important;white-space:nowrap}
 html.pk-wide .prep-wrap{padding-inline:6px!important}
 html.pk-wide .pk-rail{padding:10px!important}
 html.pk-wide section[data-stage-title]{padding-block:14px!important}
}
.pk-team-row{display:grid;grid-template-columns:1fr 1.4fr auto auto;gap:8px;align-items:center}
@media (max-width:560px){.pk-team-row{grid-template-columns:1fr}}
.pk-name-inp{font-family:inherit;font-size:14px;font-weight:700;padding:9px 10px;border:1px solid ${HAIR};border-radius:4px;background:#fff;min-width:0}
.pk-name-inp:focus{outline:none;box-shadow:inset 0 0 0 2px ${SIGNAL}}
@media (max-width:480px){
 .pk-board{grid-template-columns:1fr!important}
 .pk-chip{font-size:12px!important;padding:7px 10px!important}
}
@media print{
 body>*:not(#pk-print){display:none!important}
 #pk-print{position:static!important;visibility:visible!important;left:auto!important}
 html,body{background:#fff!important}
 @page{size:A4 portrait;margin:8mm}
}
`;
  document.head.appendChild(s);
}
const bar = (w, c, t) => ({
  height: t || 5,
  width: w,
  transform: "skewX(-8deg)",
  borderRadius: 2,
  background: c,
  flex: "none"
});
const label15 = {
  fontSize: 15,
  fontWeight: 700
};
const esc = t => String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function Editable({
  value,
  onChange,
  placeholder,
  minHeight = 76,
  size = 17,
  weight = 500,
  style
}) {
  const r = React.useRef(null);
  React.useEffect(() => {
    if (r.current && r.current.innerText !== value) r.current.innerText = value || "";
  }, [value]);
  return /*#__PURE__*/React.createElement("div", {
    ref: r,
    className: "pk-ed",
    contentEditable: true,
    suppressContentEditableWarning: true,
    "data-ph": placeholder,
    dir: "rtl",
    onInput: e => onChange(e.currentTarget.innerText),
    style: {
      minHeight,
      fontSize: size,
      fontWeight: weight,
      lineHeight: 1.6,
      padding: "12px 14px",
      background: "#fff",
      border: "1px solid " + HAIR,
      borderRadius: 4,
      whiteSpace: "pre-wrap",
      ...style
    }
  });
}

/** بداية سريعة — اختيارات تحدّد المسار. القسم والبرنامج قابلان للإضافة، والمراحل قابلة للإطفاء. */
function PrepStart({
  title = "بداية سريعة",
  note,
  groups = []
}) {
  sheet();
  useBeat();
  const p = getPick();
  const add = g => {
    const v = (prompt(g.addPrompt || "أضف خيارًا جديدًا:") || "").trim();
    if (!v) return;
    const cur = loadOpts(g.id);
    if (cur.indexOf(v) < 0) saveOpts(g.id, cur.concat([v]));
    setPick(g.id, v);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 16,
      padding: 18,
      border: "1px solid " + INK,
      borderRadius: 4,
      background: "#fff",
      marginBottom: 26
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 900
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: bar("32%", SIGNAL, 6)
  })), note ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13.5,
      fontWeight: 500,
      lineHeight: 1.6,
      color: MUTED
    }
  }, note) : null, groups.map(g => {
    const custom = g.canAdd ? loadOpts(g.id) : [];
    const opts = (g.options || []).concat(custom.filter(c => (g.options || []).indexOf(c) < 0));
    const multi = g.kind === "multi";
    const on = o => multi ? Array.isArray(p[g.id]) ? p[g.id].indexOf(o) > -1 : !!g.defaultOn : p[g.id] === o;
    return /*#__PURE__*/React.createElement("div", {
      key: g.id,
      style: {
        display: "grid",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: MUTED
      }
    }, g.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8
      }
    }, opts.map(o => /*#__PURE__*/React.createElement("span", {
      key: o,
      style: {
        display: "inline-flex",
        alignItems: "stretch"
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "pk-chip",
      "data-on": on(o) ? "1" : "0",
      onClick: () => multi ? togglePick(g.id, o) : setPick(g.id, o)
    }, o), custom.indexOf(o) > -1 ? /*#__PURE__*/React.createElement("button", {
      className: "pk-x",
      title: "\u062D\u0630\u0641 \u0627\u0644\u062E\u064A\u0627\u0631",
      onClick: () => {
        saveOpts(g.id, custom.filter(c => c !== o));
        if (p[g.id] === o) setPick(g.id, o);
      },
      style: {
        border: "none",
        background: "transparent",
        fontSize: 16,
        fontWeight: 700,
        paddingInline: 6
      }
    }, "\xD7") : null)), g.canAdd ? /*#__PURE__*/React.createElement("button", {
      className: "pk-chip",
      style: {
        borderStyle: "dashed",
        fontWeight: 900
      },
      onClick: () => add(g)
    }, "+ \u0625\u0636\u0627\u0641\u0629") : null));
  }));
}

/** اقتراحات — نافذة من بنك كبير، وزر يبدّلها بمجموعة أخرى. */
function PrepSuggest({
  target,
  items = [],
  label = "اقتراحات — اضغط للإدراج",
  window: win = 4
}) {
  sheet();
  const [off, setOff] = React.useState(0);
  const [used, setUsed] = React.useState([]);
  if (!items.length) return null;
  const n = Math.min(win, items.length);
  const view = Array.from({
    length: n
  }, (_, k) => items[(off + k) % items.length]);
  const more = items.length > n;
  return /*#__PURE__*/React.createElement("div", {
    className: "pk-noprint",
    style: {
      display: "grid",
      gap: 8,
      padding: "12px 14px",
      borderRadius: 4,
      background: "rgba(255,178,44,.14)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: MUTED
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 500,
      color: MUTED,
      marginInlineStart: "auto",
      fontFeatureSettings: "'tnum'"
    }
  }, items.length, " \u0627\u0642\u062A\u0631\u0627\u062D\u064B\u0627 \u0641\u064A \u0627\u0644\u0628\u0646\u0643")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, view.map((t, i) => /*#__PURE__*/React.createElement("button", {
    key: t + i,
    className: "pk-chip",
    "data-used": used.indexOf(t) > -1 ? "1" : "0",
    onClick: () => {
      pushTo(target, t);
      setUsed(used.concat([t]));
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, more ? /*#__PURE__*/React.createElement("button", {
    className: "pk-chip",
    onClick: () => setOff((off + n) % items.length)
  }, "\u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A \u0623\u062E\u0631\u0649 \u21BB") : null, /*#__PURE__*/React.createElement("button", {
    className: "pk-chip",
    style: {
      background: SIGNAL,
      borderColor: INK
    },
    onClick: () => {
      view.forEach(t => pushTo(target, t));
      setUsed(used.concat(view));
    }
  }, "\u0625\u062F\u0631\u0627\u062C \u0627\u0644\u0645\u0639\u0631\u0648\u0636")));
}

/** مرحلة من مراحل الإعداد. */
function PrepStage({
  n = "٠١",
  title = "المرحلة",
  purpose,
  color = "signal",
  id,
  children
}) {
  sheet();
  const c = color === "clay" ? CLAY : color === "ink" ? INK : SIGNAL;
  const hide = () => {
    togglePick("off", title);
  };
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    "data-stage-title": title,
    style: {
      display: "grid",
      gap: 18,
      paddingBlock: 30,
      borderTop: "1px solid " + HAIR
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "grid",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: MUTED,
      fontFeatureSettings: "'tnum'"
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "clamp(22px,5vw,30px)",
      fontWeight: 900,
      lineHeight: 1.28,
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: bar("52%", c, 5)
  })), /*#__PURE__*/React.createElement("button", {
    className: "pk-btn pk-noprint",
    onClick: hide,
    title: "\u0625\u062E\u0641\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u062D\u0644\u0629",
    style: {
      flex: "none",
      alignSelf: "center",
      padding: "6px 12px",
      borderRadius: 3,
      border: "1px solid " + HAIR,
      background: "transparent",
      fontSize: 12,
      fontWeight: 700,
      color: MUTED
    }
  }, "\u0625\u062E\u0641\u0627\u0621")), purpose ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 14.5,
      fontWeight: 500,
      lineHeight: 1.6,
      color: MUTED,
      maxWidth: "62ch",
      textWrap: "pretty"
    }
  }, purpose) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 16
    }
  }, children));
}

/** حقل نصّي واحد. */
function PrepField({
  slot = "field",
  label = "حقل",
  hint,
  placeholder = "اكتب هنا…",
  rows = 3,
  big = false
}) {
  sheet();
  const [v, setV] = React.useState(() => load(slot, ""));
  const set = t => {
    setV(t);
    store(slot, t);
  };
  useReg(slot, label, {
    get: () => v,
    filled: () => (v || "").trim().length > 2,
    append: t => set(((v || "").trim() ? v + "\n" : "") + t)
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label15
  }, label), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: MUTED
    }
  }, hint) : null), /*#__PURE__*/React.createElement(Editable, {
    value: v,
    onChange: set,
    placeholder: placeholder,
    minHeight: rows * 26 + 24,
    size: big ? 20 : 17,
    weight: big ? 700 : 500
  }));
}

/** قائمة قابلة للتحرير — أسئلة، مشاهد، معدات، أو قائمة تحقّق. */
function PrepList({
  slot = "list",
  label = "قائمة",
  hint,
  kind = "numbered",
  placeholder = "بند جديد…",
  seed = [],
  addLabel = "إضافة بند",
  maxVisible = 6
}) {
  sheet();
  const norm = a => (a || []).map(x => typeof x === "string" ? {
    t: x,
    done: false
  } : x);
  const [items, setItems] = React.useState(() => norm(load(slot, seed)));
  const [expanded, setExpanded] = React.useState(false);
  const set = a => {
    setItems(a);
    store(slot, a);
  };
  const done = items.filter(i => i.done).length;
  useReg(slot, label, {
    get: () => items.filter(i => (i.t || "").trim()).map(i => (kind === "check" ? i.done ? "[×] " : "[ ] " : "") + i.t).join("\n"),
    filled: () => items.some(i => (i.t || "").trim().length > 2),
    append: t => set(items.filter(i => (i.t || "").trim()).concat([{
      t,
      done: false
    }]))
  });
  const overflow = items.length > maxVisible;
  const view = overflow && !expanded ? items.slice(0, maxVisible) : items;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label15
  }, label), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: MUTED
    }
  }, hint) : null, kind === "check" ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: done === items.length && items.length ? CLAY : MUTED,
      marginInlineStart: "auto",
      fontFeatureSettings: "'tnum'"
    }
  }, done, " / ", items.length) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8
    }
  }, view.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10
    }
  }, kind === "check" ? /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: () => {
      const a = items.slice();
      a[i] = {
        ...a[i],
        done: !a[i].done
      };
      set(a);
    },
    "aria-label": "\u062A\u062D\u0642\u0651\u0642",
    style: {
      flex: "none",
      width: 28,
      height: 28,
      marginTop: 8,
      borderRadius: 4,
      border: "1px solid " + (it.done ? INK : HAIR),
      background: it.done ? SIGNAL : "#fff",
      fontSize: 15,
      fontWeight: 900,
      lineHeight: 1,
      color: INK
    }
  }, it.done ? "×" : "") : /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      width: 24,
      marginTop: 12,
      fontSize: 14,
      fontWeight: 700,
      color: MUTED,
      textAlign: "center",
      fontFeatureSettings: "'tnum'"
    }
  }, kind === "numbered" ? i + 1 : "—"), /*#__PURE__*/React.createElement(Editable, {
    value: it.t,
    onChange: t => {
      const a = items.slice();
      a[i] = {
        ...a[i],
        t
      };
      set(a);
    },
    placeholder: placeholder,
    minHeight: 26,
    style: {
      flex: 1,
      minWidth: 0,
      textDecoration: it.done ? "line-through" : "none",
      opacity: it.done ? 0.55 : 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "pk-x pk-noprint",
    onClick: () => set(items.filter((_, j) => j !== i)),
    "aria-label": "\u062D\u0630\u0641",
    style: {
      flex: "none",
      width: 28,
      height: 28,
      marginTop: 8,
      border: "none",
      background: "transparent",
      fontSize: 18,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "\xD7")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "pk-btn pk-noprint",
    onClick: () => set(items.concat([{
      t: "",
      done: false
    }])),
    style: {
      padding: "10px 16px",
      borderRadius: 4,
      border: "1px solid " + INK,
      background: "transparent",
      fontSize: 14,
      fontWeight: 700
    }
  }, addLabel, " +"), overflow ? /*#__PURE__*/React.createElement("button", {
    className: "pk-btn pk-noprint",
    onClick: () => setExpanded(!expanded),
    style: {
      padding: "10px 16px",
      borderRadius: 4,
      border: "1px solid " + HAIR,
      background: "transparent",
      fontSize: 13,
      fontWeight: 700,
      color: MUTED
    }
  }, expanded ? "عرض أقل" : "عرض المزيد (+" + (items.length - maxVisible) + ")") : null));
}
function shrink(file, cb) {
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 720;
      const sc = Math.min(1, max / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * sc);
      c.height = Math.round(img.height * sc);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL("image/jpeg", 0.72));
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

/** لوح المشاهد — إطارات ١٦:٩ مع نوع اللقطة وصورة مرجعية لكل إطار. */
function PrepBoard({
  slot = "board",
  label = "لوح المشاهد",
  hint,
  count = 4,
  shots = ["واسعة", "متوسطة", "قريبة", "تفصيلية"]
}) {
  sheet();
  const seed = Array.from({
    length: count
  }, (_, i) => ({
    shot: shots[i % shots.length],
    t: "",
    img: ""
  }));
  const [fr, setFr] = React.useState(() => load(slot, seed));
  const set = a => {
    setFr(a);
    store(slot, a);
  };
  useReg(slot, label, {
    get: () => fr.map((f, i) => i + 1 + ". [" + f.shot + "] " + (f.t || "") + (f.img ? " (صورة مرفقة)" : "")).join("\n"),
    filled: () => fr.some(f => (f.t || "").trim().length > 2 || f.img),
    append: t => set(fr.concat([{
      shot: shots[0],
      t,
      img: ""
    }])),
    print: () => '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">' + fr.map((f, i) => '<div style="border:1px solid #ddd;border-radius:2px;padding:3px;break-inside:avoid">' + (f.img ? '<img src="' + f.img + '" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:2px">' : '<div style="width:100%;aspect-ratio:16/9;background:#eee;border-radius:2px"></div>') + '<div style="font-size:7.5px;font-weight:700;margin-top:2px">' + (i + 1) + " · " + esc(f.shot) + "</div>" + '<div style="font-size:7.5px;line-height:1.35">' + esc(f.t) + "</div></div>").join("") + "</div>"
  });
  const upd = (i, patch) => {
    const a = fr.slice();
    a[i] = {
      ...a[i],
      ...patch
    };
    set(a);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label15
  }, label), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: MUTED
    }
  }, hint) : null), /*#__PURE__*/React.createElement("div", {
    className: "pk-board",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
      gap: 12
    }
  }, fr.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gap: 8,
      padding: 10,
      border: "1px solid " + HAIR,
      borderRadius: 4,
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "16/9",
      borderRadius: 4,
      background: f.img ? "transparent" : INK,
      display: "grid",
      placeItems: "center",
      overflow: "hidden"
    }
  }, f.img ? /*#__PURE__*/React.createElement("img", {
    src: f.img,
    alt: "",
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: "rgba(247,247,247,.45)",
      fontFeatureSettings: "'tnum'"
    }
  }, i + 1), /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: () => upd(i, {
      shot: shots[(shots.indexOf(f.shot) + 1) % shots.length]
    }),
    style: {
      position: "absolute",
      inset: "auto 8px 8px auto",
      padding: "6px 12px",
      borderRadius: 3,
      border: "none",
      background: SIGNAL,
      color: INK,
      fontSize: 12.5,
      fontWeight: 700
    }
  }, f.shot)), /*#__PURE__*/React.createElement(Editable, {
    value: f.t,
    onChange: t => upd(i, {
      t
    }),
    placeholder: "\u0645\u0627 \u0646\u0631\u0627\u0647 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0625\u0637\u0627\u0631\u2026",
    minHeight: 48,
    size: 14,
    style: {
      border: "none",
      padding: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "pk-noprint",
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "pk-chip",
    style: {
      padding: "7px 11px",
      fontSize: 12.5
    }
  }, f.img ? "تغيير الصورة" : "إضافة صورة", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    style: {
      display: "none"
    },
    onChange: ev => {
      const file = ev.target.files && ev.target.files[0];
      if (file) shrink(file, d => upd(i, {
        img: d
      }));
      ev.target.value = "";
    }
  })), f.img ? /*#__PURE__*/React.createElement("button", {
    className: "pk-x",
    onClick: () => upd(i, {
      img: ""
    }),
    style: {
      border: "none",
      background: "transparent",
      fontSize: 12.5,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0635\u0648\u0631\u0629") : null, /*#__PURE__*/React.createElement("button", {
    className: "pk-x",
    onClick: () => set(fr.filter((_, j) => j !== i)),
    style: {
      border: "none",
      background: "transparent",
      fontSize: 12.5,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "\u062D\u0630\u0641 \u0627\u0644\u0625\u0637\u0627\u0631"))))), /*#__PURE__*/React.createElement("button", {
    className: "pk-btn pk-noprint",
    onClick: () => set(fr.concat([{
      shot: shots[0],
      t: "",
      img: ""
    }])),
    style: {
      justifySelf: "start",
      padding: "10px 16px",
      borderRadius: 4,
      border: "1px solid " + INK,
      background: "transparent",
      fontSize: 14,
      fontWeight: 700
    }
  }, "\u0625\u0637\u0627\u0631 \u062C\u062F\u064A\u062F +"));
}

/** سكّة المراحل — تقدّم وتنقّل. تتحوّل على الهاتف إلى شريط أفقي. */
function PrepRail({
  title = "مراحل الإعداد",
  stages = [],
  color = "signal"
}) {
  sheet();
  useBeat();
  const c = color === "clay" ? CLAY : color === "ink" ? INK : SIGNAL;
  const f = reg().fields;
  let filled = 0;
  f.forEach(x => {
    if (x.filled && x.filled()) filled++;
  });
  const total = f.size || 1;
  const pct = Math.round(filled / total * 100);
  const go = id => {
    const n = document.getElementById(id);
    if (n) window.scrollTo({
      top: n.getBoundingClientRect().top + window.scrollY - 16,
      behavior: "smooth"
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "pk-rail pk-noprint",
    style: {
      position: "sticky",
      top: 20,
      display: "grid",
      gap: 12,
      padding: 18,
      border: "1px solid " + HAIR,
      borderRadius: 4,
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 900
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: bar("40%", c, 4)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13,
      fontWeight: 700,
      fontFeatureSettings: "'tnum'"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u0627\u0644\u0627\u0643\u062A\u0645\u0627\u0644"), /*#__PURE__*/React.createElement("span", null, pct, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      borderRadius: 3,
      background: "rgba(0,0,0,.08)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: pct + "%",
      background: c,
      transition: "width .3s"
    }
  }))), /*#__PURE__*/React.createElement("ol", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: 2
    }
  }, stages.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: () => go(s.id || "s" + (i + 1)),
    style: {
      width: "100%",
      textAlign: "right",
      padding: "9px 10px",
      border: "none",
      background: "transparent",
      borderRadius: 3,
      fontSize: 14,
      fontWeight: 500,
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: MUTED,
      fontWeight: 700,
      fontFeatureSettings: "'tnum'"
    }
  }, i + 1), /*#__PURE__*/React.createElement("span", null, s.title || s))))));
}

/* ورقة الطبع: تُبنى من المحتوى المكتوب فقط، بعمودين، وتُصغَّر لتسع في صفحة A4 واحدة. */
function buildSheet(docTitle) {
  const old = document.getElementById("pk-print");
  if (old) old.remove();
  const p = getPick();
  const head = ["kind", "section", "program", "goal", "depth"].map(k => p[k]).filter(v => typeof v === "string").join(" · ");
  const blocks = [];
  reg().fields.forEach(x => {
    const body = x.print ? x.print() : "";
    const txt = x.get ? x.get() : "";
    if (x.print) {
      if (x.filled && x.filled()) blocks.push({
        label: x.label,
        html: body
      });
      return;
    }
    if ((txt || "").trim()) blocks.push({
      label: x.label,
      html: '<div style="font-size:8.6px;line-height:1.42;white-space:pre-wrap">' + esc(txt) + "</div>"
    });
  });
  const wrap = document.createElement("div");
  wrap.id = "pk-print";
  const inner = document.createElement("div");
  inner.style.width = "718px";
  inner.innerHTML = '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px;border-bottom:2px solid #000;padding-bottom:5px;margin-bottom:7px">' + '<div><div style="font-size:15px;font-weight:900;line-height:1.15">' + esc(docTitle) + "</div>" + '<div style="font-size:8.4px;font-weight:500;color:#555;margin-top:2px">' + esc(head) + "</div></div>" + '<div style="font-size:8.4px;font-weight:700;color:#555">مذياع — ورشة الإعداد</div></div>' + '<div style="column-count:2;column-gap:14px">' + blocks.map(b => '<div style="break-inside:avoid;margin-bottom:6px;border-right:2px solid #FFB22C;padding-right:6px">' + '<div style="font-size:8.8px;font-weight:900;margin-bottom:2px">' + esc(b.label) + "</div>" + b.html + "</div>").join("") + "</div>";
  wrap.appendChild(inner);
  document.body.appendChild(wrap);
  const H = 1035;
  const h = inner.scrollHeight;
  if (h > H) {
    const s = Math.max(0.35, H / h);
    inner.style.transform = "scale(" + s + ")";
    inner.style.transformOrigin = "top right";
  }
  wrap.style.width = "718px";
  wrap.style.height = H + "px";
  wrap.style.overflow = "hidden";
  return blocks.length;
}

/** شريط الأدوات — PDF بصفحة واحدة، Markdown، نسخ، تفريغ. */
function PrepToolbar({
  docTitle = "ورقة إعداد"
}) {
  sheet();
  useBeat();
  const dump = () => {
    let out = docTitle + "\n\n";
    const p = getPick();
    const head = ["kind", "section", "program", "goal", "depth"].map(k => p[k]).filter(v => typeof v === "string").join(" · ");
    if (head) out += head + "\n\n";
    reg().fields.forEach(x => {
      const v = x.get ? x.get() : "";
      if ((v || "").trim()) out += "## " + x.label + "\n" + v + "\n\n";
    });
    return out;
  };
  const printPdf = () => {
    const n = buildSheet(docTitle);
    if (!n) {
      alert("لا يوجد محتوى مكتوب بعد.");
      return;
    }
    const prev = document.title;
    document.title = docTitle;
    const done = () => {
      document.title = prev;
      const el = document.getElementById("pk-print");
      if (el) el.remove();
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    setTimeout(() => window.print(), 120);
  };
  const download = () => {
    const b = new Blob([dump()], {
      type: "text/markdown;charset=utf-8"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = docTitle + ".md";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const clear = () => {
    if (!confirm("تفريغ كل الحقول في هذه الورقة؟")) return;
    const pre = "mudhya.prep:" + location.pathname + location.search + ":";
    Object.keys(localStorage).filter(k => k.indexOf(pre) === 0).forEach(k => localStorage.removeItem(k));
    location.reload();
  };
  const b = {
    padding: "12px 18px",
    borderRadius: 4,
    border: "1px solid " + INK,
    background: "transparent",
    fontSize: 14,
    fontWeight: 700
  };
  const [share, setShare] = React.useState(null);
  const doCopy = () => {
    const text = exportTransfer(docTitle);
    setShare({
      mode: "out",
      text
    });
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
  };
  const doPaste = () => setShare({
    mode: "in",
    text: ""
  });
  const applyPaste = () => {
    const r = importTransfer(share.text);
    if (!r.ok) {
      alert(r.error);
      return;
    }
    alert("تمّ استيراد " + r.count + " حقلًا. ستُعاد تحميل الورقة.");
    location.reload();
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "pk-toolbar pk-noprint",
    style: {
      display: "grid",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: printPdf,
    style: {
      ...b,
      background: SIGNAL
    }
  }, "\u062A\u0635\u062F\u064A\u0631 PDF \u2014 \u0635\u0641\u062D\u0629 \u0648\u0627\u062D\u062F\u0629"), /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: download,
    style: b
  }, "Markdown"), /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: () => navigator.clipboard && navigator.clipboard.writeText(dump()),
    style: b
  }, "\u0646\u0633\u062E \u0627\u0644\u0646\u0635"), /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: doCopy,
    style: b
  }, "\u0646\u0633\u062E \u0644\u0644\u0646\u0642\u0644"), /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: doPaste,
    style: b
  }, "\u0644\u0635\u0642 \u0645\u0646 \u0632\u0645\u064A\u0644"), /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: clear,
    style: {
      ...b,
      borderColor: HAIR,
      color: MUTED
    }
  }, "\u062A\u0641\u0631\u064A\u063A")), share ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8,
      padding: 14,
      border: "1px solid " + HAIR,
      borderRadius: 4,
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 900
    }
  }, share.mode === "out" ? "نسخ للنقل" : "لصق ورقة زميل"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12.5,
      fontWeight: 500,
      lineHeight: 1.6,
      color: MUTED
    }
  }, share.mode === "out" ? "نُسخ النص تلقائيًا. إن لم يعمل النسخ، حدد النص يدويًا وانسخه، وأرسله لزميلك." : "الصق النص الذي أرسله زميلك — ستُستبدل محتويات هذه الورقة بمحتوياته."), /*#__PURE__*/React.createElement("textarea", {
    value: share.text,
    readOnly: share.mode === "out",
    dir: "ltr",
    onChange: ev => setShare({
      ...share,
      text: ev.target.value
    }),
    onFocus: ev => {
      if (share.mode === "out") ev.target.select();
    },
    style: {
      fontFamily: "monospace",
      fontSize: 11.5,
      minHeight: 110,
      padding: 10,
      border: "1px solid " + HAIR,
      borderRadius: 4,
      resize: "vertical",
      textAlign: "left"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, share.mode === "in" ? /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: applyPaste,
    style: {
      ...b,
      padding: "10px 16px",
      background: SIGNAL
    }
  }, "\u0627\u0633\u062A\u064A\u0631\u0627\u062F") : null, /*#__PURE__*/React.createElement("button", {
    className: "pk-btn",
    onClick: () => setShare(null),
    style: {
      ...b,
      padding: "10px 16px",
      borderColor: HAIR,
      color: MUTED
    }
  }, "\u0625\u063A\u0644\u0627\u0642"))) : null);
}

/** فريق العمل — أربعة أشخاص افتراضيًا، مشاركة/عدم مشاركة، ومهمة لكل شخص. */
function PrepTeam({
  slot = "team",
  label = "فريق العمل",
  hint = "من سيشارك، وما مهمته"
}) {
  sheet();
  const seed = ["شخص ١", "شخص ٢", "شخص ٣", "شخص ٤"].map(n => ({
    name: "",
    task: "",
    active: true,
    ph: n
  }));
  const [people, setPeople] = React.useState(() => load(slot, seed));
  const set = a => {
    setPeople(a);
    store(slot, a);
  };
  useReg(slot, label, {
    get: () => people.filter(p => (p.name || "").trim()).map(p => (p.active ? "• " : "• (غير مشارك) ") + p.name + (p.task ? " — " + p.task : "")).join("\n"),
    filled: () => people.some(p => (p.name || "").trim()),
    print: () => '<div style="display:grid;gap:2px">' + people.filter(p => (p.name || "").trim()).map(p => '<div style="font-size:8.6px;line-height:1.5"><b>' + esc(p.name) + '</b>' + (p.active ? "" : " — غير مشارك") + (p.task ? " — " + esc(p.task) : "") + "</div>").join("") + "</div>"
  });
  const upd = (i, patch) => {
    const a = people.slice();
    a[i] = {
      ...a[i],
      ...patch
    };
    set(a);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: label15
  }, label), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: MUTED
    }
  }, hint) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 8
    }
  }, people.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "pk-team-row"
  }, /*#__PURE__*/React.createElement("input", {
    className: "pk-name-inp",
    value: p.name,
    placeholder: p.ph || "اسم…",
    onChange: e => upd(i, {
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement(Editable, {
    value: p.task,
    onChange: t => upd(i, {
      task: t
    }),
    placeholder: "\u0627\u0644\u0645\u0647\u0645\u0629 \u2014 \u062A\u0635\u0648\u064A\u0631\u060C \u0635\u0648\u062A\u060C \u062A\u0646\u0633\u064A\u0642\u2026",
    minHeight: 20,
    size: 14,
    style: {
      padding: "9px 10px"
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "pk-chip",
    "data-on": p.active ? "1" : "0",
    onClick: () => upd(i, {
      active: !p.active
    }),
    style: {
      padding: "9px 12px",
      fontSize: 12.5
    }
  }, p.active ? "مشارك" : "غير مشارك"), /*#__PURE__*/React.createElement("button", {
    className: "pk-x pk-noprint",
    onClick: () => set(people.filter((_, j) => j !== i)),
    "aria-label": "\u062D\u0630\u0641",
    style: {
      border: "none",
      background: "transparent",
      fontSize: 18,
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "\xD7")))), /*#__PURE__*/React.createElement("button", {
    className: "pk-btn pk-noprint",
    onClick: () => set(people.concat([{
      name: "",
      task: "",
      active: true,
      ph: "شخص جديد"
    }])),
    style: {
      justifySelf: "start",
      padding: "10px 16px",
      borderRadius: 4,
      border: "1px solid " + INK,
      background: "transparent",
      fontSize: 14,
      fontWeight: 700
    }
  }, "\u0625\u0636\u0627\u0641\u0629 \u0634\u062E\u0635 +"));
}

/** زر توسيع العرض — يُظهر فقط على الهاتف، يوسّع المساحة ويقلّل الحواف. */
function PrepWideToggle() {
  sheet();
  const mobile = useMobile(820);
  const [wide, setWide] = React.useState(() => {
    try {
      return localStorage.getItem("mudhya.prep.wide") === "1";
    } catch (e) {
      return false;
    }
  });
  React.useEffect(() => {
    document.documentElement.classList.toggle("pk-wide", wide);
    try {
      localStorage.setItem("mudhya.prep.wide", wide ? "1" : "0");
    } catch (e) {}
  }, [wide]);
  if (!mobile) return null;
  return /*#__PURE__*/React.createElement("button", {
    className: "pk-btn pk-noprint",
    onClick: () => setWide(!wide),
    style: {
      padding: "9px 14px",
      borderRadius: 4,
      border: "1px solid " + INK,
      background: wide ? INK : "transparent",
      color: wide ? PAPER : INK,
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 14
    }
  }, wide ? "✓ عرض موسّع مفعّل" : "↔ توسيع العرض للهاتف");
}

/** نقل ورقة كاملة إلى ورقة جديدة (نسخ/لصق) — يُستخدم من الصفحة الرئيسية. */
function exportTransfer(title) {
  const pre = "mudhya.prep:" + location.pathname + location.search + ":";
  const slots = {};
  Object.keys(localStorage).forEach(k => {
    if (k.indexOf(pre) === 0) {
      try {
        slots[k.slice(pre.length)] = JSON.parse(localStorage.getItem(k));
      } catch (e) {}
    }
  });
  return JSON.stringify({
    v: 1,
    title: title || "ورقة إعداد",
    pick: getPick(),
    slots
  });
}

/** لصق ورقة زميل فوق الورقة الحالية. */
function importTransfer(text) {
  let d;
  try {
    d = JSON.parse(String(text || "").trim());
  } catch (e) {
    return {
      ok: false,
      error: "النص غير صالح — تأكّد أنك لصقته كاملًا من زر «نسخ للنقل»."
    };
  }
  if (!d || typeof d !== "object" || !d.slots || typeof d.slots !== "object") return {
    ok: false,
    error: "النص لا يحتوي بيانات ورقة إعداد."
  };
  const pre = "mudhya.prep:" + location.pathname + location.search + ":";
  Object.keys(localStorage).filter(k => k.indexOf(pre) === 0).forEach(k => localStorage.removeItem(k));
  let count = 0;
  Object.keys(d.slots).forEach(k => {
    try {
      localStorage.setItem(pre + k, JSON.stringify(d.slots[k]));
      count++;
    } catch (e) {}
  });
  if (d.pick && typeof d.pick === "object") {
    try {
      localStorage.setItem(pickKey(), JSON.stringify(d.pick));
    } catch (e) {}
  }
  return {
    ok: true,
    count,
    title: d.title || ""
  };
}

/** أداة إظهار/إخفاء مرحلة من خارج الحزمة. */
const TogglePick = (group, value) => togglePick(group, value);

/** حزمة الورشة مجموعةً واحدة. */
const PrepKit = {
  get PrepStart() {
    return PrepStart;
  },
  get PrepSuggest() {
    return PrepSuggest;
  },
  get PrepStage() {
    return PrepStage;
  },
  get PrepField() {
    return PrepField;
  },
  get PrepList() {
    return PrepList;
  },
  get PrepBoard() {
    return PrepBoard;
  },
  get PrepRail() {
    return PrepRail;
  },
  get PrepToolbar() {
    return PrepToolbar;
  },
  get PrepTeam() {
    return PrepTeam;
  },
  get PrepWideToggle() {
    return PrepWideToggle;
  }
};

Object.assign(Ds, { PrepStart, PrepSuggest, PrepStage, PrepField, PrepList, PrepBoard, PrepRail, PrepToolbar, PrepTeam, PrepWideToggle, TogglePick, PrepKit });
})(window.Ds = window.Ds || {}, window.React);
