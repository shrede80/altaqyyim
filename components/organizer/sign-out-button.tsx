"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="rounded-xl border-2 px-3.5 py-2 text-xs font-bold"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
    >
      خروج
    </button>
  );
}
