import { useCallback, useEffect, useState } from 'react';
import type { Booking, Service, Status } from '../lib/types';

const LABEL: Record<Status, string> = { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada' };
const COLOR: Record<Status, string> = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-slate-200 text-slate-600' };
const btn = 'rounded border px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-40';

export default function AdminDashboard() {
  const [data, setData] = useState<{ mode: string; bookings: Booking[]; services: Service[] } | null>(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try { const r = await fetch('/api/admin/data'); const j = await r.json(); if (!r.ok) throw new Error(j.error); setData(j); }
    catch (e) { setErr((e as Error).message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: Status) => {
    setErr('');
    const r = await fetch('/api/admin/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'setStatus', id, status }) });
    if (!r.ok) setErr((await r.json()).error ?? 'Error');
    await load();
  };

  if (!data) return <p className="p-6">{err || 'Cargando…'}</p>;
  const svcName = (id: string) => data.services.find((s) => s.id === id)?.name ?? '—';

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservas ({data.bookings.length})</h1>
        <div className="flex gap-3 text-sm"><button className="text-indigo-600 underline" onClick={load}>Actualizar</button><a href="/" className="text-indigo-600 underline">← Sitio público</a></div>
      </header>
      {data.mode === 'demo' && (
        <div className="rounded border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
          <b>MODO DEMO:</b> sin credenciales de Supabase. Los datos viven en memoria y se pierden al reiniciar el servidor.
        </div>
      )}
      {err && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{err}</div>}
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100"><tr>{['Cliente', 'Teléfono', 'Servicio', 'Fecha y hora', 'Estado', 'Acciones'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {data.bookings.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Todavía no hay reservas.</td></tr>}
            {data.bookings.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-3 py-2">{b.customer_name}</td>
                <td className="px-3 py-2">{b.customer_phone}</td>
                <td className="px-3 py-2">{svcName(b.service_id)}</td>
                <td className="whitespace-nowrap px-3 py-2">{b.booking_date} {b.slot_time}</td>
                <td className="px-3 py-2"><span className={'rounded-full px-2 py-0.5 text-xs ' + COLOR[b.status]}>{LABEL[b.status]}</span></td>
                <td className="flex gap-1 px-3 py-2">
                  <button className={btn} disabled={b.status === 'confirmed'} onClick={() => setStatus(b.id, 'confirmed')}>Confirmar</button>
                  <button className={btn} disabled={b.status === 'cancelled'} onClick={() => setStatus(b.id, 'cancelled')}>Cancelar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
