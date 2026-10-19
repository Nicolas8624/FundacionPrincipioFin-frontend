'use server';

import { createServerClient } from '@/services/supabase/server';
import { revalidatePath } from 'next/cache';

export interface SubmitAssignmentResult {
  success: boolean;
  error?: string;
  submissionId?: string;
  status?: string;
  fileUrl?: string | null;
}

function sanitizeUuid(val: any): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export async function submitAssignmentAction(
  formData: FormData
): Promise<SubmitAssignmentResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (!user || authErr) {
      return {
        success: false,
        error: 'Tu sesión no está activa o expiró. Por favor inicia sesión nuevamente.',
      };
    }

    const rawAssignmentId = formData.get('assignmentId') as string | null;
    const assignmentId = sanitizeUuid(rawAssignmentId);
    if (!assignmentId) {
      return {
        success: false,
        error: 'Identificador de actividad no válido o no proporcionado.',
      };
    }

    const rawCourseId = formData.get('courseId') as string | null;
    const courseId = sanitizeUuid(rawCourseId);
    const status = (formData.get('status') as string) || 'entregada';
    const textContent = (formData.get('textContent') as string) || '';
    const projectTitle = (formData.get('projectTitle') as string) || null;
    const rawEnrollmentId = formData.get('enrollmentId') as string | null;
    let finalEnrollmentId = sanitizeUuid(rawEnrollmentId);
    const file = formData.get('file') as File | null;
    const existingFileName = formData.get('existingFileName') as string | null;

    // 1. Verificar si ya existe una entrega previa para esta asignación y usuario
    const { data: existingSub, error: fetchErr } = await supabase
      .from('submissions')
      .select('id, user_id, status, score, feedback, project_title, text_content')
      .eq('assignment_id', assignmentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchErr) {
      console.error('Error consultando entrega previa:', fetchErr);
    }

    // Resolver matrícula si no se proporcionó o vino vacía
    if (!finalEnrollmentId && courseId) {
      const { data: enroll } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('course_id', courseId)
        .or(`user_id.eq.${user.id},email.ilike.${user.email || ''}`)
        .maybeSingle();
      if (enroll) {
        finalEnrollmentId = sanitizeUuid(enroll.id);
      }
    }

    let submissionId: string;

    if (existingSub) {
      // Actualizar entrega existente
      const updatePayload: Record<string, any> = {
        text_content: textContent.trim(),
        updated_at: new Date().toISOString(),
      };

      // Si la actividad ya estaba calificada por el docente, mantenemos el estado calificada
      if (existingSub.status === 'calificada') {
        updatePayload.status = 'calificada';
      } else {
        updatePayload.status = status;
        if (status === 'entregada') {
          updatePayload.submitted_at = new Date().toISOString();
        }
      }

      if (projectTitle && projectTitle.trim()) {
        updatePayload.project_title = projectTitle.trim();
      }

      if (finalEnrollmentId) {
        updatePayload.enrollment_id = finalEnrollmentId;
      }

      const { data: updated, error: updateErr } = await supabase
        .from('submissions')
        .update(updatePayload)
        .eq('id', existingSub.id)
        .eq('user_id', user.id)
        .select('id, status')
        .maybeSingle();

      if (updateErr) {
        console.error('Error al actualizar entrega:', updateErr);
        return {
          success: false,
          error: `Error al actualizar la entrega: ${updateErr.message}`,
        };
      }

      submissionId = updated?.id || existingSub.id;
    } else {
      // Crear nueva entrega
      const insertPayload: Record<string, any> = {
        assignment_id: assignmentId,
        user_id: user.id,
        enrollment_id: finalEnrollmentId || null,
        text_content: textContent.trim(),
        status: status,
        project_title: projectTitle?.trim() || 'Entrega de Actividad',
        submitted_at: status === 'entregada' ? new Date().toISOString() : null,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('submissions')
        .insert(insertPayload)
        .select('id, status')
        .maybeSingle();

      if (insertErr) {
        console.error('Error al insertar entrega:', insertErr);
        return {
          success: false,
          error: `Error al registrar la entrega: ${insertErr.message}`,
        };
      }

      submissionId = inserted?.id!;
    }

    // 2. Procesar archivo si se adjuntó uno nuevo
    let publicFileUrl: string | null = null;
    if (file && file.size > 0 && typeof file.name === 'string' && file.name.trim() !== '') {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${user.id}/${assignmentId}/${Date.now()}_${sanitizedName}`;

      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadErr } = await supabase.storage
          .from('submissions')
          .upload(storagePath, fileBuffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          });

        if (uploadErr) {
          console.warn('Aviso en subida a storage (se continuará):', uploadErr.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('submissions')
          .getPublicUrl(storagePath);
        publicFileUrl = publicUrlData?.publicUrl || null;

        await supabase.from('submission_files').insert({
          submission_id: submissionId,
          storage_path: storagePath,
          file_name: file.name,
          mime_type: file.type || 'application/octet-stream',
          size_bytes: file.size,
          url: publicFileUrl,
        });
      } catch (fileProcErr: any) {
        console.warn('Error al procesar archivo adjunto:', fileProcErr?.message);
      }
    }

    // 3. Revalidar rutas pertinentes para actualizar la UI en vivo
    if (courseId) {
      revalidatePath(`/portal/cursos/${courseId}`);
      revalidatePath(`/portal/cursos/${courseId}/actividad/${assignmentId}`);
      revalidatePath(`/admin/cursos/${courseId}`);
    }
    revalidatePath(`/portal/actividad/${assignmentId}`);
    revalidatePath('/portal/cursos');

    return {
      success: true,
      submissionId,
      status,
      fileUrl: publicFileUrl,
    };
  } catch (err: any) {
    console.error('Error no controlado en submitAssignmentAction:', err);
    return {
      success: false,
      error: err?.message || 'Error inesperado al guardar la entrega.',
    };
  }
}
