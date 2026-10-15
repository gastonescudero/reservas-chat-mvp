import type { APIRoute } from 'astro';
import { store, json } from '../../lib/store';
export const prerender = false;
export const GET: APIRoute = async () => {
  try { return json({ mode: store.mode, services: await store.listServices(true) }); }
  catch (e) { return json({ error: (e as Error).message }, 500); }
};
