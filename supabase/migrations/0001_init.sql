-- MVP reservas con chat: un único negocio de prueba.
create extension if not exists pgcrypto;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  duration_min int not null default 30 check (duration_min > 0),
  price numeric(10,2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  slot_time text not null unique check (slot_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  active boolean not null default true
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  customer_phone text not null check (customer_phone ~ '^[0-9]{8,15}$'),
  service_id uuid not null references public.services(id) on delete restrict,
  booking_date date not null,
  slot_time text not null check (slot_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now()
);

-- Garantía final contra doble reserva: un solo turno activo por fecha+hora.
-- Las canceladas liberan el horario.
create unique index bookings_unique_active_slot
  on public.bookings (booking_date, slot_time)
  where status in ('pending','confirmed');

-- El acceso se hace solo desde el servidor con la service role key.
-- RLS activado sin políticas = el cliente anónimo no puede leer ni escribir.
alter table public.services enable row level security;
alter table public.time_slots enable row level security;
alter table public.bookings enable row level security;

insert into public.services (name, duration_min, price) values
  ('Corte de pelo', 30, 8000),
  ('Corte + barba', 45, 12000),
  ('Coloración', 90, 25000);

insert into public.time_slots (slot_time) values
  ('09:00'),('10:00'),('11:00'),('12:00'),('15:00'),('16:00'),('17:00'),('18:00');
