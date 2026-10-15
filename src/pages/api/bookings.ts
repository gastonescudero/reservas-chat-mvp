import type { APIRoute } from 'astro';
import { store, json } from '../../lib/store';
import { parseBookingInput } from '../../lib/validate';
import { SlotTakenError, ValidationError } from '../../lib/types';
export const prerender = false;
export const POST: APIRoute = async ({ request }) => {
  try {
    const input = parseBookingInput(await request.json().catch(() => ({})));
    const booking = await store.createBooking(input);
    // "mode" permite a la UI decir la verdad: en demo NO se guardó en Supabase.
    return json({ ok: true, mode: store.mode, booking }, 201);
  } catch (e) {
    if (e instanceof SlotTakenError) return json({ error: e.message, code: 'slot_taken' }, 409);
    if (e instanceof ValidationError) return json({ error: e.message }, 400);
    return json({ error: 'No se pudo guardar la reserva: ' + (e as Error).message }, 500);
  }
};
