# Guía de Despliegue en Vercel + Supabase

## 1. Crear proyecto Supabase

1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto (elige una región cercana a ti)
3. En el SQL Editor, pega y ejecuta el contenido de `supabase-migration.sql`
4. Ve a **Project Settings → API** y copia:
   - `Project URL` → será tu `SUPABASE_URL`
   - `anon public key` → será tu `SUPABASE_ANON_KEY`

## 2. Sembrar datos iniciales

```bash
# Copia .env.example a .env y añade tus credenciales de Supabase
cp .env.example .env
# Edita .env con SUPABASE_URL y SUPABASE_ANON_KEY

# Ejecuta el seed para migrar los datos JSON a Supabase
npx tsx scripts/seed.ts
```

## 3. Desplegar en Vercel

1. Sube el repositorio a GitHub
2. Ve a https://vercel.com/new
3. Importa el repositorio
4. Configura:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Root Directory:** `./`

5. Añade las variables de entorno (Environment Variables):
   - `SUPABASE_URL` ← la URL de tu proyecto Supabase
   - `SUPABASE_ANON_KEY` ← tu anon key de Supabase
   - `ADMIN_PASSWORD` ← la contraseña para el panel admin
   - `NODE_ENV` = `production`

6. Haz clic en **Deploy**

## 4. Notas importantes

- **Las imágenes subidas** desde el panel admin se guardan en `/tmp/uploads` en Vercel (son temporales). Para persistencia real, migra a Supabase Storage (abre un issue si lo necesitas).
- **Los datos** (proyectos, blog, etc.) se guardan permanentemente en Supabase.
- Para acceder al panel admin, haz clic en el candado 🔒 en el footer y usa la contraseña que configuraste en `ADMIN_PASSWORD`.

## Desarrollo local

```bash
npm run dev
```

El servidor Express se encarga de servir tanto el frontend como la API. Asegúrate de tener las variables de Supabase en `.env` para que la API funcione correctamente.
