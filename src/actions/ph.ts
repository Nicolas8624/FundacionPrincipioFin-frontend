"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitPhRequest(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Extract data
    const complex_name = formData.get("complex_name") as string;
    const applicant_name = formData.get("applicant_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const location = formData.get("location") as string;
    const message = formData.get("message") as string;
    const data_policy = formData.get("data_consent");
    
    const data_consent = data_policy === "on" || data_policy === "true";

    // Validate required fields
    if (!complex_name || !applicant_name || !email || !phone || !location || !message || !data_consent) {
      return { success: false, error: "Todos los campos obligatorios deben ser completados y debes aceptar la política de datos." };
    }

    // Insert into Supabase
    const { error } = await supabase
      .from("ph_requests")
      .insert([
        {
          complex_name,
          applicant_name,
          email,
          phone,
          location,
          message,
          data_consent,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Error inserting PH request:", error);
      return { success: false, error: "Hubo un error al enviar tu solicitud. Por favor intenta de nuevo más tarde." };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in PH request submission:", err);
    return { success: false, error: "Hubo un error inesperado. Por favor intenta de nuevo más tarde." };
  }
}
