# Estrategia de Inicialización de Datos (Data Seed)

Al utilizar un CMS dinámico (`site_content`, `site_sections`, `site_settings`) en Supabase, el código Frontend asume que estos datos existen para renderizar la página. Si la base de datos está vacía, el sitio se verá en blanco o fallará.

Para evitar esto y preparar el terreno antes de la entrega final a la clienta, debemos seguir esta estrategia de "Seeding".

## 1. Mapeo de los Diseños a la Base de Datos

Las pantallas en `.docs/designs/Escritorio/` proveen el contenido visual inicial. Ese contenido debe inyectarse directamente en Supabase.

### Ejemplos de mapeo a `site_sections`:

- **Hero Banner (`Home.png`)**
  - `section_key`: `home_hero`
  - `title`: `INSCRÍBETE A UN TALLER`
  - `subtitle`: `Abre las puertas al aprendizaje, el arte y la reintegración digna...`
  - `primary_cta_label`: `INSCRIPCIONES ABIERTAS`
  - `image_url`: *(URL de la imagen de las estrellas del bucket de Storage)*

- **Beneficios Copropiedad (`Propiedad.png`)**
  - `section_key`: `ph_benefits`
  - `title`: `BENEFICIOS PARA LA COPROPIEDAD`
  - *`site_section_items` (Elementos de esta sección):*
    - "Integración intergeneracional" (con su descripción y el ícono respectivo).
    - "Activación del salón comunal".
    - "Formación para el empleo", etc.

## 2. Estrategia de Ejecución (SQL Seed)

En lugar de que el Dev 1 llene esto a mano en la interfaz gráfica de Supabase o creando formularios CMS inmensos desde el día 1, el proceso más profesional es crear un script SQL llamado `seed.sql`.

Este script se ejecuta en el **SQL Editor de Supabase** justo después de ejecutar el esquema completo.

### Estructura sugerida para `seed.sql`:

```sql
-- Limpiar secciones previas si se vuelve a correr
DELETE FROM public.site_sections;

-- 1. Insertar el Hero del Home
INSERT INTO public.site_sections (page, section_key, title, subtitle, primary_cta_label)
VALUES (
  'home', 
  'home_hero', 
  'INSCRÍBETE A UN TALLER', 
  'Abre las puertas al aprendizaje, el arte y la reintegración digna dentro de nuestros programas comunitarios de transformación social.', 
  'INSCRIPCIONES ABIERTAS'
);

-- 2. Insertar Configuración Global (Redes, telefonos, emails)
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('global_contact', '{"whatsapp": "300 909 6862", "email": "f.principioyfin@gmail.com", "address": "Cra. 73 H Bis # 76 – 65 Sur, Bogotá D.C."}'::jsonb, 'Datos de contacto globales'),
  ('social_links', '{"facebook": "https://facebook.com/fundacion", "instagram": "https://instagram.com/f.principioyfin"}'::jsonb, 'Redes sociales');
```

## 3. Flujo de Trabajo y Entrega

1. **Dev 1** crea y ejecuta el script `seed.sql` analizando palabra por palabra las imágenes del diseño (`Home.png`, `QuienesSomos.png`, etc.).
2. **Dev 1** sube manualmente las imágenes de los mockups (fondo estelar, imágenes de talleres) al bucket público `site-assets` de Supabase Storage. Toma las URLs resultantes y las añade al `seed.sql`.
3. **Dev 2** maqueta el Frontend consumiendo estos datos mediante `cms.service.ts`.
4. Cuando el cliente recibe el proyecto y lo revisa, ingresa con su rol de **Admin**, navega a `/admin/cms`, y puede modificar esos textos e imágenes (lo que hará un simple UPDATE sobre estas filas) sin requerir despliegues adicionales.
