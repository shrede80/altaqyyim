# نظام تصميم "مذياع"

مكتبة هوية بصرية عربية (RTL) لتركيب مخرجات ثابتة: أغلفة، بطاقات، ملصقات،
إطارات فيديو، اقتباسات. مستخرَجة من حزمة ذاتية الفك إلى ملفات مصدر مقروءة.

## التشغيل

```bash
python3 -m http.server 8000 --directory design-system
# افتح: http://localhost:8000/preview/
```

بلا `npm install`، وبلا خطوة بناء.

## غلاف جديد

أضف عنصرًا في [`covers/covers.json`](covers/covers.json) — لا شيفرة:

```json
{ "surface": "ink", "section": "radio", "name": "اسم البرنامج",
  "line": "السطر الوصفي", "expression": "bar/under" }
```

`surface`: `paper` · `ink` · `signal` · `clay` —
`section`: `radio` · `doc` · `skill` —
`expression`: `bar/under` · `bar/edge` · `numeral/hero`

## تصدير نسخة قائمة بذاتها

```bash
node design-system/build-export.mjs
```

يولّد [`export/mazyaa-covers.html`](export/mazyaa-covers.html) — ملف واحد (~1.7MB)
يحوي كل شيء مضمَّنًا: التوكينات، ٩ أوزان Mestika، الشعار بنسختيه، ١٧ مكوّنًا،
والبيانات. يُفتح بالنقر المزدوج: بلا خادم، بلا اتصال، بلا سكربت فك تعبئة.

أعد التوليد بعد أي تعديل على المصدر — لا تحرّر الملف المُصدَّر يدويًا.

## فحص قواعد العلامة

```bash
node design-system/validate.mjs          # النواة
node design-system/validate.mjs --all    # يشمل مساحة العمل
```

يفحص آليًا: اللوحة الرباعية، سُلّم الشفافية، ارتفاعات السطر، انعدام الظل،
الحد الأدنى لحجم النص العربي، وفيض شريط الحافة.

## الملفات

| المسار | المحتوى |
|---|---|
| [`system.md`](system.md) | **المرجع الكامل** — ١٧ قاعدة مقفلة، واجهات كل المكوّنات، التعارضات، جدول التوكينات |
| [`changelog.md`](changelog.md) | ما تغيّر فعليًا وما لم يتغيّر |
| `tokens.css` | التوكينات + `@font-face` + أنماط الأساس |
| `src/primitives/` | ٩ بدائيات (`Bar`, `Board`, `Numeral`, `Logo`, `Tag`, `CTA`, `Icon`, `Metadata`, `Divider`) |
| `src/blocks/` | ٨ كتل (`Headline`, `HeaderBlock`, `ContentCard`, `ImageSurface`, `VideoFrame`, `QuoteBlock`, `PersonBlock`, `TextSurface`) |
| `src/workspace/` | ٣ وحدات أداة تفاعلية — سطح منفصل، ليست جزءًا من نظام الهوية |
| `covers/` | `Cover.js` + بيانات الأغلفة |
| `preview/` | معاينة عاملة + مُصيّر صغير بديل عن React |
| `export/` | النسخة النهائية كملف HTML واحد قائم بذاته (مولَّد) |
| `assets/` | ٩ أوزان Mestika + الشعار بنسختيه |

## القواعد الأربع الكبرى

أربعة ألوان فقط (`paper` · `ink` · `signal` · `clay`)، لا لون خامس ·
لا ظلال إطلاقًا · لا رقم شفافية حر خارج `--opacity-*` ·
لا ارتفاع سطر تحت ١ (إلا الرقم البطل).

التفاصيل الكاملة والبقية في [`system.md`](system.md).
