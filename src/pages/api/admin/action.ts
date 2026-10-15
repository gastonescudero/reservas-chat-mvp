import type { APIRoute } from 'astro';
import { store, json } from '../../../lib/store';
import { SlotTakenError, ValidationError } from '../../../lib/types';
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const b: any = await request.json().catch(() => ({}));
  try {
    if (b.action !== 'setStatus' || !['pending', 'confirmed', 'cancelled'].includes(b.status) || typeof b.id !== 'string')
      throw new ValidationError('Solicitud inválida.');
    await store.setStatus(b.id, b.status);
    return json({ ok: true });
  } catch (e) {
    const status = e instanceof SlotTakenError ? 409 : e instanceof ValidationError ? 400 : 500;
    return json({ error: (e as Error).message }, status);
  }
};
