#!/usr/bin/env node
/* فاحص القواعد المقفلة 🔒 — يحوّل تعليقات القيود إلى فحص آلي.
   التشغيل:  node validate.mjs            (النواة فقط: tokens + primitives + blocks + covers)
             node validate.mjs --all      (يشمل src/workspace)
   يخرج بالرمز 1 إذا وُجدت مخالفة (error)، و0 إذا لم تُوجد إلا تنبيهات (warn). */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const ALL = process.argv.includes("--all");

const PALETTE = { "#f7f7f7": "paper", "#000000": "ink", "#ffb22c": "signal", "#854836": "clay" };
const PALETTE_RGB = ["247,247,247", "0,0,0", "255,178,44", "133,72,54"];

const findings = [];
const add = (level, rule, file, line, msg) => findings.push({ level, rule, file, line, msg });

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) {
      if (!ALL && p.endsWith("workspace")) continue;
      out.push(...walk(p));
    } else if (/\.(js|css)$/.test(e) && !e.endsWith("validate.mjs")) out.push(p);
  }
  return out;
}

const files = [
  join(ROOT, "tokens.css"),
  ...walk(join(ROOT, "src")),
  ...walk(join(ROOT, "covers")),
].filter((f) => { try { statSync(f); return true; } catch { return false; } });

/* يتجاهل التعليقات حتى لا تُحسب أمثلة داخل الشرح مخالفاتٍ */
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
   .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + m.slice(p.length).replace(/./g, " "));

