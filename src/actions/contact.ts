"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitContactForm(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Extraer valores del FormData
    const name = formData.get("name")?.toString().trim() || formData.get("full_name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const rawSubject = formData.get("subject")?.toString().trim() || "";
    let message = formData.get("message")?.toString().trim() || "";
    const data_policy = formData.get("data_policy") || formData.get("data_consent");
    
    const accepted_data_policy = data_policy === "on" || data_policy === "true";

    // Validar campos obligatorios
    if (!name || !email || !message || !accepted_data_policy) {
      return { 
        success: false, 
        error: "Todos los campos obligatorios deben ser completados y debes aceptar la política de datos." 
      };
    }

    // Asegurar que subject satisfaga la restricción check de contact_messages:
    // check (subject in ('Inscripción a cursos', 'Propiedad horizontal', 'Donaciones y alianzas', 'Otro'))
    const validSubjects = [
      "Inscripción a cursos",
      "Propiedad horizontal",
      "Donaciones y alianzas",
      "Otro",
    ];
    let subject = "Otro";
    if (validSubjects.includes(rawSubject)) {
      subject = rawSubject;
    } else if (/inscrip/i.test(rawSubject) || /curso/i.test(rawSubject)) {
      subject = "Inscripción a cursos";
    } else if (/propiedad/i.test(rawSubject) || /horizontal/i.test(rawSubject) || /\bph\b/i.test(rawSubject)) {
      subject = "Propiedad horizontal";
    } else if (/donaci/i.test(rawSubject) || /alianza/i.test(rawSubject)) {
      subject = "Donaciones y alianzas";
    } else {
      subject = "Otro";
    }

    // Conservar el asunto personalizado original si no coincide exactamente con el enum
    if (rawSubject && rawSubject !== subject) {
      message = `[Asunto: ${rawSubject}]\n${message}`;
    }

    // Insertar en contact_messages con el esquema exacto de Supabase (name, accepted_data_policy)
    const { error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name,
          phone,
          email,
          subject,
          message,
          accepted_data_policy,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Error al insertar mensaje de contacto en Supabase:", error);
      return { success: false, error: `Error en Supabase: ${error.message}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in contact submission:", err);
    return { 
      success: false, 
      error: err?.message ? `Error inesperado: ${err.message}` : "Hubo un error inesperado. Por favor intenta de nuevo más tarde." 
    };
  }
}
