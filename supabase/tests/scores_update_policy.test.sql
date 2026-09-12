-- ============================================================
-- اختبار سياسة scores_update (pgTAP)
-- يتحقق أن التصحيح المطلوب (WITH CHECK منفصلة عن USING) يسمح فعلياً
-- للمحكّم بقفل درجته (is_locked: false -> true)، وأن كل الحالات
-- الأخرى التي يجب أن تُرفض لا تزال مرفوضة.
--
-- التشغيل:
--   supabase test db
-- (يتطلب إضافتي pgtap و supabase_test_helpers، وهما مفعّلتان افتراضياً
-- في قالب supabase/tests الرسمي: https://supabase.com/docs/guides/database/testing)
-- ============================================================

begin;
select plan(6);

-- ---------- تجهيز البيانات ----------
insert into organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'نادي الاختبار', 'test-club');

select tests.create_supabase_user('judge_a@example.com');
select tests.create_supabase_user('judge_b@example.com');

insert into users_roles (org_id, user_id, role)
values (
  '00000000-0000-0000-0000-000000000001',
  tests.get_supabase_uid('judge_a@example.com'),
  'judge'
);

insert into competitions (id, org_id, name, status, aggregation_rule)
values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'مسابقة الاختبار',
  'scoring_open',
  'simple_average'
);

insert into criteria (id, competition_id, name, max_points, weight_percent)
values (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000002',
  'بند الاختبار', 10, 100
);

insert into participants (id, competition_id, name)
values (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000002',
  'متسابق الاختبار'
);

insert into judge_assignments (competition_id, judge_id)
values (
  '00000000-0000-0000-0000-000000000002',
  tests.get_supabase_uid('judge_a@example.com')
);

-- الدرجة الأولية تُدرج بصلاحية service role مباشرة (تجاوز RLS) لعزل الاختبار
-- عن سياسة scores_insert.
set local role service_role;
insert into scores (id, competition_id, judge_id, participant_id, criterion_id, points, is_locked)
values (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000002',
  tests.get_supabase_uid('judge_a@example.com'),
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000003',
  8, false
);
reset role;

-- ---------- الاختبار 1: المحكّم صاحب الدرجة يستطيع قفلها (false -> true) ----------
select tests.authenticate_as('judge_a@example.com');

update scores set is_locked = true
where id = '00000000-0000-0000-0000-000000000005';

select is(
  (select is_locked from scores where id = '00000000-0000-0000-0000-000000000005'),
  true,
  'المحكّم صاحب الدرجة يستطيع تحديثها من is_locked=false إلى true (التصحيح المطلوب)'
);

-- ---------- الاختبار 2: بعد القفل، لا يستطيع نفس المحكّم تعديل النقاط (USING تمنع الصف القديم المقفل) ----------
update scores set points = 5
where id = '00000000-0000-0000-0000-000000000005';

select is(
  (select points from scores where id = '00000000-0000-0000-0000-000000000005'),
  8::numeric,
  'لا يمكن تعديل درجة مقفلة — USING (not is_locked) ما زالت تعمل كما هو متوقع'
);

-- ---------- تجهيز درجة ثانية لبقية الاختبارات ----------
select tests.clear_authentication();
set local role service_role;
insert into scores (id, competition_id, judge_id, participant_id, criterion_id, points, is_locked)
values (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000002',
  tests.get_supabase_uid('judge_a@example.com'),
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000003',
  3, false
);
reset role;

-- ---------- الاختبار 3: المحكّم لا يستطيع تعديل درجة محكّم آخر ----------
select tests.authenticate_as('judge_b@example.com');

update scores set points = 9
where id = '00000000-0000-0000-0000-000000000006';

select is(
  (select points from scores where id = '00000000-0000-0000-0000-000000000006'),
  3::numeric,
  'محكّم آخر لا يستطيع تعديل درجة ليست له — judge_id = auth.uid() في USING تمنع ذلك'
);

-- ---------- الاختبار 4: WITH CHECK تمنع "سرقة" الدرجة عبر تغيير judge_id ----------
select tests.authenticate_as('judge_a@example.com');

select throws_ok(
  $$ update scores set judge_id = '00000000-0000-0000-0000-000000000099' where id = '00000000-0000-0000-0000-000000000006' $$,
  'new row violates row-level security policy for table "scores"',
  'WITH CHECK (judge_id = auth.uid()) تمنع تغيير judge_id على الصف عبر UPDATE'
);

-- ---------- الاختبار 5: لا يمكن تعديل درجة في مسابقة تحكيمها مغلق (scoring_closed) ----------
set local role service_role;
update competitions set status = 'scoring_closed' where id = '00000000-0000-0000-0000-000000000002';
reset role;

select tests.authenticate_as('judge_a@example.com');

update scores set points = 7
where id = '00000000-0000-0000-0000-000000000006';

select is(
  (select points from scores where id = '00000000-0000-0000-0000-000000000006'),
  3::numeric,
  'لا يمكن تعديل الدرجات بعد إغلاق التحكيم (status <> scoring_open)'
);

-- إعادة الحالة لبقية الاختبار
set local role service_role;
update competitions set status = 'scoring_open' where id = '00000000-0000-0000-0000-000000000002';
reset role;

-- ---------- الاختبار 6: القفل الفعلي في السيناريو الطبيعي — آخر بند يُقفَل بنجاح من واجهة المحكّم ----------
select tests.authenticate_as('judge_a@example.com');

update scores set is_locked = true
where id = '00000000-0000-0000-0000-000000000006';

select is(
  (select is_locked from scores where id = '00000000-0000-0000-0000-000000000006'),
  true,
  'سيناريو القفل الطبيعي لآخر بند ينجح كذلك على درجة ثانية مستقلة'
);

select * from finish();
rollback;
