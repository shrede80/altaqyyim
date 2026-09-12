import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types";

export interface OrganizerContext {
  userId: string;
  email: string | null;
  orgId: string;
  role: AppRole;
}

// يتحقق أن المستخدم مسجّل الدخول وله دور admin أو organizer في منظمة واحدة
// على الأقل، ويعيد أول منظمة كهذه. مشروع بحجم ناد واحد عادة ما يكفيه هذا؛
// التوسّع لتعدد المنظمات يحتاج شاشة اختيار منظمة إضافية لاحقاً.
export async function requireOrganizer(): Promise<OrganizerContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: roleRow } = await supabase
    .from("users_roles")
    .select("org_id, role")
    .in("role", ["admin", "organizer"])
    .limit(1)
    .maybeSingle();

  if (!roleRow) {
    redirect("/login?error=not_organizer");
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    orgId: roleRow.org_id,
    role: roleRow.role as AppRole,
  };
}
