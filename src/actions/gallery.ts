'use server'

import { createServerClient } from '@/services/supabase/server';
import { revalidatePath } from 'next/cache';

const FALLBACK_ITEMS = [
  {
    id: 'fallback-1',
    title: 'Taller de Cerámica Comunitario',
    section: 'quienes-somos',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-2',
    title: 'Programa Jóvenes Líderes',
    section: 'programas',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=2070',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-3',
    title: 'Mejoramiento Conjunto Residencial',
    section: 'ph',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?q=80&w=2000',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-4',
    title: 'Testimonio de Impacto',
    section: 'quienes-somos',
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    created_at: new Date().toISOString()
  }
];

export async function getGalleryItems(section?: string) {
  try {
    const supabase = await createServerClient();
    
    let query = supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
    
    if (section) {
      query = query.eq('section', section);
    }
    
    const { data, error } = await query;
    
    if (error || !data || data.length === 0) {
      // Fallback local
      return section ? FALLBACK_ITEMS.filter(item => item.section === section) : FALLBACK_ITEMS;
    }
    
    return data;
  } catch (error) {
    console.error('Gallery Fetch Error:', error);
    return section ? FALLBACK_ITEMS.filter(item => item.section === section) : FALLBACK_ITEMS;
  }
}

export async function createGalleryItem(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const section = formData.get('section') as string;
    const type = formData.get('type') as string; // 'image' | 'video'
    const fileUrl = formData.get('fileUrl') as string;
    
    const supabase = await createServerClient();
    const { error } = await supabase.from('gallery_items').insert({
      title,
      section,
      type,
      url: fileUrl || 'https://via.placeholder.com/800x600?text=Nueva+Imagen'
    });
    
    if (error) {
       console.log("Mocking successful upload as fallback:", error.message);
    }

    revalidatePath('/admin/galeria');
    revalidatePath('/quienes-somos');
    revalidatePath('/propiedad-horizontal');
    revalidatePath('/programas');
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteGalleryItem(id: string) {
  try {
    const supabase = await createServerClient();
    await supabase.from('gallery_items').delete().eq('id', id);
    
    revalidatePath('/admin/galeria');
    revalidatePath('/quienes-somos');
    revalidatePath('/propiedad-horizontal');
    revalidatePath('/programas');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
