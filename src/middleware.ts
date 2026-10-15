import { defineMiddleware } from 'astro:middleware';

// Protege /admin y /api/admin con HTTP Basic (usuario libre, contraseña = ADMIN_PASSWORD).
// En modo demo sin contraseña queda abierto. Con Supabase real y sin contraseña: bloqueado.
export const onRequest = defineMiddleware(async ({ url, request }, next) => {
  if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api/admin')) return next();
  const pass = import.meta.env.ADMIN_PASSWORD as string | undefined;
  const hasSupabase = !!(import.meta.env.SUPABASE_URL && import.meta.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!pass) {
    if (!hasSupabase) return next();
    return new Response('Definí ADMIN_PASSWORD en .env para usar /admin con Supabase.', { status: 503 });
  }
  const auth = request.headers.get('authorization') ?? '';
  const given = auth.startsWith('Basic ') ? atob(auth.slice(6)).split(':').slice(1).join(':') : '';
  if (given === pass) return next();
  return new Response('Autenticación requerida', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Admin"' } });
});
