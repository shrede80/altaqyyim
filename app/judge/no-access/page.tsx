import { Card } from "@/components/ui/card";

export default function JudgeNoAccessPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center p-6">
      <Card className="flex flex-col items-center gap-3 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-extrabold"
          style={{ background: "var(--color-warning-bg)", color: "var(--color-secondary)" }}
        >
          ؟
        </div>
        <h1 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          لا يمكن الوصول لهذه المسابقة
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          الدخول كمحكّم يتم حصراً عبر رابط الدعوة المُرسل إليك لكل مسابقة على حدة. تواصل مع المنظّم إن كنت تتوقع دعوة.
        </p>
      </Card>
    </div>
  );
}
