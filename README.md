# التقييم — منصة إدارة تحكيم المسابقات

تطبيق ويب إنتاجي (Next.js 16 App Router + TypeScript + Tailwind v4 +
Supabase) لإدارة تحكيم المسابقات في الأندية والملتقيات الشبابية: قوالب
تقييم، مسابقات، متسابقون، محكّمون يدخلون بلا كلمة مرور عبر رابط دعوة،
تسجيل درجات مع حفظ تلقائي وقفل حقيقي، ولوحة نتائج حيّة قابلة للاعتماد
والنشر والتصدير.

## التشغيل محلياً

```bash
npm install
cp .env.example .env.local   # وأدخل بيانات مشروع Supabase الحقيقي
npm run dev
```

## إعداد Supabase

1. أنشئ مشروع Supabase جديداً.
2. طبّق `supabase/schema.sql` كاملاً في SQL Editor (أو `supabase db push`).
   يتضمن: الجداول، RLS، دالة `get_invitation_preview` لمعاينة دعوة
   المحكّم قبل المصادقة، وتفعيل Realtime على جدول `scores`.
3. انشر Edge Function الربط بعد قبول دعوة المحكّم:
   ```bash
   supabase functions deploy link-judge
   ```
4. أنشئ أول منظمة ومنظّم يدوياً (لا توجد شاشة تسجيل عام؛ المنصة مخصصة
   لنادٍ تُدار مستخدموه من الخلف):
   ```sql
   insert into organizations (name, slug) values ('نادي المثال', 'example-club');
   -- أنشئ مستخدم Auth (من لوحة Supebase أو auth.admin API) ثم:
   insert into users_roles (org_id, user_id, role) values ('<org_id>', '<user_id>', 'organizer');
   ```
5. انسخ `.env.example` إلى `.env.local` وعبّئ `NEXT_PUBLIC_SUPABASE_URL`
   و`NEXT_PUBLIC_SUPABASE_ANON_KEY` من إعدادات المشروع.

## الاختبارات

```bash
npm test            # اختبارات lib/scoring.ts و lib/results.ts (Vitest)
supabase test db     # اختبار سياسة RLS الحرجة scores_update (pgTAP)
```

اختبار `supabase/tests/scores_update_policy.test.sql` يتحقق تحديداً أن
التصحيح المطلوب (`WITH CHECK` منفصلة عن `USING` في سياسة `scores_update`)
يسمح فعلياً للمحكّم بقفل درجته (`is_locked: false → true`)، وأن كل
الحالات التي يجب رفضها (محكّم آخر، تغيير `judge_id`، تحكيم مغلق) ما زالت
مرفوضة.

## بنية المشروع

```
app/
  login/                          تسجيل دخول المنظّم (Supabase Auth)
  organizer/                      محمي بـ requireOrganizer() في layout.tsx
    dashboard/                    لوحة المسابقات
    competitions/new/             إنشاء مسابقة
    competitions/[id]/participants/  إضافة متسابقين (يدوي + CSV حقيقي)
    competitions/[id]/judges/     تعيين محكّمين عبر روابط دعوة
    competitions/[id]/results/    لوحة النتائج الحيّة + الاعتماد + التصدير
    templates/new, templates/[id]/   محرر قالب التقييم
  judge/
    invite/[token]/               دخول المحكّم: OTP ثم ربط عبر Edge Function
    [competitionId]/              شاشة تسجيل الدرجات
lib/
  scoring.ts, results.ts          منطق التجميع (مُختبر بالكامل)
  offline-queue.ts                طابور محلي لدرجات أوفلاين
  export/                         PDF (pdf-lib + Amiri) و Excel (exceljs)
  supabase/                       عملاء المتصفح/الخادم/الـ proxy
supabase/
  schema.sql                      المخطط الكامل مع التصحيح المطلوب
  functions/link-judge/           Edge Function لربط المحكّم بعد OTP
  tests/                          اختبار pgTAP لسياسة scores_update
```

## قرارات تصميم وحدود معروفة

- **دعوة المحكّم بالبريد**: الشاشة تُنشئ رابط دعوة حقيقياً (جدول
  `judge_invitations` + token) وتنسخه للحافظة، لكنها لا ترسل بريداً
  فعلياً (لا يوجد مزوّد بريد مُعدّ). أرسل الرابط يدوياً أو اربط لاحقاً
  مزوّد بريد (Resend مثلاً) في `sendInvite()` بمكوّن `assign-judges.tsx`.
- **تشكيل PDF العربي**: pdf-lib لا يدعم OpenType shaping، لذا يُشكَّل
  النص عبر `arabic-reshaper` (تحويل لأشكال العرض السياقية) ثم يُعكس
  ترتيب الأحرف — يعمل بشكل صحيح للنصوص العربية الخالصة أو اللاتينية
  الخالصة في كل عمود، دون خوارزمية bidi كاملة لخلط الاتجاهين بنص واحد
  (غير مطلوب في جدول الترتيب النهائي).
- **متوسط مرجّح (weighted_average)**: وزن كل محكّم يُضبط من شاشة تعيين
  المحكّمين (يظهر الحقل فقط عند اختيار هذه القاعدة) ويُحفظ في
  `competitions.aggregation_config.judgeWeights`.
- **منظمة واحدة لكل منظّم** في هذا الإصدار (`requireOrganizer()` تختار
  أول دور admin/organizer للمستخدم). دعم تعدد المنظمات لكل مستخدم يحتاج
  شاشة اختيار منظمة إضافية.
