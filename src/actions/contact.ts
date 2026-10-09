"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitContactForm(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Extract data
    const full_name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const data_policy = formData.get("data_policy");
    
    const data_consent = data_policy === "on" || data_policy === "true";

    // Validate required fields
    if (!full_name || !phone || !email || !subject || !message || !data_consent) {
      return { success: false, error: "Todos los campos obligatorios deben ser completados y debes aceptar la política de datos." };
    }

    // Insert into Supabase
    const { error } = await supabase
      .from("contact_messages")
      .insert([
        {
          full_name,
          phone,
          email,
          subject,
          message,
          data_consent,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Error inserting contact message:", error);
      return { success: false, error: "Hubo un error al enviar tu mensaje. Por favor intenta de nuevo más tarde." };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in contact submission:", err);
    return { success: false, error: "Hubo un error inesperado. Por favor intenta de nuevo más tarde." };
  }
}
