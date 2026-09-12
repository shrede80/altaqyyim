"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import type { Participant, ParticipantType } from "@/lib/types";

export function AddParticipants({
  competitionId,
  initialParticipants,
}: {
  competitionId: string;
  initialParticipants: Participant[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [tab, setTab] = useState<"manual" | "import">("manual");
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [draftName, setDraftName] = useState("");
  const [draftType, setDraftType] = useState<ParticipantType>("individual");
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function addDraft() {
    const trimmed = draftName.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from("participants")
      .insert({ competition_id: competitionId, name: trimmed, type: draftType })
      .select()
      .single();

    if (error || !data) {
      setErrorMessage(error?.message ?? "تعذّرت إضافة المتسابق");
      return;
    }
    setParticipants((prev) => [...prev, data]);
    setDraftName("");
    showToast("تمت الإضافة", "success");
  }

  async function removeParticipant(id: string) {
    const previous = participants;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from("participants").delete().eq("id", id);
    if (error) {
      setParticipants(previous);
      setErrorMessage(error.message);
    }
  }

  function normalizeType(raw: string | undefined): ParticipantType {
    const v = (raw || "").trim().toLowerCase();
    return v === "فريق" || v === "team" ? "team" : "individual";
  }

  function onFileSelected(file: File) {
    setIsImporting(true);
    setErrorMessage("");
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const nameKey = Object.keys(result.data[0] || {}).find((k) =>
            ["الاسم", "name", "اسم"].includes(k.trim()),
          );
          const typeKey = Object.keys(result.data[0] || {}).find((k) =>
            ["النوع", "type", "نوع"].includes(k.trim()),
          );

          if (!nameKey) {
            throw new Error('لم يتم العثور على عمود "الاسم" في الملف');
          }

          const rows = result.data
            .map((row) => ({
              competition_id: competitionId,
              name: (row[nameKey] || "").trim(),
              type: normalizeType(typeKey ? row[typeKey] : undefined),
            }))
            .filter((r) => r.name.length > 0);

          if (rows.length === 0) throw new Error("الملف لا يحتوي أي صف صالح");

          const { data, error } = await supabase.from("participants").insert(rows).select();
          if (error) throw error;

          setParticipants((prev) => [...prev, ...(data ?? [])]);
          showToast(`تم استيراد ${rows.length} متسابقاً`, "success");
        } catch (e) {
          setErrorMessage(e instanceof Error ? e.message : "تعذّر استيراد الملف");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      error: (err) => {
        setErrorMessage(err.message);
        setIsImporting(false);
      },
    });
  }

  const tabBtn = (active: boolean) =>
    `flex-1 rounded-xl py-2.5 text-center text-[13.5px] font-bold border-2 ${active ? "" : ""}`;

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-heading)" }}>
          إضافة المتسابقين
        </h1>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={tabBtn(tab === "manual")}
          style={{
            background: tab === "manual" ? "var(--color-primary)" : "var(--color-card)",
            color: tab === "manual" ? "var(--color-on-primary)" : "var(--color-text-secondary)",
            borderColor: tab === "manual" ? "transparent" : "var(--color-border)",
          }}
        >
          إضافة يدوية
        </button>
        <button
          type="button"
          onClick={() => setTab("import")}
          className={tabBtn(tab === "import")}
          style={{
            background: tab === "import" ? "var(--color-primary)" : "var(--color-card)",
            color: tab === "import" ? "var(--color-on-primary)" : "var(--color-text-secondary)",
            borderColor: tab === "import" ? "transparent" : "var(--color-border)",
          }}
        >
          استيراد ملف CSV
        </button>
      </div>

      {tab === "manual" ? (
        <Card>
          <div className="flex flex-wrap gap-2.5">
            <Input
              placeholder="اسم المتسابق أو الفريق"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDraft()}
              className="min-w-[200px] flex-[2]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDraftType("individual")}
                className="rounded-xl px-4 py-3 text-[13.5px] font-bold border-2"
                style={{
                  background: draftType === "individual" ? "var(--color-primary)" : "var(--color-card)",
                  color: draftType === "individual" ? "var(--color-on-primary)" : "var(--color-text-secondary)",
                  borderColor: draftType === "individual" ? "transparent" : "var(--color-border)",
                }}
              >
                فردي
              </button>
              <button
                type="button"
                onClick={() => setDraftType("team")}
                className="rounded-xl px-4 py-3 text-[13.5px] font-bold border-2"
                style={{
                  background: draftType === "team" ? "var(--color-primary)" : "var(--color-card)",
                  color: draftType === "team" ? "var(--color-on-primary)" : "var(--color-text-secondary)",
                  borderColor: draftType === "team" ? "transparent" : "var(--color-border)",
                }}
              >
                فريق
              </button>
            </div>
            <Button onClick={addDraft} disabled={!draftName.trim()} className="!px-5 !py-3">
              + إضافة
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelected(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed py-11 text-center"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{ background: "var(--color-warning-bg)", color: "var(--color-secondary)" }}
            >
              ↥
            </span>
            <span className="text-[14.5px] font-bold">اضغط لاختيار ملف CSV</span>
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              الأعمدة المطلوبة: الاسم، النوع (فردي/فريق)
            </span>
          </button>
          {isImporting ? (
            <p className="text-center text-[13px] font-bold" style={{ color: "var(--color-secondary)" }}>
              جارٍ استيراد الملف...
            </p>
          ) : null}
        </div>
      )}

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      <div className="flex flex-col gap-2.5">
        <h2 className="text-[15px] font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          المتسابقون المُضافون ({participants.length})
        </h2>
        {participants.length === 0 ? (
          <Card padding="sm" className="text-center text-[13.5px]" style={{ color: "var(--color-text-tertiary)" }}>
            لم تتم إضافة أي متسابق بعد
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {participants.map((p) => (
              <Card key={p.id} padding="sm" className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[14.5px] font-bold">{p.name}</span>
                  <span
                    className="rounded-lg px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      background: p.type === "team" ? "var(--color-info-bg)" : "var(--color-track)",
                      color: p.type === "team" ? "var(--color-info)" : "var(--color-text-secondary)",
                    }}
                  >
                    {p.type === "team" ? "فريق" : "فردي"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeParticipant(p.id)}
                  aria-label="حذف"
                  className="text-base"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  ×
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-1.5 flex justify-end">
        <Button
          onClick={() => router.push(`/organizer/competitions/${competitionId}/judges`)}
          disabled={participants.length === 0}
        >
          متابعة لتعيين المحكّمين
        </Button>
      </div>
    </div>
  );
}
