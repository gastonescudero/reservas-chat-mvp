import { ValidationError, type BookingInput } from './types';

export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const isDate = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
export const isTime = (s: unknown): s is string => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export function parseBookingInput(b: any): BookingInput {
  const name = String(b?.name ?? '').trim();
  const phone = String(b?.phone ?? '').replace(/\D/g, '');
  if (name.length < 2 || name.length > 80) throw new ValidationError('Ingresá un nombre válido.');
  if (phone.length < 8 || phone.length > 15) throw new ValidationError('El teléfono debe tener entre 8 y 15 dígitos.');
  if (!isDate(b?.date)) throw new ValidationError('Fecha inválida.');
  if (b.date < todayISO()) throw new ValidationError('La fecha no puede ser pasada.');
  if (!isTime(b?.time)) throw new ValidationError('Horario inválido.');
  if (typeof b?.serviceId !== 'string' || !b.serviceId) throw new ValidationError('Elegí un servicio.');
  return { name, phone, serviceId: b.serviceId, date: b.date, time: b.time };
}
