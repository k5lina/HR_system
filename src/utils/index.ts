import type { ResumeAnalysis } from '../types';

export function calcResumeScore(
  skills: number,
  experience: number,
  education: number,
  certifications: number,
  achievements: number,
): number {
  return (
    skills * 0.35 +
    experience * 0.30 +
    education * 0.20 +
    certifications * 0.10 +
    achievements * 0.05
  );
}

export function getResumeStatusLabel(score: number): string {
  if (score < 4) return 'Не подходит';
  if (score < 6) return 'Частично подходит';
  if (score < 8) return 'Хороший кандидат';
  return 'Отличный кандидат';
}

export function calcFunnelConversion(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round((current / previous) * 100);
}

export function calcAbsoluteConversion(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

export function calcAvgStageDays(
  analyses: Array<{ started_at: string; finished_at?: string }>,
): number {
  const completed = analyses.filter((a) => a.finished_at);
  if (completed.length === 0) return 0;
  const totalDays = completed.reduce((sum, a) => {
    const start = new Date(a.started_at).getTime();
    const end = new Date(a.finished_at!).getTime();
    return sum + (end - start) / (1000 * 60 * 60 * 24);
  }, 0);
  return Math.round(totalDays / completed.length);
}

export function calcRefusalShareByReason(
  refusals: Array<{ rejection_reason_id?: number }>,
): Record<number, number> {
  const total = refusals.filter((r) => r.rejection_reason_id).length;
  if (total === 0) return {};
  const counts: Record<number, number> = {};
  refusals.forEach((r) => {
    if (r.rejection_reason_id) {
      counts[r.rejection_reason_id] = (counts[r.rejection_reason_id] ?? 0) + 1;
    }
  });
  const shares: Record<number, number> = {};
  Object.entries(counts).forEach(([id, count]) => {
    shares[Number(id)] = Math.round((count / total) * 100);
  });
  return shares;
}

export function generateMockSpectrumId(): number {
  return Math.floor(100_000_000 + Math.random() * 900_000_000);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU');
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nextId(items: any[], idKey: string): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => Number(i[idKey]))) + 1;
}

/* ── Formatted document ID helpers ──────────────────────────── */
function _yyMm(dateStr: string): [string, string] {
  const d = new Date(dateStr);
  return [String(d.getFullYear()).slice(2), String(d.getMonth() + 1).padStart(2, '0')];
}

/** YY-MM-NN */
export function fmtRequestId(id: number, dateStr: string): string {
  const [yy, mm] = _yyMm(dateStr);
  return `${yy}-${mm}-${String(id).padStart(2, '0')}`;
}

/** YY-MM-NN */
export function fmtVacancyId(id: number, dateStr: string): string {
  const [yy, mm] = _yyMm(dateStr);
  return `${yy}-${mm}-${String(id).padStart(2, '0')}`;
}

/** YY-MM-NNN */
export function fmtPublicationId(id: number, dateStr: string): string {
  const [yy, mm] = _yyMm(dateStr);
  return `${yy}-${mm}-${String(id).padStart(3, '0')}`;
}

/** S-YY-MM-NN (S = stage number) */
export function fmtInterviewId(id: number, dateStr: string, stage: number): string {
  const [yy, mm] = _yyMm(dateStr);
  return `${stage}-${yy}-${mm}-${String(id).padStart(2, '0')}`;
}

/** YY-MM-NNNN */
export function fmtAnalysisId(id: number, dateStr: string): string {
  const [yy, mm] = _yyMm(dateStr);
  return `${yy}-${mm}-${String(id).padStart(4, '0')}`;
}

/** YY-MM-NN */
export function fmtSecurityCheckId(id: number, dateStr: string): string {
  const [yy, mm] = _yyMm(dateStr);
  return `${yy}-${mm}-${String(id).padStart(2, '0')}`;
}

/** YY-MM-NN */
export function fmtMedicalCheckId(id: number, dateStr: string): string {
  const [yy, mm] = _yyMm(dateStr);
  return `${yy}-${mm}-${String(id).padStart(2, '0')}`;
}

/** YY-MM-NN */
export function fmtOfferId(id: number, dateStr: string): string {
  const [yy, mm] = _yyMm(dateStr);
  return `${yy}-${mm}-${String(id).padStart(2, '0')}`;
}
