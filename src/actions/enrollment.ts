"use server";

import { createClient } from "@/lib/supabase/server";

// Mapa de compatibilidad con IDs legacy usados en interfaces estáticas
const LEGACY_COURSE_MAP: Record<string, string> = {
  c1: "Pintura en cerámica",
  c2: "Pintura al óleo",
  c3: "Decoupage y manualidades",
  c4: "Diseño de cejas",
  c5: "Lifting de pestañas",
  c6: "Trenzas con Kanekalon",
  c7: "Iniciación musical",
  c8: "Electricidad",
};

/**
 * Resuelve el UUID real de la tabla `courses` a partir de un UUID,
 * código legacy (c1..c8) o texto descriptivo del curso (ej. "Pintura en Cerámica").
 */
async function resolveCourseId(supabase: any, rawCourse: string): Promise<string | null> {
  if (!rawCourse) return null;

  const trimmed = rawCourse.trim();

  // 1. Si ya es un UUID válido, verificar si existe en courses
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
  if (isUuid) {
    const { data } = await supabase
      .from("courses")
      .select("id")
      .eq("id", trimmed)
      .maybeSingle();

    if (data?.id) return data.id;
  }

  // 2. Si coincide con una clave legacy (c1, c2, etc.)
  const legacyTitle = LEGACY_COURSE_MAP[trimmed.toLowerCase()];
  const searchTerm = legacyTitle || trimmed;

  // 3. Buscar por coincidencia flexible en el título
  const cleanSearch = searchTerm.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]/g, "").trim();
  if (cleanSearch) {
    const { data: matchedCourses } = await supabase
      .from("courses")
      .select("id, title")
      .ilike("title", `%${cleanSearch}%`)
      .limit(1);

    if (matchedCourses && matchedCourses.length > 0) {
      return matchedCourses[0].id;
    }
  }

  // 4. Buscar por slug aproximado
  const slug = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (slug) {
    const { data: matchedSlug } = await supabase
      .from("courses")
      .select("id")
      .ilike("slug", `%${slug}%`)
      .limit(1);

    if (matchedSlug && matchedSlug.length > 0) {
      return matchedSlug[0].id;
    }
  }

  return null;
}

/**
 * Normaliza el tipo de documento según la restricción CHECK de PostgreSQL:
 * check (document_type in ('CC','TI','CE','PA','RC','Otro'))
 */
function normalizeDocumentType(rawType: string): string {
  const clean = (rawType || "").trim().toUpperCase();
  if (["CC", "TI", "CE", "PA", "RC", "OTRO"].includes(clean)) {
    return clean === "OTRO" ? "Otro" : clean;
  }
  if (clean.includes("CIUDADAN") || clean.includes("CÉDULA") || clean.includes("CEDULA")) return "CC";
  if (clean.includes("IDENTIDAD") || clean.includes("TARJETA")) return "TI";
  if (clean.includes("EXTRANJ")) return "CE";
  if (clean.includes("PASAPORTE")) return "PA";
  if (clean.includes("REGISTRO")) return "RC";
  return "CC";
}

