"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";

interface JudgeRow {
  id: string;
  email: string;
  token: string;
  used_at: string | null;
  accepted_user_id: string | null;
}

export function AssignJudges({
  competitionId,
  initialInvitations,
  initialAssignedJudgeIds,
  origin,
  invitedBy,
}: {
  competitionId: string;
  initialInvitations: JudgeRow[];
  initialAssignedJudgeIds: string[];
  origin: string;
  invitedBy: string;
}) {
  const supabase = createClient();
  const { showToast } = useToast();

  const [inviteEmail, setInviteEmail] = useState("");
  const [invitations, setInvitations] = useState<JudgeRow[]>(initialInvitations);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set(initialAssignedJudgeIds));
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function sendInvite() {
    const email = inviteEmail.trim();
    if (!email || sending) return;
    setSending(true);
    setErrorMessage("");
    try {
      const { data, error } = await supabase
        .from("judge_invitations")
        .insert({ competition_id: competitionId, email, invited_by: invitedBy })
        .select()
        .single();
      if (error || !data) throw error ?? new Error("تعذّر إنشاء الدعوة");

      setInvitations((prev) => [data, ...prev]);
      setInviteEmail("");

      const link = `${origin}/judge/invite/${data.token}`;
      try {
        await navigator.clipboard.writeText(link);
        showToast("تم إنشاء رابط الدعوة ونسخه — أرسله للمحكّم", "success");
      } catch {
        showToast("تم إنشاء رابط الدعوة", "success");
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "تعذّر إرسال الدعوة");
    } finally {
      setSending(false);
    }
  }

  async function toggleAssignment(row: JudgeRow) {
    if (!row.accepted_user_id) return;
    const isAssigned = assignedIds.has(row.accepted_user_id);
    const previous = new Set(assignedIds);

    if (isAssigned) {
      const next = new Set(assignedIds);
      next.delete(row.accepted_user_id);
      setAssignedIds(next);
      const { error } = await supabase
        .from("judge_assignments")
        .delete()
        .eq("competition_id", competitionId)
        .eq("judge_id", row.accepted_user_id);
      if (error) {
        setAssignedIds(previous);
        setErrorMessage(error.message);
      }
    } else {
      const next = new Set(assignedIds);
      next.add(row.accepted_user_id);
      setAssignedIds(next);
      const { error } = await supabase
        .from("judge_assignments")
        .insert({ competition_id: competitionId, judge_id: row.accepted_user_id });
      if (error) {
        setAssignedIds(previous);
        setErrorMessage(error.message);
      }
    }
  }

  async function copyLink(token: string) {
    const link = `${origin}/judge/invite/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast("تم نسخ رابط الدعوة", "info");
    } catch {
      showToast(link, "info");
    }
  }

  const assignedCount = invitations.filter((j) => j.accepted_user_id && assignedIds.has(j.accepted_user_id)).length;

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          تعيين المحكّمين
        </h1>
      </div>

      <Card className="flex flex-col gap-3">
        <p className="text-[14.5px] font-bold">دعوة محكّم جديد</p>
        <div className="flex flex-wrap gap-2.5">
          <Input
            type="email"
            dir="ltr"
            className="min-w-[220px] flex-1 text-right"
            placeholder="بريد المحكّم الإلكتروني"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendInvite()}
          />
          <Button
            onClick={sendInvite}
            disabled={!inviteEmail.trim() || sending}
            className="!bg-[#111111] !text-white"
          >
            {sending ? "جارٍ الإرسال..." : "إنشاء رابط دعوة"}
          </Button>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
          يُنسخ رابط الدعوة تلقائياً — أرسله للمحكّم بالبريد أو واتساب. الدخول عبره لا يتطلب كلمة مرور.
        </p>
      </Card>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      {invitations.length === 0 ? (
        <Card padding="sm" className="text-center text-[13.5px]" style={{ color: "var(--color-text-tertiary)" }}>
          لا يوجد محكّمون معيّنون بعد — استخدم الدعوة أعلاه لإضافة أول محكّم
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {invitations.map((j) => {
            const isAssigned = !!j.accepted_user_id && assignedIds.has(j.accepted_user_id);
            const statusLabel = !j.used_at
              ? "دعوة مُرسلة — بانتظار القبول"
              : isAssigned
                ? "معيّن لهذه المسابقة"
                : "غير معيّن";
            return (
              <Card key={j.id} padding="sm" className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[14.5px] font-bold" dir="ltr">
                    {j.email}
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {statusLabel}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!j.used_at ? (
                    <button
                      type="button"
                      onClick={() => copyLink(j.token)}
                      className="rounded-lg px-3.5 py-2 text-xs font-bold"
                      style={{ background: "var(--color-track)", color: "var(--color-text-secondary)" }}
                    >
                      نسخ الرابط
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleAssignment(j)}
                      className="rounded-lg px-3.5 py-2 text-xs font-bold"
                      style={{
                        background: isAssigned ? "var(--color-success-bg)" : "var(--color-primary)",
                        color: isAssigned ? "var(--color-success)" : "var(--color-on-primary)",
                      }}
                    >
                      {isAssigned ? "إلغاء التعيين" : "تعيين"}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-[13px] font-bold" style={{ color: "var(--color-text-secondary)" }}>
          {assignedCount} من {invitations.length} محكّمين معيّنون لهذه المسابقة
        </p>
      </div>
    </div>
  );
}
