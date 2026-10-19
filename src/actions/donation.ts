"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitDonation(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Extraer valores del FormData
    const donor_name = formData.get("name")?.toString().trim() || formData.get("full_name")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const rawDonationType = formData.get("donation_type")?.toString().trim() || formData.get("type")?.toString().trim() || "";
    const details = formData.get("amount_or_description")?.toString().trim() || formData.get("message")?.toString().trim() || formData.get("details")?.toString().trim() || "";
    const accepted_data_policy = formData.get("data_consent") === "true" || formData.get("data_consent") === "on" || formData.get("data_policy") === "true" || formData.get("data_policy") === "on";

    if (!donor_name || !email || !phone || !rawDonationType || !details || !accepted_data_policy) {
      return { 
        success: false, 
        error: "Todos los campos obligatorios deben ser completados y debes aceptar la política de datos." 
      };
    }

    // Normalizar donation_type al enum de PostgreSQL ('economico', 'insumos', 'equipos', 'patrocinio')
    const typeMap: Record<string, string> = {
      economica: "economico",
      economico: "economico",
      insumos: "insumos",
      equipos: "equipos",
      alianza: "patrocinio",
      patrocinio: "patrocinio",
      otro: "patrocinio",
    };
    const donation_type = typeMap[rawDonationType.toLowerCase()] || rawDonationType;

    // Insertar con el esquema exacto de la BD real (tabla donation_requests)
    const { error } = await supabase
      .from("donation_requests")
      .insert([
        {
          donor_name,
          email: email.toLowerCase(),
          phone,
          donation_type,
          amount_cop: !isNaN(parseFloat(details)) ? parseFloat(details) : null,
          message: details,
          accepted_data_policy,
          status: 'nueva',
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Error al insertar donación en Supabase:", error);
      return { success: false, error: `Error en Supabase: ${error.message}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in donation submission:", err);
    return { 
      success: false, 
      error: err?.message ? `Error inesperado: ${err.message}` : "Hubo un error inesperado. Intenta de nuevo más tarde." 
    };
  }
}