export async function submitEnrollment(formData: FormData) {
  try {
    const supabase = await createClient();

    // 1. Extraer identificador de curso con compatibilidad de nombres de campos
    const rawCourse =
      formData.get("course_id")?.toString().trim() ||
      formData.get("program_of_interest")?.toString().trim() ||
      formData.get("course")?.toString().trim() ||
      formData.get("taller")?.toString().trim() ||
      "";

    // 2. Extraer datos personales del postulante
    const full_name =
      formData.get("full_name")?.toString().trim() ||
      formData.get("applicant_name")?.toString().trim() ||
      formData.get("name")?.toString().trim() ||
      "";

    const rawDocType =
      formData.get("document_type")?.toString().trim() ||
      formData.get("doc_type")?.toString().trim() ||
      "CC";
    const document_type = normalizeDocumentType(rawDocType);

    const document_number =
      formData.get("document_number")?.toString().trim() ||
      formData.get("doc_number")?.toString().trim() ||
      formData.get("document_id")?.toString().trim() ||
      "";

    const rawBirthDate =
      formData.get("birth_date")?.toString().trim() ||
      formData.get("dob")?.toString().trim() ||
      formData.get("fecha_nacimiento")?.toString().trim() ||
      "";
    
    let birth_date: string | null = null;
    if (rawBirthDate) {
      const parsedDate = new Date(rawBirthDate);
      if (!isNaN(parsedDate.getTime())) {
        if (parsedDate > new Date()) {
          return {
            success: false,
            error: "La fecha de nacimiento no puede ser una fecha futura.",
          };
        }
        birth_date = parsedDate.toISOString().split("T")[0];
      }
    }

    const phone =
      formData.get("phone")?.toString().trim() ||
      formData.get("whatsapp")?.toString().trim() ||
      formData.get("celular")?.toString().trim() ||
      "";

    const email =
      formData.get("email")?.toString().trim().toLowerCase() ||
      formData.get("correo")?.toString().trim().toLowerCase() ||
      "";

    const rawLocality =
      formData.get("locality")?.toString().trim() ||
      formData.get("neighborhood")?.toString().trim() ||
      formData.get("location")?.toString().trim() ||
      formData.get("barrio")?.toString().trim() ||
      "";
    const locality = rawLocality || "Bogotá";

    const guardian_name =
      formData.get("guardian_name")?.toString().trim() ||
      formData.get("guardian")?.toString().trim() ||
      formData.get("acudiente")?.toString().trim() ||
      null;

    const dataPolicyField =
      formData.get("accepted_data_policy") ||
      formData.get("data_consent") ||
      formData.get("data_policy");
    const accepted_data_policy =
      dataPolicyField === "on" ||
      dataPolicyField === "true" ||
      dataPolicyField?.toString() === "true";

    // 3. Validar campos obligatorios
    if (!rawCourse) {
      return { success: false, error: "Debes seleccionar un curso de interés." };
    }
    if (!full_name) {
      return { success: false, error: "El nombre completo es obligatorio." };
    }
    if (!document_number) {
      return { success: false, error: "El número de documento es obligatorio." };
    }
    if (!phone) {
      return { success: false, error: "El número de teléfono o WhatsApp es obligatorio." };
    }
    if (!email) {
      return { success: false, error: "El correo electrónico es obligatorio." };
    }
    if (!accepted_data_policy) {
      return {
        success: false,
        error: "Debes autorizar el tratamiento de datos personales de acuerdo con la Ley 1581 de 2012.",
      };
    }

    // 4. Resolver el UUID del curso en Supabase
    const course_id = await resolveCourseId(supabase, rawCourse);
    if (!course_id) {
      return {
        success: false,
        error: `No se encontró un curso válido en la base de datos para: "${rawCourse}". Por favor selecciona un curso de la lista.`,
      };
    }

    // 5. Vincular usuario si existe sesión activa en Supabase
    let user_id: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        user_id = user.id;
      }
    } catch {
      // Ignorar si no hay sesión autenticada
    }

    // 6. Construir payload con las columnas exactas de la tabla 'course_enrollments'
    const insertPayload: Record<string, any> = {
      course_id,
      full_name,
      document_type,
      document_number,
      phone,
      email,
      locality,
      accepted_data_policy,
      status: "pendiente",
      cupo_type: "Cupo Regular",
      created_at: new Date().toISOString(),
    };

    if (user_id) {
      insertPayload.user_id = user_id;
    }
    if (birth_date) {
      insertPayload.birth_date = birth_date;
    }
    if (guardian_name) {
      insertPayload.guardian_name = guardian_name;
    }

    // 7. Insertar en la tabla oficial 'course_enrollments'
    // Si existe SUPABASE_SERVICE_ROLE_KEY en el entorno, usar cliente con privilegios de servicio para evitar bloqueos por RLS
    let insertClient = supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createClient: createSupabaseJsClient } = await import("@supabase/supabase-js");
        insertClient = createSupabaseJsClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { persistSession: false } }
        );
      } catch (clientErr) {
        console.warn("No se pudo inicializar cliente de servicio de Supabase:", clientErr);
      }
    }

    const { error } = await insertClient
      .from("course_enrollments")
      .insert([insertPayload]);

    if (error) {
      console.error("Error al insertar inscripción en Supabase:", error);

      // Manejo y diagnóstico detallado según el código de PostgreSQL / PostgREST
      if (error.code === "42501") {
        return {
          success: false,
          error: `Error de permisos RLS en Supabase (42501): ${error.message}. Causa: La tabla 'course_enrollments' no permite inserción pública sin autenticación previa. Para solucionarlo, ejecuta la migración 'supabase/migrations/20261021_enrollments_insert_policy.sql' en Supabase SQL Editor.`,
        };
      }

      if (error.code === "23505") {
        return {
          success: false,
          error: `Ya existe una inscripción registrada con este documento o correo para este curso. (Detalle Supabase: ${error.message})`,
        };
      }

      // EXPOSICIÓN DEL ERROR REAL EN EL FRONTEND:
      return {
        success: false,
        error: `Error en Supabase: ${error.message}${error.details ? ` (${error.details})` : ""}${error.hint ? ` - ${error.hint}` : ""}`,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in enrollment submission:", err);
    return {
      success: false,
      error: err?.message
        ? `Error inesperado: ${err.message}`
        : "Hubo un error inesperado al procesar tu inscripción. Intenta de nuevo más tarde.",
    };
  }
}

// Alias de compatibilidad
export const submitEnrollmentForm = submitEnrollment;
