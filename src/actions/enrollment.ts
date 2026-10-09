"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitEnrollment(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Extract data
    const program_of_interest = formData.get("program_of_interest") as string;
    const full_name = formData.get("full_name") as string;
    const doc_type = formData.get("doc_type") as string;
    const doc_number = formData.get("doc_number") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const neighborhood = formData.get("neighborhood") as string;
    const data_policy = formData.get("data_consent");
    
    const data_consent = data_policy === "on" || data_policy === "true";
    const document_id = `${doc_type} ${doc_number}`;

    if (!program_of_interest || !full_name || !doc_number || !phone || !email || !neighborhood || !data_consent) {
      return { success: false, error: "Todos los campos obligatorios deben ser completados y debes aceptar la política de datos." };
    }

    const { error } = await supabase
      .from("enrollments")
      .insert([
        {
          full_name,
          document_id,
          phone,
          email,
          program_of_interest,
          neighborhood,
          data_consent,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Error inserting enrollment:", error);
      return { success: false, error: "Hubo un error al procesar tu inscripción. Intenta de nuevo más tarde." };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in enrollment submission:", err);
    return { success: false, error: "Hubo un error inesperado. Intenta de nuevo más tarde." };
  }
}
