#!/usr/bin/env node
/* يبني نسخة HTML واحدة قائمة بذاتها من النظام كما هو الآن.
   التشغيل:  node build-export.mjs
   المخرَج:  export/mazyaa-covers.html

   يضمّن: التوكينات + ٩ أوزان Mestika + الشعار بنسختيه + البدائيات والكتل +
   Cover + بيانات الأغلفة + المُصيّر الصغير — كلها داخل ملف واحد يُفتح بالنقر
   المزدوج، بلا خادم وبلا اتصال وبلا سكربت فك تعبئة.

   ما لا يُضمّن: وحدات src/workspace/ (تحتاج React الحقيقي لأنها ذات حالة). */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const r = (...p) => join(ROOT, ...p);
const b64 = (p) => readFileSync(p).toString("base64");
const kb = (n) => (n / 1024).toFixed(0) + "KB";

/* ── التوكينات: استبدال مسارات الخطوط بـ data: URI ── */
let tokens = readFileSync(r("tokens.css"), "utf8");
let fontBytes = 0;
for (const w of [100, 200, 300, 400, 500, 600, 700, 800, 900]) {
  const p = r("assets", "fonts", `Mestika-${w}.otf`);
  fontBytes += statSync(p).size;
  tokens = tokens.replace(`url("assets/fonts/Mestika-${w}.otf")`, `url("data:font/otf;base64,${b64(p)}")`);
}

/* ── الشعار: data: URI داخل Logo نفسه ── */
let logoBytes = 0;
const logoURI = (tone) => {
  const p = r("assets", `logo-mark-${tone}.png`);
  logoBytes += statSync(p).size;
  return `data:image/png;base64,${b64(p)}`;
};

/* ── المكتبة: البدائيات ثم الكتل (الترتيب لا يهم — الربط متأخر) ── */
const layer = (dir) =>
  readdirSync(r("src", dir))
    .filter((f) => f.endsWith(".js"))
    .sort()
    .map((f) => {
      let s = readFileSync(r("src", dir, f), "utf8");
      if (f === "Logo.js") {
        s = s.replace('black: "assets/logo-mark-black.png"', `black: "${logoURI("black")}"`)
             .replace('white: "assets/logo-mark-white.png"', `white: "${logoURI("white")}"`);
      }
      return s;
    })
    .join("\n");

const data = JSON.parse(readFileSync(r("covers", "covers.json"), "utf8"));
let cover = readFileSync(r("covers", "Cover.js"), "utf8");
cover = cover.replace('Cover.assetBase = "../";', 'Cover.assetBase = ""; /* الأصول مضمَّنة */');

const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>مذياع — الأغلفة</title>
<!--
  نسخة قائمة بذاتها من نظام تصميم "مذياع".
  مولَّدة بـ build-export.mjs — لا تُحرَّر يدويًا؛ عدّل المصدر ثم أعد التوليد.
  تحوي: التوكينات، ٩ أوزان Mestika، الشعار بنسختيه، ٩ بدائيات، ٨ كتل، Cover، والبيانات.
-->
<style>
${tokens}
</style>
<style>
  body { padding: 20px; background: #E4E4E4; }
  .lbl { font-size: 11px; font-weight: 500; letter-spacing: .05em; color: rgba(0,0,0,.55); margin-block-start: 8px; }
  .g { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  @media (max-width: 900px) { .g { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 520px) { .g { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div id="root"></div>

<script>
${readFileSync(r("preview", "mini-react.js"), "utf8")}
</script>
<script>
${layer("primitives")}
</script>
<script>
${layer("blocks")}
</script>
<script>
${cover}
</script>
<script>
const __covers = ${JSON.stringify(data.covers, null, 2)};
ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement("div", { className: "g" },
    __covers.map((c, i) =>
      React.createElement("div", { key: i },
        React.createElement(Ds.Cover, c),
        React.createElement("div", { className: "lbl" }, c.expression)
      )
    )
  )
);
</script>
</body>
</html>
`;

mkdirSync(r("export"), { recursive: true });
const out = r("export", "mazyaa-covers.html");
writeFileSync(out, html);

console.log(`\nتم التصدير: export/mazyaa-covers.html`);
console.log(`  الحجم الكلي      ${kb(Buffer.byteLength(html))}`);
console.log(`  منه خطوط         ${kb(fontBytes)} (٩ أوزان، قبل ترميز base64)`);
console.log(`  منه شعار         ${kb(logoBytes)} (نسختان)`);
console.log(`  مكوّنات مضمَّنة   ${readdirSync(r("src/primitives")).length + readdirSync(r("src/blocks")).length}`);
console.log(`  أغلفة            ${data.covers.length}\n`);
