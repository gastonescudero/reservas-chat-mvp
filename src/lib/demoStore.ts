import { SlotTakenError, ValidationError, type Store, type Booking, type Service, type Slot } from './types';

// MODO DEMO: datos en memoria del proceso. Se pierden al reiniciar el servidor.
const uid = () => crypto.randomUUID();
const g = globalThis as any;
g.__demo ??= {
  services: [
    { id: uid(), name: 'Corte de pelo', duration_min: 30, price: 8000, active: true },
    { id: uid(), name: 'Corte + barba', duration_min: 45, price: 12000, active: true },
    { id: uid(), name: 'Coloración', duration_min: 90, price: 25000, active: true },
  ] as Service[],
  slots: ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00', '18:00'].map((t) => ({ id: uid(), slot_time: t, active: true })) as Slot[],
  bookings: [] as Booking[],
};
const d = g.__demo as { services: Service[]; slots: Slot[]; bookings: Booking[] };
const isTaken = (date: string, time: string) =>
  d.bookings.some((b) => b.booking_date === date && b.slot_time === time && b.status !== 'cancelled');

export const demoStore: Store = {
  mode: 'demo',
  async listServices(a) { return d.services.filter((s) => !a || s.active); },
  async listSlots(a) { return d.slots.filter((s) => !a || s.active).sort((x, y) => x.slot_time.localeCompare(y.slot_time)); },
  async listBookings() { return [...d.bookings].sort((a, b) => (a.booking_date + a.slot_time).localeCompare(b.booking_date + b.slot_time)); },
  async takenTimes(date) { return d.bookings.filter((b) => b.booking_date === date && b.status !== 'cancelled').map((b) => b.slot_time); },
  async createBooking(i) {
    if (!d.services.some((s) => s.id === i.serviceId && s.active)) throw new ValidationError('El servicio no está disponible.');
    if (!d.slots.some((s) => s.slot_time === i.time && s.active)) throw new ValidationError('El horario no está habilitado.');
    if (isTaken(i.date, i.time)) throw new SlotTakenError();
    const b: Booking = { id: uid(), customer_name: i.name, customer_phone: i.phone, service_id: i.serviceId, booking_date: i.date, slot_time: i.time, status: 'pending', created_at: new Date().toISOString() };
    d.bookings.push(b); return b;
  },
  async setStatus(id, status) {
    const b = d.bookings.find((x) => x.id === id); if (!b) throw new ValidationError('Reserva inexistente.');
    if (status !== 'cancelled' && b.status === 'cancelled' && isTaken(b.booking_date, b.slot_time)) throw new SlotTakenError();
    b.status = status;
  },
};
