import { useEffect, useRef, useState } from 'react';
import { BUSINESS, FAQS, answerFor } from '../lib/business';
import type { Service } from '../lib/types';

type Step = 'menu' | 'service' | 'date' | 'time' | 'name' | 'phone' | 'confirm' | 'sending' | 'done';
interface Msg { from: 'bot' | 'user'; text: string }
interface Slot { time: string; available: boolean }

const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
const btn = 'rounded-full border border-indigo-600 px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-50 disabled:opacity-40';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'demo' | 'supabase' | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: BUSINESS.welcome }]);
  const [step, setStep] = useState<Step>('menu');
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; saved: boolean } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, step, slots]);
  useEffect(() => {
    fetch('/api/config').then((r) => r.json()).then((d) => { setMode(d.mode); setServices(d.services ?? []); }).catch(() => {});
  }, []);

  const say = (...m: Msg[]) => setMsgs((p) => [...p, ...m]);
  const bot = (text: string): Msg => ({ from: 'bot', text });
  const me = (text: string): Msg => ({ from: 'user', text });

  const startBooking = () => {
    say(me('Reservar turno'), bot('¡Perfecto! ¿Qué servicio querés?'));
    setStep('service');
  };
  const pickService = (s: Service) => {
    setService(s); say(me(s.name), bot('¿Para qué fecha?')); setStep('date');
  };
  const pickDate = async (d: string) => {
    if (!d || d < today()) return;
    setDate(d); setBusy(true); say(me(fmtDate(d)));
    try {
      const r = await fetch('/api/availability?date=' + d); const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setSlots(j.slots);
      const free = j.slots.filter((s: Slot) => s.available).length;
      say(bot(free ? 'Estos son los horarios de ese día:' : 'No quedan horarios ese día. Probá con otra fecha.'));
      setStep(free ? 'time' : 'date');
    } catch (e) { say(bot('No pude consultar la disponibilidad: ' + (e as Error).message)); }
    setBusy(false);
  };
  const pickTime = (t: string) => { setTime(t); say(me(t + ' hs'), bot('¿Cuál es tu nombre?')); setStep('name'); };

  const submitText = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const t = input.trim(); if (!t) return; setInput('');
    if (step === 'name') {
      if (t.length < 2) return say(me(t), bot('Ingresá un nombre válido.'));
      setName(t); say(me(t), bot('Gracias. ¿Cuál es tu teléfono de contacto? (solo números)')); setStep('phone');
    } else if (step === 'phone') {
      const digits = t.replace(/\D/g, '');
      if (digits.length < 8 || digits.length > 15) return say(me(t), bot('El número debe tener entre 8 y 15 dígitos.'));
      setPhone(digits); say(me(t), bot('Revisá los datos y confirmá tu solicitud.')); setStep('confirm');
    } else if (step === 'menu') {
      say(me(t), bot(answerFor(t) ?? 'No tengo una respuesta para eso. Volvamos al menú: elegí una pregunta o reservá un turno.'));
    }
  };

  const confirm = async () => {
    if (!service) return;
    setStep('sending');
    try {
      const r = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: phone, serviceId: service.id, date, time }),
      });
      const j = await r.json();
      if (r.ok) {
        const saved = j.mode === 'supabase';
        setResult({ ok: true, saved });
        say(bot(saved
          ? '✅ ¡Solicitud registrada! Quedó guardada como pendiente; el negocio la revisará y confirmará.'
          : '✅ Solicitud registrada en MODO DEMO. No se guardó en Supabase: se pierde al reiniciar el servidor.'));
        setStep('done');
      } else if (r.status === 409) {
        say(bot('😕 Ese horario acaba de ser reservado por otra persona. Elegí otro.'));
        await pickDate(date);
      } else { setResult({ ok: false, saved: false }); say(bot('❌ ' + (j.error ?? 'Error desconocido') )); setStep('confirm'); }
    } catch { say(bot('❌ No se pudo contactar al servidor.')); setStep('confirm'); }
  };

  const reset = () => {
    setMsgs([bot(BUSINESS.welcome)]); setStep('menu'); setService(null); setDate(''); setTime(''); setName(''); setPhone(''); setSlots([]); setResult(null);
  };

  return (
    <>
      <button onClick={() => setOpen((o) => !o)} aria-label="Abrir chat"
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-indigo-600 text-2xl text-white shadow-lg hover:bg-indigo-700">
        {open ? '×' : '💬'}
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
          <div className="bg-indigo-600 px-4 py-3 text-white">
            <div className="font-semibold">{BUSINESS.name}</div>
            {mode === 'demo' && <div className="text-xs text-amber-200">MODO DEMO · las reservas no se guardan en Supabase</div>}
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === 'user' ? 'text-right' : ''}>
                <span className={'inline-block max-w-[85%] rounded-2xl px-3 py-2 ' + (m.from === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800')}>{m.text}</span>
              </div>
            ))}

            {step === 'menu' && (
              <div className="flex flex-wrap gap-2">
                {FAQS.map((f) => <button key={f.q} className={btn} onClick={() => say(me(f.q), bot(f.a))}>{f.q}</button>)}
                <button className="rounded-full bg-indigo-600 px-3 py-1.5 text-sm text-white" onClick={startBooking}>📅 Reservar turno</button>
              </div>
            )}
            {step === 'service' && (
              <div className="flex flex-wrap gap-2">
                {services.length === 0 && <span className="text-slate-500">No hay servicios disponibles.</span>}
                {services.map((s) => <button key={s.id} className={btn} onClick={() => pickService(s)}>{s.name}{s.price != null ? ` · $${s.price}` : ''} · {s.duration_min}′</button>)}
              </div>
            )}
            {(step === 'date' || step === 'time') && (
              <input type="date" min={today()} value={date} disabled={busy} onChange={(e) => pickDate(e.target.value)} className="rounded border px-2 py-1" />
            )}
            {step === 'time' && (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => <button key={s.time} disabled={!s.available} className={btn + (s.available ? '' : ' line-through')} onClick={() => pickTime(s.time)}>{s.time}</button>)}
              </div>
            )}
            {(step === 'confirm' || step === 'sending') && service && (
              <div className="rounded-lg border p-3">
                <div><b>Servicio:</b> {service.name}</div>
                <div><b>Fecha:</b> {fmtDate(date)}, {time} hs</div>
                <div><b>Nombre:</b> {name}</div>
                <div><b>Teléfono:</b> {phone}</div>
                <div className="mt-2 flex gap-2">
                  <button disabled={step === 'sending'} onClick={confirm} className="rounded-full bg-emerald-600 px-3 py-1.5 text-white disabled:opacity-50">{step === 'sending' ? 'Enviando…' : 'Confirmar solicitud'}</button>
                  <button disabled={step === 'sending'} onClick={reset} className={btn}>Cancelar</button>
                </div>
              </div>
            )}
            {step === 'done' && result?.ok && <button className={btn} onClick={reset}>Hacer otra consulta</button>}
            <div ref={endRef} />
          </div>
          {(step === 'menu' || step === 'name' || step === 'phone') && (
            <form onSubmit={submitText} className="flex gap-2 border-t p-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded border px-2 py-1.5 text-sm"
                placeholder={step === 'name' ? 'Tu nombre' : step === 'phone' ? 'Tu teléfono' : 'Escribí tu consulta…'} />
              <button className="rounded bg-indigo-600 px-3 text-white">Enviar</button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
