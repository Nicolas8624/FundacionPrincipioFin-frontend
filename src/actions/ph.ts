"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitPhRequest(formData: FormData) {
  try {
    const supabase = await createClient();

    // 1. Extraer datos con soporte para múltiples variantes de nombres de campos
    const administrator_name =
      formData.get("administrator_name")?.toString().trim() ||
      formData.get("admin_name")?.toString().trim() ||
      formData.get("applicant_name")?.toString().trim() ||
      formData.get("name")?.toString().trim() ||
      "";

    const complex_name =
      formData.get("complex_name")?.toString().trim() ||
      formData.get("residence_name")?.toString().trim() ||
      formData.get("ph_name")?.toString().trim() ||
      "";

    const email = formData.get("email")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";

    const rawLocality =
      formData.get("locality")?.toString().trim() ||
      formData.get("location")?.toString().trim() ||
      formData.get("neighborhood")?.toString().trim() ||
      "";

    const rawAddress =
      formData.get("address")?.toString().trim() ||
      formData.get("location")?.toString().trim() ||
      formData.get("neighborhood")?.toString().trim() ||
      "";

    const locality = rawLocality || rawAddress || "Bogotá";
    const address = rawAddress || rawLocality || "Dirección no especificada";

    const message =
      formData.get("message")?.toString().trim() ||
      formData.get("additional_info")?.toString().trim() ||
      "";

    const raw_role =
      formData.get("role_title")?.toString().trim() ||
      formData.get("role")?.toString().trim() ||
      "";

    // Normalizar para cumplir con la restricción CHECK ('Administrador', 'Miembro del consejo', 'Otro')
    let role_title = "Administrador";
    const lowerRole = raw_role.toLowerCase();

    if (lowerRole.includes("consej")) {
      role_title = "Miembro del consejo";
    } else if (lowerRole === "otro") {
      role_title = "Otro";
    } else {
      role_title = "Administrador";
    }

    const rawResidents =
      formData.get("residents_count") ||
      formData.get("approximate_residents");
    const residents_count = rawResidents
      ? parseInt(rawResidents.toString(), 10) || null
      : null;

    const dataPolicyField =
      formData.get("accepted_data_policy") ||
      formData.get("data_consent") ||
      formData.get("data_policy");
    const accepted_data_policy =
      dataPolicyField === "on" ||
      dataPolicyField === "true";

    // 2. Validar campos obligatorios NOT NULL en Supabase
    if (
      !complex_name ||
      !administrator_name ||
      !email ||
      !phone ||
      !locality ||
      !address ||
      !message ||
      !accepted_data_policy
    ) {
      return {
        success: false,
        error:
          "Todos los campos obligatorios deben ser completados y debes aceptar la política de tratamiento de datos.",
      };
    }

    // 3. Vincular user_id si el usuario está autenticado en Supabase
    let user_id: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        user_id = user.id;
      }
    } catch {
      // Ignorar si no hay sesión activa
    }

    // 4. Inserción con columnas exactas de la tabla 'ph_requests'
    const insertPayload: Record<string, any> = {
      administrator_name,
      role_title,
      complex_name,
      address,
      locality,
      phone,
      email,
      message,
      accepted_data_policy,
      status: "pendiente",
      created_at: new Date().toISOString(),
    };

    if (user_id) {
      insertPayload.user_id = user_id;
    }
    if (residents_count !== null) {
      insertPayload.residents_count = residents_count;
    }

    let { error } = await supabase
      .from("ph_requests")
      .insert([insertPayload]);

    // Si por alguna razón la restricción de role_title persiste, reintentar omitiendo role_title
    if (error && (error.message.includes("ph_requests_role_title_check") || error.message.includes("role_title"))) {
      console.warn("Reintentando inserción en ph_requests sin role_title...");
      const payloadWithoutRole = { ...insertPayload };
      delete payloadWithoutRole.role_title;
      const retryResult = await supabase
        .from("ph_requests")
        .insert([payloadWithoutRole]);
      error = retryResult.error;
    }

    if (error) {
      console.error("Error al insertar solicitud PH en Supabase:", error);
      return {
        success: false,
        error: `Error en Supabase: ${error.message}`,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in PH request submission:", err);
    return {
      success: false,
      error: err?.message
        ? `Error inesperado: ${err.message}`
        : "Hubo un error inesperado al procesar tu solicitud. Por favor intenta de nuevo más tarde.",
    };
  }
}

// Alias para compatibilidad de importaciones
export const submitPhForm = submitPhRequest;
