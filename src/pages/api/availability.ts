import type { APIRoute } from 'astro';
import { store, json } from '../../lib/store';
import { isDate, todayISO } from '../../lib/validate';
export const prerender = false;
export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get('date');
  if (!isDate(date) || date < todayISO()) return json({ error: 'Fecha inválida.' }, 400);
  try {
    const [slots, taken] = await Promise.all([store.listSlots(true), store.takenTimes(date)]);
    return json({ slots: slots.map((s) => ({ time: s.slot_time, available: !taken.includes(s.slot_time) })) });
  } catch (e) { return json({ error: (e as Error).message }, 500); }
};
