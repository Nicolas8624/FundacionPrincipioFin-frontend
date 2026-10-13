-- TABLA DE MENSAJES DE CONTACTO
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insercion publica de mensajes de contacto"
ON public.contact_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir lectura/gestion a usuarios autenticados"
ON public.contact_messages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- TABLA DE SOLICITUDES DE DONACIÓN / PATROCINIO
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_name TEXT NOT NULL,
    donation_type TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insercion publica de donaciones"
ON public.donations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir lectura/gestion a usuarios autenticados"
ON public.donations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
