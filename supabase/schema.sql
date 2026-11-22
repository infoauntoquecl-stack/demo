-- Tabla de eventos anónimos (sin IP, sin cookies, sin datos personales).
create table if not exists public.eventos (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  negocio     text not null default 'demo',
  evento      text not null,   -- view | click_whatsapp | click_resena | ...
  origen      text,            -- nfc | qr | directo
  pieza       text,            -- mesa1, caja, barbero1...
  dispositivo text             -- ios | android | otro
);

create index if not exists eventos_negocio_fecha
  on public.eventos (negocio, created_at desc);

-- Seguridad: sin políticas, solo la clave de servicio (que vive en el servidor
-- de Vercel) puede leer y escribir. Nadie puede acceder desde el navegador.
alter table public.eventos enable row level security;
