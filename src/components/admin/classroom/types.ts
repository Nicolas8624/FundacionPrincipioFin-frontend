// Tipos y utilidades compartidas del Aula Virtual (admin)

export interface ClassroomCourse {
  id: string;
  title: string;
  modality: string;
  schedule_text: string | null;
  capacity: number | null;
  cohort: string | null;
  instructor_name: string | null;
  start_date: string | null;
  end_date: string | null;
  category: { name: string; accent_color?: string | null } | null;
}

export interface ClassroomModule {
  id: string;
  title: string;
  sort_order: number;
}

export interface RubricCriterion {
  id: string;
  number: number;
  title: string;
  weight: number;
  description: string;
}

export interface ClassroomAssignment {
  id: string;
  title: string;
  module_id: string | null;
  instructions: string | null;
  due_at: string | null;
  publish_at: string | null;
  weight_percent: number | null;
  max_score: number;
  rubric_criteria: RubricCriterion[];
  attachment_url: string | null;
  is_published: boolean;
  created_at: string;
}

export type EnrollmentStatus =
  | 'pendiente'
  | 'confirmada'
  | 'lista_espera'
  | 'rechazada'
  | 'cancelada'
  | 'completada';

export interface ClassroomEnrollment {
  id: string;
  user_id: string | null;
  full_name: string;
  document_type: string | null;
  document_number: string | null;
  phone: string | null;
  email: string | null;
  locality: string | null;
  birth_date: string | null;
  guardian_name: string | null;
  status: EnrollmentStatus;
  admin_notes: string | null;
  cupo_type: string | null;
  motivation: string | null;
  withdrawal_reason: string | null;
  withdrawal_date: string | null;
  attended_sessions: number;
  average_grade: number | null;
  has_certificate: boolean;
  certificate_code: string | null;
  certificate_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SubmissionStatus = 'borrador' | 'entregada' | 'calificada' | 'devuelta';

export interface ClassroomSubmissionFile {
  id: string;
  file_name: string;
  mime_type: string | null;
  url: string | null;
}

export interface ClassroomSubmission {
  id: string;
  assignment_id: string;
  enrollment_id: string | null;
  user_id: string | null;
  student_name: string;
  student_document: string;
  project_title: string | null;
  text_content: string | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  is_late: boolean;
  score: number | null;
  feedback: string | null;
  badge: string | null;
  rubric_scores: Record<string, number>;
  correction_note: string | null;
  graded_at: string | null;
  files: ClassroomSubmissionFile[];
}

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------

export const ACTIVE_ENROLLMENT_STATUSES: EnrollmentStatus[] = ['confirmada', 'completada'];
export const APPLICANT_STATUSES: EnrollmentStatus[] = ['pendiente', 'lista_espera'];
export const INACTIVE_STATUSES: EnrollmentStatus[] = ['cancelada', 'rechazada'];

export const CERT_MIN_GRADE = 3.5;
export const CERT_MIN_ATTENDANCE = 80;

export function getInitials(name: string): string {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatDocument(type: string | null, number: string | null): string {
  if (!number) return 'Sin documento';
  return `${type || 'CC'} ${number}`;
}

export function formatDate(value: string | null, withTime = false): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  });
}

export function formatModality(modality: string | null | undefined): string {
  if (!modality) return 'Sin definir';
  if (modality === 'hibrido') return 'Híbrido (Virtual & Presencial)';
  return modality.charAt(0).toUpperCase() + modality.slice(1);
}

/** % de asistencia o null si el curso no tiene sesiones configuradas */
export function attendancePercent(attended: number, totalSessions: number | null): number | null {
  if (!totalSessions || totalSessions <= 0) return null;
  return Math.min(100, Math.round((attended / totalSessions) * 100));
}

/**
 * Promedio ponderado de las entregas calificadas de una inscripción,
 * normalizado a escala 0–5. Si las tareas no tienen ponderación, pesan igual.
 */
export function computeAverage(
  submissions: ClassroomSubmission[],
  assignmentsById: Map<string, ClassroomAssignment>
): number | null {
  const graded = submissions.filter((s) => s.status === 'calificada' && s.score !== null);
  if (graded.length === 0) return null;
  let sum = 0;
  let weights = 0;
  for (const s of graded) {
    const a = assignmentsById.get(s.assignment_id);
    const max = a?.max_score || 5;
    const w = a?.weight_percent && a.weight_percent > 0 ? a.weight_percent : 1;
    sum += ((s.score as number) / max) * 5 * w;
    weights += w;
  }
  return weights > 0 ? Math.round((sum / weights) * 100) / 100 : null;
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number | null)[][]) {
  const escape = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .toLowerCase();
}
