import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center gap-5 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)", fontFamily: "var(--font-heading)" }}
        >
          ت
        </div>
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          التقييم
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          منصة إدارة تحكيم المسابقات في الأندية والملتقيات الشبابية
        </p>
      </div>

      <Card className="flex flex-col gap-3">
        <Link
          href="/login"
          className="rounded-xl px-5 py-3.5 text-center text-[15px] font-bold"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          دخول المدير العام / المنظّم
        </Link>
        <p className="text-center text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
          المحكّمون يدخلون حصراً عبر رابط الدعوة المُرسل إليهم لكل مسابقة.
        </p>
      </Card>
    </div>
  );
}
