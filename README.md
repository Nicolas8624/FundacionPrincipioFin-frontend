# Fundación Principio & Fin - Sitio Web Institucional

Plataforma oficial para la Fundación Principio & Fin, desarrollada con Next.js, Tailwind CSS y Supabase.

## Requisitos Previos

- **Node.js** (v18.17 o superior recomendado)
- **npm**, **yarn** o **pnpm**
- Proyecto en **Supabase** configurado con el esquema SQL provisto en `.docs/backend/schema_supabase_completo.sql`.

## 1. Configuración Local

1. Clona el repositorio y navega al directorio:
   ```bash
   git clone <url-del-repo>
   cd FundacionPrincipioFin-frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env.local` en la raíz del proyecto. **Nunca hagas commit de este archivo**.
   ```env
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
   ```

## 2. Desarrollo

Inicia el servidor de desarrollo local:

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:3000`.

## 3. Despliegue en Producción (Vercel)

El proyecto está optimizado para desplegarse en Vercel.

1. Haz push de tu código a la rama `main`.
2. Ve a [Vercel](https://vercel.com/) y crea un nuevo proyecto apuntando a tu repositorio.
3. En la configuración del proyecto en Vercel, añade las **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Haz clic en "Deploy". Vercel instalará las dependencias y construirá (`npm run build`) el proyecto automáticamente.

## 4. Notas para los Desarrolladores (Dev 1 y Dev 2)

- **Diseño Visual:** Todo el sistema de diseño (tipografía, espacios, reglas de colores y estética) está documentado en `.docs/designs/DESIGN.md`. Sigue estas guías rigurosamente para los componentes base y layouts.
- **CMS y Contenido:** Para cambiar imágenes, tarjetas y textos del index público, debes ingresar con el rol `admin` al panel `/admin/cms`. El contenido de UI no debe estar "quemado" (hardcoded) en los archivos `.tsx` de Next.js, sino consumirse a través de `site_sections`.
- **Estructura DB:** Revisa `.docs/planning/PLANEACION_Y_ROLES.md` y `.docs/backend/SERVICIOS_API.md` para entender el modelo y consumo de Supabase.
