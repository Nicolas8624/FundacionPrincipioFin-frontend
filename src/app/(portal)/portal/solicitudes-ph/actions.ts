'use server';

import { createServerClient } from '@/services/supabase/server';
import { revalidatePath } from 'next/cache';

export interface UploadActaResult {
  success: boolean;
  error?: string;
  fileName?: string;
  fileUrl?: string;
  updatedNotes?: string;
}

export async function uploadPhActaAction(formData: FormData): Promise<UploadActaResult> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (!user || authErr) {
      return {
        success: false,
        error: 'Tu sesión no está activa. Inicia sesión nuevamente.',
      };
    }

    const requestId = formData.get('requestId') as string;
    const file = formData.get('file') as File | null;

    if (!requestId) {
      return {
        success: false,
        error: 'ID de solicitud no proporcionado.',
      };
    }

    if (!file || file.size === 0) {
      return {
        success: false,
        error: 'Por favor selecciona un archivo válido para adjuntar.',
      };
    }

    // 1. Obtener la solicitud existente
    const { data: existingReq, error: fetchErr } = await supabase
      .from('ph_requests')
      .select('id, admin_notes, complex_name, status')
      .eq('id', requestId)
      .single();

    if (fetchErr || !existingReq) {
      return {
        success: false,
        error: 'No se encontró la solicitud de propiedad horizontal en el sistema.',
      };
    }

    if (existingReq.status === 'rechazada') {
      return {
        success: false,
        error: 'No es posible adjuntar ni modificar documentos en una solicitud que ha sido rechazada.',
      };
    }

    // 2. Subir archivo a Supabase Storage (usando bucket 'gallery' con acceso público)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `ph-actas/${requestId}/${Date.now()}_${sanitizedName}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadErr } = await supabase.storage
      .from('gallery')
      .upload(storagePath, fileBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadErr) {
      console.error('Error al subir acta a Storage:', uploadErr);
      return {
        success: false,
        error: `Error al subir el archivo: ${uploadErr.message}`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl || '';

    // 3. Registrar el acta en la solicitud
    // Limpiar etiquetas previas de acta si existían para no duplicar
    const prevNotes = existingReq.admin_notes || '';
    const cleanedNotes = prevNotes.replace(/\[Acta(?:\s+de\s+Consejo)?\s+Adjunta:[^\]]+\]/gi, '').trim();

    const actaTag = `[Acta Adjunta: ${file.name} | ${publicUrl}]`;
    const updatedNotes = cleanedNotes ? `${cleanedNotes}\n${actaTag}` : actaTag;

    const { data: updatedRows, error: updateErr } = await supabase
      .from('ph_requests')
      .update({
        admin_notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select('id, admin_notes');

    if (updateErr) {
      console.error('Error al actualizar registro PH con el acta:', updateErr);
      return {
        success: false,
        error: `Error al vincular el acta a la solicitud: ${updateErr.message}`,
      };
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.warn('La actualización de ph_requests no afectó filas (bloqueado por RLS).');
      return {
        success: false,
        error: 'Tu usuario aún no tiene permisos para actualizar esta solicitud en Supabase. Ejecuta la migración de políticas RLS en el editor SQL de Supabase.',
      };
    }

    revalidatePath('/portal/solicitudes-ph');
    revalidatePath('/admin/solicitudes-ph');

    return {
      success: true,
      fileName: file.name,
      fileUrl: publicUrl,
      updatedNotes,
    };
  } catch (err: any) {
    console.error('Error en uploadPhActaAction:', err);
    return {
      success: false,
      error: err?.message || 'Error inesperado al subir el acta.',
    };
  }
}
