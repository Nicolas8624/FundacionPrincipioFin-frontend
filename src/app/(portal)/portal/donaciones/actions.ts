'use server';

import { createServerClient } from '@/services/supabase/server';
import { revalidatePath } from 'next/cache';

export interface SubmitDonationInput {
  donor_name: string;
  donation_type: string;
  amount_cop?: number | null;
  email: string;
  phone: string;
  message: string;
  accepted_data_policy: boolean;
}

export async function submitPortalDonationAction(payload: SubmitDonationInput) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const insertData: any = {
      donor_name: payload.donor_name.trim(),
      donation_type: payload.donation_type,
      amount_cop: payload.amount_cop || null,
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      message: payload.message.trim(),
      accepted_data_policy: payload.accepted_data_policy,
      status: 'nueva',
      user_id: user ? user.id : null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('donation_requests')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error al insertar donación en Supabase:', error);
      return { 
        success: false, 
        error: error.message || 'Error al registrar la solicitud de donación en base de datos.' 
      };
    }

    revalidatePath('/portal/donaciones');
    revalidatePath('/admin/donaciones');

    return { 
      success: true, 
      data 
    };
  } catch (err: any) {
    console.error('Error inesperado en submitPortalDonationAction:', err);
    return { 
      success: false, 
      error: err?.message || 'Error inesperado al enviar la donación.' 
    };
  }
}
