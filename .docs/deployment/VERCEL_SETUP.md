# Guía de Despliegue en Vercel

Sigue estos pasos para desplegar el frontend de la Fundación Principio y Fin en producción utilizando Vercel.

## 1. Conectar Repositorio de GitHub
1. Inicia sesión en [Vercel](https://vercel.com/).
2. Haz clic en **Add New...** y selecciona **Project**.
3. Importa tu repositorio de GitHub: `Nicolas8624/FundacionPrincipioFin-frontend`.
4. Vercel detectará automáticamente la configuración.

## 2. Configurar el Proyecto
Asegúrate de que las opciones estén configuradas de la siguiente manera:
- **Framework Preset**: Next.js (Vercel lo detectará automáticamente)
- **Root Directory**: `./` (directorio raíz)

## 3. Configurar Variables de Entorno (Environment Variables)
Despliega la sección de **Environment Variables** y añade las siguientes claves exactamente como aparecen aquí. Obtén los valores desde el panel de tu proyecto en Supabase (Settings > API).

| NAME | VALUE (Ejemplo) |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tu-proyecto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |

*(Nota: Asegúrate de que no queden espacios en blanco al principio ni al final de los valores copiados).*

## 4. Desplegar
Una vez añadidas las variables de entorno, haz clic en el botón **Deploy**.
Vercel ejecutará automáticamente `npm install` y luego `npm run build`. 

Si la base de datos de Supabase está correctamente configurada y las políticas RLS habilitadas, la fase de compilación terminará sin errores de tipos y tu plataforma será publicada globalmente.

¡Listo! Vercel te proporcionará el dominio público del sitio.
