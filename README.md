# MVP chat de reservas

## Dependencias (en tu proyecto Astro ya creado)
    npm install @astrojs/react @astrojs/node react react-dom @supabase/supabase-js tailwindcss @tailwindcss/vite
    npm install -D typescript@6 @types/react @types/react-dom @astrojs/check
Copiá `astro.config.mjs` (SSR + node + react + tailwind vite plugin) y `src/` de este paquete.

## Variables de entorno (.env, copiar de .env.example)
- SUPABASE_URL: URL del proyecto. Si falta (o falta la key) la app arranca en MODO DEMO.
- SUPABASE_SERVICE_ROLE_KEY: solo servidor. Nunca con prefijo PUBLIC_.
- ADMIN_PASSWORD: contraseña de /admin (HTTP Basic, usuario libre). Obligatoria con Supabase.

## Supabase
1. Creá un proyecto en supabase.com.
2. SQL Editor → pegá y ejecutá `supabase/migrations/0001_init.sql`.
3. Copiá URL y service_role key (Project Settings → API) al `.env`.
4. `npm run dev`.

## Probar
Ver el mensaje final del asistente.
