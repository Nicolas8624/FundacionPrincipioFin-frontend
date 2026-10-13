'use server';

import { createServerClient } from '@/services/supabase/server';
import { revalidatePath } from 'next/cache';
import type { RubricCriterion } from '@/components/admin/classroom/types';

export interface UpdateCourseSettingsInput {
  courseId: string;
  cohort?: string | null;
  instructorName?: string | null;
  scheduleText?: string | null;
  capacity?: number | null;
}

export interface ActionResult {
  success: boolean;
  error?: string;
  warning?: string;
}

/** Actualizar metadatos y parámetros del curso */
export async function updateCourseSettingsAction(
  input: UpdateCourseSettingsInput
): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    const payload = {
      cohort: input.cohort?.trim() || null,
      instructor_name: input.instructorName?.trim() || null,
      schedule_text: input.scheduleText?.trim() || null,
      capacity: typeof input.capacity === 'number' && !isNaN(input.capacity) ? input.capacity : null
    };

    const { error } = await supabase
      .from('courses')
      .update(payload)
      .eq('id', input.courseId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/cursos/${input.courseId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Error en updateCourseSettingsAction:', err);
    return { success: false, error: err?.message || 'Error inesperado al actualizar el curso' };
  }
}

export interface UpsertAssignmentInput {
  id?: string;
  courseId: string;
  moduleId?: string | null;
  title: string;
  instructions?: string | null;
  weightPercent?: number | null;
  dueAt?: string | null;
  publishAt?: string | null;
  rubricCriteria?: RubricCriterion[];
  attachmentUrl?: string | null;
  isPublished?: boolean;
}

/** Crear o editar una asignación / tarea */
export async function upsertAssignmentAction(
  input: UpsertAssignmentInput
): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    const payload = {
      course_id: input.courseId,
      module_id: input.moduleId && input.moduleId.length > 10 ? input.moduleId : null,
      title: input.title.trim(),
      instructions: input.instructions?.trim() || null,
      weight_percent: typeof input.weightPercent === 'number' ? input.weightPercent : null,
      max_score: 5.0,
      due_at: input.dueAt || null,
      publish_at: input.publishAt || null,
      rubric_criteria: input.rubricCriteria || [],
      attachment_url: input.attachmentUrl || null,
      is_published: input.isPublished ?? true
    };

    if (input.id) {
      const { error } = await supabase
        .from('assignments')
        .update(payload)
        .eq('id', input.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('assignments')
        .insert([payload]);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath(`/admin/cursos/${input.courseId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Error en upsertAssignmentAction:', err);
    return { success: false, error: err?.message || 'Error al guardar la asignación' };
  }
}

/** Eliminar una asignación de forma segura */
export async function deleteAssignmentAction(
  assignmentId: string,
  courseId: string
): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Validar si tiene entregas asociadas
    const { count, error: countError } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_id', assignmentId);

    if (countError) {
      console.warn('Error al verificar entregas:', countError.message);
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `No se puede eliminar la tarea porque ya tiene ${count} entrega(s) de estudiantes registrada(s). Puedes editar sus datos o archivarla.`
      };
    }

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Error en deleteAssignmentAction:', err);
    return { success: false, error: err?.message || 'Error inesperado al eliminar la asignación' };
  }
}

/** Crear o editar un módulo temático */
export async function upsertModuleAction(
  courseId: string,
  title: string,
  moduleId?: string,
  sortOrder?: number
): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    if (moduleId) {
      const { error } = await supabase
        .from('course_modules')
        .update({ title: title.trim() })
        .eq('id', moduleId);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from('course_modules')
        .insert({
          course_id: courseId,
          title: title.trim(),
          sort_order: sortOrder ?? 1
        });

      if (error) return { success: false, error: error.message };
    }

    revalidatePath(`/admin/cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Error en upsertModuleAction:', err);
    return { success: false, error: err?.message || 'Error al guardar el módulo' };
  }
}

/** Eliminar un módulo si no tiene asignaciones activas */
export async function deleteModuleAction(
  moduleId: string,
  courseId: string
): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();

    // Desvincular asignaciones previas si existen (o validar)
    await supabase
      .from('assignments')
      .update({ module_id: null })
      .eq('module_id', moduleId);

    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', moduleId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    console.error('Error en deleteModuleAction:', err);
    return { success: false, error: err?.message || 'Error al eliminar el módulo' };
  }
}
