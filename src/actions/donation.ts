"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitDonation(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Extract data
    const full_name = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const donation_type = formData.get("donation_type") as string;
    const amount_or_description = formData.get("amount_or_description") as string;
    const message = formData.get("message") as string || amount_or_description; // fallback if only one is provided
    const data_policy = formData.get("data_consent");
    
    const data_consent = data_policy === "on" || data_policy === "true";

    if (!full_name || !email || !phone || !donation_type || !amount_or_description || !data_consent) {
      return { success: false, error: "Todos los campos obligatorios deben ser completados y debes aceptar la política de datos." };
    }

    const { error } = await supabase
      .from("donation_requests")
      .insert([
        {
          donor_name: full_name,
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          donation_type,
          amount_cop: !isNaN(parseFloat(amount_or_description)) ? parseFloat(amount_or_description) : null,
          message: amount_or_description ? `${amount_or_description} - ${message || ''}`.trim() : message,
          accepted_data_policy: data_consent,
          status: 'nueva',
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error("Error inserting donation:", error);
      return { success: false, error: "Hubo un error al procesar tu donación. Intenta de nuevo más tarde." };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in donation submission:", err);
    return { success: false, error: "Hubo un error inesperado. Intenta de nuevo más tarde." };
  }
}
