-- =============================================================================
--  PANEL DE TURNOS · Lic. Candela Hidalgo
--  Esquema de base de datos para Neon (Postgres) + Data API + Neon Auth
--  -----------------------------------------------------------------------------
--  INSTRUCCIONES (respetá el orden):
--  1. Creá un proyecto en https://neon.com (plan gratuito).
--  2. Habilitá la "Data API" del branch (esto crea los roles anonymous/authenticated
--     que usan las políticas de este script):
--       Postgres database -> Data API -> Enable.
--       - Marcá "Use Neon Auth" (Managed Better Auth).
--       - Marcá "Grant public schema access".
--  3. Neon Console -> SQL Editor -> pegá TODO este archivo -> Run.
--  4. En la página Data API, tocá "Refresh schema cache" (para que tome las
--     tablas y la vista nuevas).
--  5. En Data API -> Settings -> CORS, agregá el origen de tu web
--     (ej: https://tusitio.com y http://localhost:8000).
--  6. Creá el usuario administrador (Candela) desde la referencia de Auth:
--       <Auth URL>/reference -> POST /sign-up/email con email + password + name.
--     Luego, para que NADIE más pueda registrarse:
--       update neon_auth.project_config
--          set email_and_password = jsonb_set(email_and_password,'{disableSignUp}','true'::jsonb)
--        where endpoint_id = '<tu endpoint>';
--     Copiá el id del usuario creado y reemplazá el UUID en las políticas de
--     administración de más abajo (buscar b59fc20c-dac9-4fac-b415-6641862f4aa0).
--  7. Pegá la URL base de la base (HTTPS, SIN credenciales) en neon-config.js
--     (constante NEON_DATABASE_URL). NO pegues la cadena postgresql://.
--     Si usás otro origen para el panel, agregalo también a los "trusted origins"
--     (update neon_auth.project_config set trusted_origins = '["https://tu-dominio"]'::jsonb).
--
--  NOTA: las políticas usan los roles que crea Neon Auth automáticamente:
--    - `anonymous`     -> visitantes sin sesión (la landing pública)
--    - `authenticated` -> usuarios logueados (el panel de Candela)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. DISPONIBILIDAD SEMANAL (horarios que se repiten cada semana)
-- ----------------------------------------------------------------------------
create table if not exists public.availability (
    id           uuid primary key default gen_random_uuid(),
    day_of_week  smallint not null check (day_of_week between 0 and 6), -- 0=Dom ... 6=Sáb
    modality     text not null check (modality in ('online', 'presencial')),
    time         text not null, -- formato 'HH:MM'
    created_at   timestamptz not null default now(),
    unique (day_of_week, modality, time)
);

-- ----------------------------------------------------------------------------
-- 2. BLOQUEOS (fechas u horarios puntuales sin atención: vacaciones, etc.)
--    - time = null      -> bloquea TODO el día
--    - modality = null  -> bloquea ambas modalidades
-- ----------------------------------------------------------------------------
create table if not exists public.blocked_slots (
    id            uuid primary key default gen_random_uuid(),
    blocked_date  date not null,
    time          text,                                                     -- null = día completo
    modality      text check (modality in ('online', 'presencial')),        -- null = ambas
    reason        text,
    created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. TURNOS SOLICITADOS (los que llegan desde la landing)
-- ----------------------------------------------------------------------------
create table if not exists public.appointments (
    id                uuid primary key default gen_random_uuid(),
    patient_name      text not null,
    patient_phone     text,
    consultation_type text,
    notes             text,
    modality          text not null check (modality in ('online', 'presencial')),
    appointment_date  date not null,
    appointment_time  text not null,
    status            text not null default 'pendiente'
                      check (status in ('pendiente', 'confirmado', 'atendido', 'cancelado')),
    created_at        timestamptz not null default now()
);

create index if not exists appointments_date_idx on public.appointments (appointment_date);

-- ----------------------------------------------------------------------------
-- 4. SEGURIDAD (Row Level Security)
-- ----------------------------------------------------------------------------
alter table public.availability  enable row level security;
alter table public.blocked_slots enable row level security;
alter table public.appointments  enable row level security;

-- Disponibilidad: lectura pública, escritura solo logueado
drop policy if exists "availability_read" on public.availability;
create policy "availability_read" on public.availability
    for select to anonymous, authenticated using (true);

drop policy if exists "availability_write" on public.availability;
create policy "availability_write" on public.availability
    for all to authenticated
    using (auth.user_id() = 'b59fc20c-dac9-4fac-b415-6641862f4aa0')
    with check (auth.user_id() = 'b59fc20c-dac9-4fac-b415-6641862f4aa0');

-- Bloqueos: lectura pública (para ocultar horarios), escritura solo logueado
drop policy if exists "blocked_read" on public.blocked_slots;
create policy "blocked_read" on public.blocked_slots
    for select to anonymous, authenticated using (true);

drop policy if exists "blocked_write" on public.blocked_slots;
create policy "blocked_write" on public.blocked_slots
    for all to authenticated
    using (auth.user_id() = 'b59fc20c-dac9-4fac-b415-6641862f4aa0')
    with check (auth.user_id() = 'b59fc20c-dac9-4fac-b415-6641862f4aa0');

-- Turnos: cualquiera puede SOLICITAR (insert), solo el logueado puede ver/gestionar.
-- Por privacidad, el público NO puede leer los datos de los pacientes.
-- Las políticas de administración están acotadas al user_id de Candela.
drop policy if exists "appointments_insert" on public.appointments;
create policy "appointments_insert" on public.appointments
    for insert to authenticated
    with check (auth.user_id() = 'b59fc20c-dac9-4fac-b415-6641862f4aa0');

drop policy if exists "appointments_manage" on public.appointments;
create policy "appointments_manage" on public.appointments
    for all to authenticated
    using (auth.user_id() = 'b59fc20c-dac9-4fac-b415-6641862f4aa0')
    with check (auth.user_id() = 'b59fc20c-dac9-4fac-b415-6641862f4aa0');

-- ----------------------------------------------------------------------------
-- 5. PERMISOS (GRANT) para los roles de la Data API
--    El rol authenticated ya recibe permisos con "Grant public schema access",
--    pero los repetimos y agregamos los de anonymous.
-- ----------------------------------------------------------------------------
grant usage on schema public to anonymous, authenticated;

grant select on public.availability to anonymous, authenticated;
grant select on public.blocked_slots to anonymous, authenticated;

grant select, insert, update, delete on public.appointments to authenticated;
grant insert, update, delete on public.availability to authenticated;
grant insert, update, delete on public.blocked_slots to authenticated;

-- ----------------------------------------------------------------------------
-- 6. FUNCIÓN PÚBLICA PARA SOLICITAR UN TURNO
--    El público NO puede escribir ni leer la tabla de turnos directamente.
--    Solo puede ejecutar esta función (SECURITY DEFINER), que inserta un turno
--    con estado 'pendiente'. Así nunca se exponen datos de pacientes.
-- ----------------------------------------------------------------------------
create or replace function public.create_appointment(
    p_patient_name      text,
    p_patient_phone     text default null,
    p_consultation_type text default null,
    p_notes             text default null,
    p_modality          text default 'online',
    p_appointment_date  date default null,
    p_appointment_time  text default null
) returns void
language sql
security definer
set search_path = public
as $$
    insert into public.appointments
        (patient_name, patient_phone, consultation_type, notes,
         modality, appointment_date, appointment_time, status)
    values
        (p_patient_name, p_patient_phone, p_consultation_type, p_notes,
         p_modality, p_appointment_date, p_appointment_time, 'pendiente');
$$;

revoke all on function public.create_appointment(text, text, text, text, text, date, text) from public;
grant execute on function public.create_appointment(text, text, text, text, text, date, text) to anonymous, authenticated;

-- ----------------------------------------------------------------------------
-- 7. VISTA PÚBLICA DE HORARIOS OCUPADOS
--    La landing necesita saber qué horarios ya están tomados para no ofrecerlos,
--    pero SIN acceder a ningún dato del paciente. Esta vista expone solo la
--    fecha, el horario y la modalidad ocupada.
-- ----------------------------------------------------------------------------
create or replace view public.booked_slots as
    select appointment_date, appointment_time, modality
    from public.appointments
    where status in ('pendiente', 'confirmado', 'atendido');

grant select on public.booked_slots to anonymous, authenticated;

-- ----------------------------------------------------------------------------
-- 8. CARGA INICIAL DE DISPONIBILIDAD (la agenda actual de Candela)
--    Lunes a Jueves. Podés editar/borrar todo desde el panel.
-- ----------------------------------------------------------------------------
insert into public.availability (day_of_week, modality, time) values
    -- Lunes
    (1, 'presencial', '08:00'), (1, 'presencial', '09:00'),
    (1, 'presencial', '16:00'), (1, 'presencial', '17:00'), (1, 'presencial', '18:00'),
    (1, 'online',     '08:00'), (1, 'online',     '09:00'),
    (1, 'online',     '16:00'), (1, 'online',     '17:00'), (1, 'online',     '18:00'),
    -- Martes
    (2, 'presencial', '18:00'),
    (2, 'online',     '18:00'),
    -- Miércoles
    (3, 'presencial', '08:00'), (3, 'presencial', '09:00'), (3, 'presencial', '14:00'), (3, 'presencial', '15:00'),
    (3, 'online',     '08:00'), (3, 'online',     '09:00'), (3, 'online',     '10:00'), (3, 'online',     '11:00'),
    (3, 'online',     '12:00'), (3, 'online',     '13:00'), (3, 'online',     '14:00'), (3, 'online',     '15:00'),
    -- Jueves
    (4, 'presencial', '08:00'), (4, 'presencial', '09:00'), (4, 'presencial', '14:00'), (4, 'presencial', '15:00'),
    (4, 'online',     '08:00'), (4, 'online',     '09:00'), (4, 'online',     '10:00'), (4, 'online',     '11:00'),
    (4, 'online',     '12:00'), (4, 'online',     '13:00'), (4, 'online',     '14:00'), (4, 'online',     '15:00')
on conflict (day_of_week, modality, time) do nothing;

-- Después de crear tablas/vista, recordá hacer click en
-- "Refresh schema cache" en la página de la Data API.
