-- ============================================================
-- منصة "التقييم" — مخطط قاعدة البيانات
-- Supabase (PostgreSQL) — الجداول + RLS + Trigger التدقيق
-- ============================================================

-- ---------- Enums ----------
create type app_role as enum ('admin', 'organizer', 'judge', 'viewer');
create type competition_status as enum ('draft', 'scoring_open', 'scoring_closed', 'published');
create type aggregation_rule as enum ('simple_average', 'drop_high_low', 'weighted_average');
create type participant_type as enum ('individual', 'team');

-- ---------- organizations ----------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

-- ---------- users_roles ----------
create table users_roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (org_id, user_id, role)
);
create index idx_users_roles_user on users_roles(user_id);
create index idx_users_roles_org on users_roles(org_id);

-- ---------- evaluation_templates ----------
create table evaluation_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- ---------- template_criteria ----------
create table template_criteria (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references evaluation_templates(id) on delete cascade,
  name text not null,
  description text,
  max_points numeric not null check (max_points > 0),
  weight_percent numeric not null check (weight_percent >= 0 and weight_percent <= 100),
  order_index int not null default 0
);
create index idx_template_criteria_template on template_criteria(template_id);

-- ---------- competitions ----------
create table competitions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  template_id uuid references evaluation_templates(id),
  name text not null,
  description text,
  status competition_status not null default 'draft',
  aggregation_rule aggregation_rule not null default 'simple_average',
  aggregation_config jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index idx_competitions_org on competitions(org_id);

-- ---------- criteria (بنود المسابقة الفعلية، نسخة من القالب أو مباشرة) ----------
create table criteria (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  name text not null,
  description text,
  max_points numeric not null check (max_points > 0),
  weight_percent numeric not null check (weight_percent >= 0 and weight_percent <= 100),
  order_index int not null default 0,
  source_template_criterion_id uuid references template_criteria(id)
);
create index idx_criteria_competition on criteria(competition_id);

-- ---------- participants ----------
create table participants (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  type participant_type not null default 'individual',
  name text not null,
  number int,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index idx_participants_competition on participants(competition_id);

-- ---------- judge_assignments ----------
create table judge_assignments (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  judge_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz not null default now(),
  unique (competition_id, judge_id)
);
create index idx_judge_assignments_judge on judge_assignments(judge_id);

-- ---------- judge_invitations ----------
-- يدعم تدفق دخول المحكّم بلا كلمة مرور (OTP) عبر رابط دعوة يحمل token فريداً.
-- الربط الفعلي بـ judge_assignments (وبمنح دور 'judge' التنظيمي المطلوب لسياسات
-- criteria_select/participants_select أدناه) يتم حصرياً عبر Edge Function
-- بصلاحية service role بعد تأكيد الرمز — راجع supabase/functions/link-judge.
create table judge_invitations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  email text not null,
  invited_name text,
  token uuid not null default gen_random_uuid() unique,
  invited_by uuid references auth.users(id),
  expires_at timestamptz not null default (now() + interval '14 days'),
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_judge_invitations_competition on judge_invitations(competition_id);
create index idx_judge_invitations_email on judge_invitations(email);

-- ---------- scores ----------
create table scores (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  judge_id uuid not null references auth.users(id),
  participant_id uuid not null references participants(id) on delete cascade,
  criterion_id uuid not null references criteria(id) on delete cascade,
  points numeric not null,
  is_locked boolean not null default false,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- القيد الفريد: صف واحد فقط لكل (محكّم × متسابق × بند)؛
  -- أي "تكرار" منطقي هو UPDATE على هذا الصف، لا INSERT جديد — وهذا ما يجعل كل تعديل يُسجَّل في score_audit_log
  unique (judge_id, participant_id, criterion_id)
);
create index idx_scores_competition on scores(competition_id);
create index idx_scores_participant on scores(participant_id);
create index idx_scores_judge on scores(judge_id);

-- يتحقق أن points لا يتجاوز الحد الأقصى للبند المرتبط بها
create or replace function check_score_points() returns trigger as $$
declare v_max numeric;
begin
  select max_points into v_max from criteria where id = new.criterion_id;
  if new.points < 0 or new.points > v_max then
    raise exception 'النقاط (%) خارج المدى المسموح (0 - %)', new.points, v_max;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_check_score_points
before insert or update on scores
for each row execute function check_score_points();

-- ---------- score_audit_log ----------
create table score_audit_log (
  id uuid primary key default gen_random_uuid(),
  score_id uuid not null references scores(id) on delete cascade,
  changed_by uuid references auth.users(id),
  old_points numeric,
  new_points numeric,
  changed_at timestamptz not null default now(),
  reason text
);
create index idx_score_audit_score on score_audit_log(score_id);

-- ---------- score_edit_requests ----------
-- طلب فتح درجات مقفلة للتعديل — يُسجَّل كحدث يراجعه المنظّم، ولا يفتح القفل تلقائياً.
create table score_edit_requests (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references competitions(id) on delete cascade,
  judge_id uuid not null references auth.users(id),
  participant_id uuid not null references participants(id) on delete cascade,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id)
);
create index idx_score_edit_requests_competition on score_edit_requests(competition_id);

