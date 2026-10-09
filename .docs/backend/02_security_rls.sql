-- Habilitar RLS en las tablas
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ph_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE INSERCIÓN PÚBLICA (ANON)
-- Permitir a los visitantes del sitio web enviar formularios (INSERT)

CREATE POLICY "Insert público en contact_messages"
ON contact_messages FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Insert público en ph_requests"
ON ph_requests FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Insert público en enrollments"
ON enrollments FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Insert público en donations"
ON donations FOR INSERT
TO anon
WITH CHECK (true);

-- POLÍTICAS DE LECTURA Y GESTIÓN (AUTHENTICATED)
-- Permitir a los administradores del sistema gestionar toda la información (ALL)

CREATE POLICY "Gestión admin en contact_messages"
ON contact_messages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Gestión admin en ph_requests"
ON ph_requests FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Gestión admin en enrollments"
ON enrollments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Gestión admin en donations"
ON donations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
