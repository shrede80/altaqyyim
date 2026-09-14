/* مُصيّر صغير متوافق مع واجهة React.createElement — للمخرجات البصرية الثابتة فقط.
   سبب وجوده: مكوّنات هذا النظام (البدائيات والكتل) دوال نقيّة بلا حالة ولا أحداث،
   فرسمها لا يحتاج React (1.1MB) + ReactDOM + Babel (3.1MB). ملفات المكتبة مكتوبة
   على `window.React.createElement`، فتعمل كما هي تحت هذا المصيّر أو تحت React الحقيقي
   دون تعديل حرف واحد.
   ⚠️ لا يدعم الحالة (useState) ولا الأحداث ولا إعادة التصيير — وحدات src/workspace/
   تحتاج React الحقيقي. */
(function (global) {
  "use strict";

  const Fragment = Symbol("Fragment");
  const SVG_NS = "http://www.w3.org/2000/svg";
  const SVG_TAGS = new Set(["svg", "path", "circle", "rect", "g", "line", "polyline", "polygon", "text", "defs", "use"]);

  // marginInlineEnd → margin-inline-end ، WebkitMask → -webkit-mask
  const dashed = (k) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()).replace(/^(webkit|moz|ms)-/, "-$1-");
  const UNITLESS = new Set(["opacity", "zIndex", "fontWeight", "lineHeight", "flex", "flexGrow", "flexShrink", "order", "gridRow", "gridColumn"]);

  function applyStyle(el, style) {
    for (const k in style) {
      const v = style[k];
      if (v == null || v === false) continue;
      if (k.startsWith("--")) { el.style.setProperty(k, String(v)); continue; }
      el.style.setProperty(dashed(k), typeof v === "number" && !UNITLESS.has(k) ? v + "px" : String(v));
    }
  }

  function appendChildren(el, children) {
    for (const c of children) {
      if (c == null || c === false || c === true || c === "") continue;
      if (Array.isArray(c)) { appendChildren(el, c); continue; }
      if (c instanceof Node) { el.appendChild(c); continue; }
      el.appendChild(document.createTextNode(String(c)));
    }
  }

  function createElement(type, props, ...children) {
    props = props || {};
    if (typeof type === "function") {
      // مكوّن: نمرّر children ضمن props كما تفعل React
      const p = { ...props };
      if (children.length) p.children = children.length === 1 ? children[0] : children;
      return type(p);
    }
    if (type === Fragment) {
      const frag = document.createDocumentFragment();
      appendChildren(frag, props.children != null ? [props.children] : children);
      return frag;
    }
    const el = SVG_TAGS.has(type)
      ? document.createElementNS(SVG_NS, type)
      : document.createElement(type);

    for (const k in props) {
      const v = props[k];
      if (k === "children" || k === "key" || k === "ref" || v == null || v === false) continue;
      if (k === "style") { applyStyle(el, v); continue; }
      if (k === "className") { el.setAttribute("class", String(v)); continue; }
      if (k === "htmlFor") { el.setAttribute("for", String(v)); continue; }
      if (k === "dangerouslySetInnerHTML") { el.innerHTML = v.__html; continue; }
      if (typeof v === "function") continue; // لا أحداث في المخرجات الثابتة
      el.setAttribute(k, v === true ? "" : String(v));
    }
    appendChildren(el, props.children != null && !children.length ? [props.children] : children);
    return el;
  }

  global.React = {
    createElement,
    Fragment,
    // كافية للمكوّنات النقيّة؛ أي استدعاء فعلي للحالة يرمي خطأً صريحًا بدل الفشل الصامت
    useState: () => { throw new Error("mini-react: useState غير مدعوم — استخدم React الحقيقي لوحدات workspace"); },
    useEffect: () => {},
    useMemo: (f) => f(),
    useRef: (v) => ({ current: v }),
    useCallback: (f) => f,
  };

  global.ReactDOM = {
    createRoot: (container) => ({
      render(node) { container.textContent = ""; appendChildren(container, [node]); },
    }),
  };
})(window);
