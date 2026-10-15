import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SlotTakenError, ValidationError, type Store, type Booking, type Service, type Slot } from './types';

const BOOKED = ['pending', 'confirmed'];

export function supabaseStore(url: string, key: string): Store {
  const db: SupabaseClient = createClient(url, key, { auth: { persistSession: false } });
  const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };

  return {
    mode: 'supabase',
    async listServices(onlyActive) {
      let q = db.from('services').select('*').order('created_at');
      if (onlyActive) q = q.eq('active', true);
      const { data, error } = await q; fail(error); return (data ?? []) as Service[];
    },
    async listSlots(onlyActive) {
      let q = db.from('time_slots').select('*').order('slot_time');
      if (onlyActive) q = q.eq('active', true);
      const { data, error } = await q; fail(error); return (data ?? []) as Slot[];
    },
    async listBookings() {
      const { data, error } = await db.from('bookings').select('*').order('booking_date').order('slot_time');
      fail(error); return (data ?? []) as Booking[];
    },
    async takenTimes(date) {
      const { data, error } = await db.from('bookings').select('slot_time').eq('booking_date', date).in('status', BOOKED);
      fail(error); return (data ?? []).map((r) => r.slot_time as string);
    },
    async createBooking(i) {
      const [{ data: svc }, { data: slot }] = await Promise.all([
        db.from('services').select('id').eq('id', i.serviceId).eq('active', true).maybeSingle(),
        db.from('time_slots').select('id').eq('slot_time', i.time).eq('active', true).maybeSingle(),
      ]);
      if (!svc) throw new ValidationError('El servicio no está disponible.');
      if (!slot) throw new ValidationError('El horario no está habilitado.');
      if ((await this.takenTimes(i.date)).includes(i.time)) throw new SlotTakenError();
      const { data, error } = await db.from('bookings').insert({
        customer_name: i.name, customer_phone: i.phone, service_id: i.serviceId,
        booking_date: i.date, slot_time: i.time,
      }).select().single();
      // 23505 = índice único: otro cliente reservó el mismo horario primero.
      if (error?.code === '23505') throw new SlotTakenError();
      fail(error); return data as Booking;
    },
    async setStatus(id, status) {
      const { error } = await db.from('bookings').update({ status }).eq('id', id);
      if (error?.code === '23505') throw new SlotTakenError(); // reactivar un turno ya ocupado
      fail(error);
    },
  };
}