for (const file of files) {
  const rel = relative(ROOT, file);
  const isTokens = rel === "tokens.css";
  const src = readFileSync(file, "utf8");
  const code = stripComments(src);
  const lines = code.split("\n");

  lines.forEach((text, i) => {
    const n = i + 1;

    /* 🔒 أربعة ألوان — اللون الخامس ممنوع */
    for (const m of text.matchAll(/#([0-9A-Fa-f]{3,8})\b/g)) {
      let hex = m[1].toLowerCase();
      if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
      if (hex.length !== 6) continue;
      if (!PALETTE["#" + hex]) {
        add("error", "أربعة ألوان 🔒", rel, n, `لون خارج اللوحة: #${m[1]} — المسموح: paper/ink/signal/clay فقط`);
      } else if (!isTokens) {
        add("warn", "مصدر واحد للّون", rel, n,
          `#${m[1]} = ${PALETTE["#" + hex]} مكتوب حرفيًا — استخدم var(--color-${PALETTE["#" + hex]})`);
      }
    }

    /* 🔒 سُلّم الشفافية — ممنوع رقم حر في المكوّنات.
       تُقرأ rgba(...) بموازنة الأقواس لأن قناة ألفا قد تكون var(--opacity-*) وبداخلها قوس. */
    for (const m of text.matchAll(/rgba?\(/g)) {
      let depth = 0, end = -1;
      for (let j = m.index + m[0].length - 1; j < text.length; j++) {
        if (text[j] === "(") depth++;
        else if (text[j] === ")" && --depth === 0) { end = j; break; }
      }
      if (end < 0) continue;
      const inner = text.slice(m.index + m[0].length, end);
      const parts = []; let buf = "", d = 0;
      for (const ch of inner) {
        if (ch === "(") d++; else if (ch === ")") d--;
        if (ch === "," && d === 0) { parts.push(buf.trim()); buf = ""; } else buf += ch;
      }
      parts.push(buf.trim());
      const rgb = parts.slice(0, 3).join(",");
      if (!PALETTE_RGB.includes(rgb)) {
        add("error", "أربعة ألوان 🔒", rel, n, `rgba بقيم خارج اللوحة: rgb(${rgb})`);
      }
      if (parts.length > 3 && !parts[3].startsWith("var(--opacity")) {
        add(isTokens ? "warn" : "error", "سُلّم الشفافية 🔒", rel, n,
          `رقم شفافية حر (${parts[3]}) — يجب أن يأتي من var(--opacity-*)`);
      }
    }
    for (const m of text.matchAll(/\bopacity"?:\s*(?:[^,;}\n]*?\?\s*)?([0-9](?:\.[0-9]+)?|\.[0-9]+)\b/g)) {
      if (m[1] === "0" || m[1] === "1") continue;
      // أنماط أساس المستند في tokens.css ليست "مكوّنًا" بنصّ القاعدة — تنبيه لا مخالفة
      add(isTokens ? "warn" : "error", "سُلّم الشفافية 🔒", rel, n,
        `رقم شفافية حر (${m[1]}) — يجب أن يأتي من var(--opacity-*)`);
    }

    /* 🔒 لا ظل في النظام — --shadow-all هي القيمة الوحيدة */
    for (const m of text.matchAll(/box-?[sS]hadow"?:\s*"?([^,;"}]+)/g)) {
      const v = m[1].trim();
      if (v !== "none" && !v.startsWith("var(--shadow")) {
        add("error", "لا ظلال 🔒", rel, n, `ظل غير مسموح: ${v} — القيمة الوحيدة none`);
      }
    }

    /* 🔒 لا قيمة ارتفاع سطر تحت ١ — عدا استثناء الرقم البطل المصرَّح به */
    for (const m of text.matchAll(/--lh-([a-z0-9-]+)\s*:\s*([0-9.]+)/g)) {
      if (parseFloat(m[2]) < 1 && m[1] !== "numeral-hero") {
        add("error", "ارتفاع السطر 🔒", rel, n,
          `--lh-${m[1]}: ${m[2]} تحت ١ — الاستثناء الوحيد المصرَّح به هو --lh-numeral-hero`);
      }
    }

    /* --type-min-arabic: 13px — لا نص عربي تحت هذا الحد (يشمل أرضية clamp) */
    for (const m of text.matchAll(/font-?[sS]ize"?:\s*"?((?:[^",;}\n(]|\([^)]*\))+)/g)) {
      const px = [...m[1].matchAll(/(\d+(?:\.\d+)?)px/g)].map((x) => +x[1]);
      const floor = px.length ? Math.min(...px) : null;
      if (floor !== null && floor < 13) {
        add("error", "الحد الأدنى للعربية", rel, n,
          `أصغر حجم في «${m[1].trim()}» هو ${floor}px — تحت --type-min-arabic (13px)`);
      }
    }

    /* --bar-overflow-max: 5% — فيض الشريط عن الحافة */
    for (const m of text.matchAll(/marginInlineEnd"?:\s*"(-\d+(?:\.\d+)?)%"/g)) {
      const over = Math.abs(parseFloat(m[1]));
      if (over > 5) add("warn", "فيض الشريط", rel, n,
        `فيض ${over}% يتجاوز --bar-overflow-max (5%) — تجاوز مقصود أم سهو؟`);
    }

    /* 🔒 الأصفر نصًا على الأسود فقط */
    if (/color:\s*"?var\(--text-accent\)/.test(text) && !/ink/.test(text)) {
      add("warn", "الأصفر على الأسود 🔒", rel, n, "--text-accent كلون نص — تحقّق أن المسرح ink");
    }
  });
}

/* ── التقرير ── */
const errors = findings.filter((f) => f.level === "error");
const warns = findings.filter((f) => f.level === "warn");
const icon = { error: "✖", warn: "▲" };

console.log(`\nفحص القواعد المقفلة — ${files.length} ملفًا${ALL ? " (شامل workspace)" : " (النواة فقط)"}\n`);

if (!findings.length) {
  console.log("  ✔ لا مخالفات.\n");
} else {
  const byRule = {};
  for (const f of findings) (byRule[f.rule] ||= []).push(f);
  for (const rule of Object.keys(byRule)) {
    console.log(`  ${rule}`);
    for (const f of byRule[rule]) console.log(`    ${icon[f.level]} ${f.file}:${f.line} — ${f.msg}`);
    console.log();
  }
}

console.log(`النتيجة: ${errors.length} مخالفة · ${warns.length} تنبيه\n`);
process.exit(errors.length ? 1 : 0);
