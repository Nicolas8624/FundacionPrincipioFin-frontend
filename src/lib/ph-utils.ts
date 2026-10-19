/**
 * Utilidades para el manejo de radicados y documentos adjuntos de Propiedad Horizontal (PH)
 */

export interface ActaInfo {
  fileName: string;
  fileUrl: string;
}

/**
 * Genera el código de radicado human-readable para una solicitud PH.
 * Ej: PH-2026-CEBE (PH + Año + primeros 4 caracteres del UUID)
 */
export function getRadicadoCode(req: { id?: string | null; created_at?: string | null }): string {
  const year = req?.created_at ? new Date(req.created_at).getFullYear() : '2026';
  const short = req?.id ? req.id.slice(0, 4).toUpperCase() : '001';
  return `PH-${year}-${short}`;
}

/**
 * Extrae la información del acta adjunta almacenada en las notas de la solicitud.
 */
export function extractActaInfo(notes?: string | null): ActaInfo | null {
  if (!notes) return null;
  const match = notes.match(/\[Acta(?:\s+de\s+Consejo)?\s+Adjunta:\s*([^|]+)\|\s*([^\]]+)\]/i);
  if (match) {
    return {
      fileName: match[1].trim(),
      fileUrl: match[2].trim(),
    };
  }
  return null;
}

/**
 * Retorna las notas internas administrativas sin la etiqueta técnica del archivo adjunto.
 */
export function cleanAdminNotes(notes?: string | null): string {
  if (!notes) return '';
  return notes.replace(/\[Acta(?:\s+de\s+Consejo)?\s+Adjunta:[^\]]+\]/gi, '').trim();
}
