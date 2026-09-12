// طبقة تخزين مؤقت محلي لدرجات المحكّم عند انقطاع الاتصال — تُزامَن تلقائياً
// عند عودة الاتصال (حدث 'online') أو عند استدعاء flushPendingScoreWrites يدوياً.

export interface PendingScoreWrite {
  type: "score";
  competitionId: string;
  participantId: string;
  criterionId: string;
  points: number;
}

export interface PendingLockWrite {
  type: "lock";
  competitionId: string;
  participantId: string;
}

export type PendingWrite = PendingScoreWrite | PendingLockWrite;

function storageKey(competitionId: string) {
  return `taqyeem_judge_pending_${competitionId}`;
}

export function loadPendingWrites(competitionId: string): PendingWrite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(competitionId));
    return raw ? (JSON.parse(raw) as PendingWrite[]) : [];
  } catch {
    return [];
  }
}

export function savePendingWrites(competitionId: string, writes: PendingWrite[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(competitionId), JSON.stringify(writes));
  } catch {
    // تخزين محلي غير متاح (وضع خاص) — سيُعاد المحاولة في نفس الجلسة فقط
  }
}

export function enqueuePendingWrite(competitionId: string, write: PendingWrite): PendingWrite[] {
  const current = loadPendingWrites(competitionId);
  const withoutDuplicate = current.filter((w) => {
    if (w.type !== write.type) return true;
    if (w.type === "score" && write.type === "score") {
      return !(w.participantId === write.participantId && w.criterionId === write.criterionId);
    }
    if (w.type === "lock" && write.type === "lock") {
      return w.participantId !== write.participantId;
    }
    return true;
  });
  const next = [...withoutDuplicate, write];
  savePendingWrites(competitionId, next);
  return next;
}