-- ============================================================
-- Trigger: تسجيل تعديلات scores تلقائياً في score_audit_log
-- ============================================================
create or replace function log_score_change() returns trigger as $$
begin
  if old.points is distinct from new.points then
    insert into score_audit_log (score_id, changed_by, old_points, new_points)
    values (new.id, auth.uid(), old.points, new.points);
    new.updated_at := now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_log_score_change
before update on scores
for each row execute function log_score_change();

-- ============================================================
-- دوال مساعدة للـ RLS
-- ============================================================
create or replace function has_org_role(p_org_id uuid, p_roles app_role[]) returns boolean as $$
  select exists (
    select 1 from users_roles
    where org_id = p_org_id and user_id = auth.uid() and role = any(p_roles)
  );
$$ language sql security definer stable;

create or replace function competition_org(p_competition_id uuid) returns uuid as $$
  select org_id from competitions where id = p_competition_id;
$$ language sql security definer stable;

create or replace function is_platform_admin() returns boolean as $$
  select exists (select 1 from users_roles where user_id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- تُستخدم من شاشة دخول المحكّم قبل المصادقة: تعرض معاينة آمنة لدعوة صالحة
-- (اسم المسابقة والبريد المدعو فقط) دون منح أي صلاحية قراءة مباشرة على الجدول.
create or replace function get_invitation_preview(p_token uuid)
returns table(competition_name text, email text, invited_name text, is_valid boolean)
language sql security definer stable as $$
  select c.name, ji.email, ji.invited_name,
         (ji.used_at is null and ji.expires_at > now())
  from judge_invitations ji
  join competitions c on c.id = ji.competition_id
  where ji.token = p_token;
$$;

-- ============================================================
-- تفعيل RLS
-- ============================================================
alter table organizations enable row level security;
alter table users_roles enable row level security;
alter table evaluation_templates enable row level security;
alter table template_criteria enable row level security;
alter table competitions enable row level security;
alter table criteria enable row level security;
alter table participants enable row level security;
alter table judge_assignments enable row level security;
alter table judge_invitations enable row level security;
alter table scores enable row level security;
alter table score_audit_log enable row level security;
alter table score_edit_requests enable row level security;

-- ---------- organizations ----------
create policy org_select on organizations for select
  using (has_org_role(id, array['admin','organizer','judge','viewer']::app_role[]));

-- ---------- users_roles: كل مستخدم يرى صفوف دوره الخاصة فقط؛ الإدارة عبر المدير العام ----------
create policy users_roles_select_self on users_roles for select
  using (user_id = auth.uid());
create policy users_roles_admin_all on users_roles for all
  using (is_platform_admin())
  with check (is_platform_admin());

-- ---------- evaluation_templates / template_criteria ----------
create policy templates_select on evaluation_templates for select
  using (has_org_role(org_id, array['admin','organizer']::app_role[]));
create policy templates_write on evaluation_templates for all
  using (has_org_role(org_id, array['admin','organizer']::app_role[]))
  with check (has_org_role(org_id, array['admin','organizer']::app_role[]));

create policy template_criteria_select on template_criteria for select
  using (has_org_role((select org_id from evaluation_templates t where t.id = template_id), array['admin','organizer']::app_role[]));
create policy template_criteria_write on template_criteria for all
  using (has_org_role((select org_id from evaluation_templates t where t.id = template_id), array['admin','organizer']::app_role[]))
  with check (has_org_role((select org_id from evaluation_templates t where t.id = template_id), array['admin','organizer']::app_role[]));

-- ---------- competitions: المنظّم يرى/يدير مسابقات منظمته فقط ----------
create policy competitions_select on competitions for select
  using (has_org_role(org_id, array['admin','organizer']::app_role[])
         or exists (select 1 from judge_assignments ja where ja.competition_id = id and ja.judge_id = auth.uid()));

create policy competitions_insert on competitions for insert
  with check (has_org_role(org_id, array['admin','organizer']::app_role[]));

create policy competitions_update on competitions for update
  using (has_org_role(org_id, array['admin','organizer']::app_role[]));

-- حذف مسابقة: يُمنع إن كانت تحتوي درجات، إلا للمدير العام
create policy competitions_delete on competitions for delete
  using (
    has_org_role(org_id, array['admin']::app_role[])
    or (
      has_org_role(org_id, array['organizer']::app_role[])
      and not exists (select 1 from scores s where s.competition_id = competitions.id)
    )
  );

-- ---------- criteria / participants / judge_assignments: تابعة لمسابقة ----------
create policy criteria_select on criteria for select
  using (has_org_role(competition_org(competition_id), array['admin','organizer','judge']::app_role[]));
create policy criteria_write on criteria for all
  using (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]))
  with check (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]));

