export type Status = 'pending' | 'confirmed' | 'cancelled';
export interface Service { id: string; name: string; duration_min: number; price: number | null; active: boolean }
export interface Slot { id: string; slot_time: string; active: boolean }
export interface Booking {
  id: string; customer_name: string; customer_phone: string; service_id: string;
  booking_date: string; slot_time: string; status: Status; created_at: string;
}
export interface BookingInput { name: string; phone: string; serviceId: string; date: string; time: string }
export class SlotTakenError extends Error { constructor() { super('Ese horario ya fue reservado.'); } }
export class ValidationError extends Error {}
export interface Store {
  mode: 'supabase' | 'demo';
  listServices(onlyActive: boolean): Promise<Service[]>;
  listSlots(onlyActive: boolean): Promise<Slot[]>;
  listBookings(): Promise<Booking[]>;
  takenTimes(date: string): Promise<string[]>;
  createBooking(i: BookingInput): Promise<Booking>;
  setStatus(id: string, status: Status): Promise<void>;
}
