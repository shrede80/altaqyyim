// Edge Function: link-judge
// تُستدعى بعد نجاح supabase.auth.verifyOtp من طرف المحكّم. تعيد فحص التوكن
// بصلاحية service role (تتجاوز RLS عمداً)، ثم:
//   1) تتحقق أن التوكن صالح (غير مستخدم وغير منتهٍ) ومسابقته ليست مغلقة.
//   2) تُنشئ judge_assignments (competition_id, judge_id = المستخدم المصادَق).
//   3) تمنح دور 'judge' التنظيمي في users_roles — مطلوب لسياسات
//      criteria_select و participants_select في schema.sql.
//   4) تُعلّم الدعوة used_at لمنع إعادة استخدامها.
//
// الأمان: تتحقق أولاً من هوية المستدعي عبر رأس Authorization (JWT المستخدم
// العادي، لا service role) قبل أي كتابة، حتى لا يستطيع أي طرف غير مصادَق
// استدعاء الدالة لربط نفسه بمسابقة عشوائياً بمجرد معرفة رمز.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "missing_authorization" }, 401);
    }

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return json({ error: "missing_token" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // عميل بصلاحية المستخدم المتصل، فقط للتحقق من هويته من التوكن الحقيقي.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return json({ error: "invalid_session" }, 401);
    }
    const judgeId = userData.user.id;
    const judgeEmail = userData.user.email;

    // عميل بصلاحية service role للكتابة عبر RLS بعد التحقق اليدوي من كل شرط.
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: invitation, error: invError } = await admin
      .from("judge_invitations")
      .select("id, competition_id, email, used_at, expires_at, competitions(status)")
      .eq("token", token)
      .maybeSingle();

    if (invError || !invitation) {
      return json({ error: "invitation_not_found" }, 404);
    }
    if (invitation.used_at) {
      return json({ error: "invitation_already_used" }, 409);
    }
    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      return json({ error: "invitation_expired" }, 410);
    }
    const competitionStatus = (invitation as unknown as { competitions: { status: string } }).competitions?.status;
    if (competitionStatus === "scoring_closed") {
      return json({ error: "competition_closed" }, 409);
    }
    if (judgeEmail && invitation.email.toLowerCase() !== judgeEmail.toLowerCase()) {
      return json({ error: "email_mismatch" }, 403);
    }

    const { data: competition, error: compError } = await admin
      .from("competitions")
      .select("id, org_id, name")
      .eq("id", invitation.competition_id)
      .single();
    if (compError || !competition) {
      return json({ error: "competition_not_found" }, 404);
    }

    const { error: assignError } = await admin
      .from("judge_assignments")
      .upsert(
        { competition_id: competition.id, judge_id: judgeId },
        { onConflict: "competition_id,judge_id", ignoreDuplicates: true },
      );
    if (assignError) {
      return json({ error: "assignment_failed", details: assignError.message }, 500);
    }

    const { error: roleError } = await admin
      .from("users_roles")
      .upsert(
        { org_id: competition.org_id, user_id: judgeId, role: "judge" },
        { onConflict: "org_id,user_id,role", ignoreDuplicates: true },
      );
    if (roleError) {
      return json({ error: "role_grant_failed", details: roleError.message }, 500);
    }

    const { error: markUsedError } = await admin
      .from("judge_invitations")
      .update({ used_at: new Date().toISOString() })
      .eq("id", invitation.id);
    if (markUsedError) {
      return json({ error: "mark_used_failed", details: markUsedError.message }, 500);
    }

    return json({
      competition_id: competition.id,
      competition_name: competition.name,
    });
  } catch (e) {
    return json({ error: "unexpected_error", details: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
