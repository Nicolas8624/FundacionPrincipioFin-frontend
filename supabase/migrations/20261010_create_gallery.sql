-- Crear tabla gallery_items
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    section TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para la tabla
CREATE POLICY "Permitir lectura publica de galeria"
ON public.gallery_items FOR SELECT USING (true);

CREATE POLICY "Permitir CRUD a usuarios autenticados"
ON public.gallery_items FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Crear bucket de Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Lectura publica del bucket gallery"
ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Carga de archivos en gallery para autenticados"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Eliminacion de archivos en gallery para autenticados"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery');
