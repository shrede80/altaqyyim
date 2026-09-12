"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/states";

type Step = "loading" | "invalid" | "confirm-email" | "otp" | "linking" | "error";

interface InvitationPreview {
  competition_name: string;
  email: string;
  invited_name: string | null;
  is_valid: boolean;
}

export default function JudgeInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("loading");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_invitation_preview", { p_token: token });
      if (cancelled) return;
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row || !row.is_valid) {
        setStep("invalid");
        return;
      }
      setPreview(row as InvitationPreview);
      setEmail(row.email);
      setStep("confirm-email");
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, token]);

  async function sendCode() {
    if (!email.trim() || sending) return;
    setSending(true);
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setSending(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setStep("otp");
  }

  async function verifyCode() {
    if (otp.trim().length < 6 || sending) return;
    setSending(true);
    setErrorMessage("");

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });

    if (verifyError || !verifyData.session) {
      setSending(false);
      setErrorMessage("رمز التحقق غير صحيح أو منتهي — أعد المحاولة");
      return;
    }

    setStep("linking");
    const { data: fnData, error: fnError } = await supabase.functions.invoke("link-judge", {
      body: { token },
    });

    setSending(false);
    if (fnError || !fnData?.competition_id) {
      setStep("error");
      setErrorMessage("تعذّر ربطك بالمسابقة — تواصل مع المنظّم");
      return;
    }

    router.push(`/judge/${fnData.competition_id}`);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center p-6">
      <Card className="flex flex-col gap-5">
        {step === "loading" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="skeleton-pulse h-4 w-2/3 rounded-md" />
            <div className="skeleton-pulse h-4 w-1/2 rounded-md" />
          </div>
        ) : null}

        {step === "invalid" ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-extrabold"
              style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
            >
              !
            </div>
            <p className="text-base font-bold">رابط الدعوة غير صالح</p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              الرابط منتهي الصلاحية أو مُستخدم مسبقاً. تواصل مع منظّم المسابقة للحصول على رابط جديد.
            </p>
          </div>
        ) : null}

        {step === "confirm-email" && preview ? (
          <div className="flex flex-col gap-4 text-center">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-xl font-extrabold"
              style={{ background: "var(--color-warning-bg)", color: "var(--color-primary)" }}
            >
              ت
            </div>
            <div>
              <h1 className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
                {preview.competition_name}
              </h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                أنت مدعو للتحكيم في هذه المسابقة. تسجيل الدرجات مستقل تماماً عن باقي المحكّمين.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 text-right">
              <label className="text-xs font-bold" style={{ color: "var(--color-text-secondary)" }}>
                البريد الإلكتروني
              </label>
              <Input dir="ltr" className="text-right" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
            <Button fullWidth onClick={sendCode} disabled={!email.trim() || sending}>
              {sending ? "جارٍ الإرسال..." : "إرسال رمز التحقق"}
            </Button>
          </div>
        ) : null}

        {step === "otp" ? (
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
              أدخل رمز التحقق
            </h1>
            <p className="text-[13.5px]" style={{ color: "var(--color-text-secondary)" }}>
              أرسلنا رمزاً من 6 أرقام إلى <span dir="ltr">{email}</span>
            </p>
            <Input
              dir="ltr"
              className="text-center text-lg tracking-[0.4em]"
              maxLength={6}
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verifyCode()}
            />
            {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
            <Button fullWidth onClick={verifyCode} disabled={otp.trim().length < 6 || sending}>
              {sending ? "جارٍ التأكيد..." : "تأكيد"}
            </Button>
            <button
              type="button"
              onClick={sendCode}
              disabled={sending}
              className="text-xs font-bold"
              style={{ color: "var(--color-info)" }}
            >
              إعادة إرسال الرمز
            </button>
          </div>
        ) : null}

        {step === "linking" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="skeleton-pulse h-4 w-2/3 rounded-md" />
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              جارٍ ربط حسابك بالمسابقة...
            </p>
          </div>
        ) : null}

        {step === "error" ? <ErrorBanner message={errorMessage} /> : null}
      </Card>
    </div>
  );
}
