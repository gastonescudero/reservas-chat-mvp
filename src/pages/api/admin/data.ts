import type { APIRoute } from 'astro';
import { store, json } from '../../../lib/store';
export const prerender = false;
export const GET: APIRoute = async () => {
  try {
    const [bookings, services] = await Promise.all([store.listBookings(), store.listServices(false)]);
    return json({ mode: store.mode, bookings, services });
  } catch (e) { return json({ error: (e as Error).message }, 500); }
};