create policy participants_select on participants for select
  using (has_org_role(competition_org(competition_id), array['admin','organizer','judge']::app_role[]));
create policy participants_write on participants for all
  using (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]))
  with check (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]));

create policy judge_assignments_select on judge_assignments for select
  using (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]) or judge_id = auth.uid());
create policy judge_assignments_write on judge_assignments for all
  using (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]))
  with check (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]));

-- ---------- judge_invitations: يديرها المنظّم فقط؛ المعاينة قبل المصادقة عبر get_invitation_preview ----------
create policy judge_invitations_select on judge_invitations for select
  using (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]));
create policy judge_invitations_insert on judge_invitations for insert
  with check (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]));
create policy judge_invitations_update on judge_invitations for update
  using (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]))
  with check (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]));
create policy judge_invitations_delete on judge_invitations for delete
  using (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]));

-- ---------- scores: المحكّم يرى/يعدّل فقط درجاته ----------
create policy scores_select_judge on scores for select
  using (judge_id = auth.uid());
create policy scores_select_organizer on scores for select
  using (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]));

create policy scores_insert on scores for insert
  with check (
    judge_id = auth.uid()
    and exists (select 1 from judge_assignments ja where ja.competition_id = scores.competition_id and ja.judge_id = auth.uid())
    and exists (select 1 from competitions c where c.id = scores.competition_id and c.status = 'scoring_open')
  );

-- التصحيح الإلزامي: WITH CHECK منفصلة عن USING — غيابها يجعل شرط USING (not is_locked)
-- يُطبَّق أيضاً على الصف الجديد بعد التحديث، فيمنع فعلياً أي محكّم من قفل درجاته
-- (الانتقال من is_locked=false إلى true) لأن الصف الناتج لن يحقق not is_locked.
-- WITH CHECK هنا تتحقق فقط من هوية المحكّم على الصف الجديد، لا من حالة القفل.
create policy scores_update on scores for update
  using (
    judge_id = auth.uid()
    and not is_locked
    and exists (select 1 from competitions c where c.id = scores.competition_id and c.status = 'scoring_open')
  )
  with check (judge_id = auth.uid());

-- لا حذف للدرجات إلا من المدير العام (سجل التدقيق يحفظ التاريخ فقط عند التحديث)
create policy scores_delete on scores for delete
  using (has_org_role(competition_org(competition_id), array['admin']::app_role[]));

-- ---------- score_audit_log: قراءة فقط للمنظّم/المدير، بدون كتابة يدوية ----------
create policy audit_select on score_audit_log for select
  using (
    exists (
      select 1 from scores s
      where s.id = score_audit_log.score_id
      and has_org_role(competition_org(s.competition_id), array['admin','organizer']::app_role[])
    )
  );

-- ---------- score_edit_requests: المحكّم ينشئ طلبه الخاص، المنظّم يرى/يبت فيه ----------
create policy score_edit_requests_select on score_edit_requests for select
  using (
    judge_id = auth.uid()
    or has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[])
  );
create policy score_edit_requests_insert on score_edit_requests for insert
  with check (
    judge_id = auth.uid()
    and exists (select 1 from judge_assignments ja where ja.competition_id = score_edit_requests.competition_id and ja.judge_id = auth.uid())
  );
create policy score_edit_requests_update on score_edit_requests for update
  using (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]))
  with check (has_org_role(competition_org(competition_id), array['admin','organizer']::app_role[]));
