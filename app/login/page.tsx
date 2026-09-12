"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/states";

export default function OrganizerLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = email.trim().length > 0 && password.length > 0 && status !== "loading";

  async function onSubmit() {
    // تحقق فعلي يمنع أي استدعاء API عند عدم استيفاء الشرط، لا مجرد تعطيل بصري.
    if (!canSubmit) return;

    setStatus("loading");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (error) {
      setStatus("error");
      setErrorMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      return;
    }

    router.push("/organizer/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center p-6">
      <Card className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-13 w-13 items-center justify-center rounded-2xl text-xl font-extrabold"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)", fontFamily: "var(--font-heading)" }}
          >
            ت
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
              تسجيل الدخول
            </h1>
            <p className="mt-1 text-[13.5px]" style={{ color: "var(--color-text-secondary)" }}>
              للمدير العام والمنظّمين
            </p>
          </div>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          {status === "error" ? <ErrorBanner message={errorMessage} /> : null}

          <div className="flex flex-col gap-1.5">
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              dir="ltr"
              className="text-right"
              placeholder="name@club.org"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus("idle");
              }}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>كلمة المرور</Label>
            <div className="relative flex items-center">
              <Input
                type={showPassword ? "text" : "password"}
                dir="ltr"
                className="text-right"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setStatus("idle");
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3.5 text-[12.5px] font-bold"
                style={{ color: "var(--color-secondary)" }}
              >
                {showPassword ? "إخفاء" : "إظهار"}
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth disabled={!canSubmit}>
            {status === "loading" ? "جارٍ الدخول..." : "دخول"}
          </Button>
        </form>

        <p className="text-center text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          محكّم؟ الدخول يتم حصراً عبر رابط الدعوة المُرسل إليك.
        </p>
      </Card>
      <Link href="/" className="mt-4 text-center text-xs" style={{ color: "var(--color-info)" }}>
        ← العودة للرئيسية
      </Link>
    </div>
  );
}
