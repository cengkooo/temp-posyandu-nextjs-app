-- =============================================================================
-- POSYANDU APP - SUPABASE FULL SCHEMA (SINGLE MIGRATION)
-- =============================================================================
-- Purpose:
--   - One-file schema setup for ALL tables used by the app
--   - Includes: tables, constraints, indexes, triggers, RLS policies, dashboard functions
--
-- How to run:
--   Supabase Dashboard → SQL Editor → paste this file → RUN
--
-- Notes:
--   - This script is designed to be reasonably idempotent (safe to re-run).
--   - It assumes Supabase Auth is enabled (auth.users exists).
-- =============================================================================

begin;

-- Extensions (Supabase typically has pgcrypto; uuid-ossp may not be enabled by default)
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- =============================================================================
-- Helpers
-- =============================================================================

-- Generic updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Role helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin','bidan','kader')
  );
$$;

-- =============================================================================
-- Core tables
-- =============================================================================

-- Profiles (maps to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'kader' check (role in ('admin','bidan','kader')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Optional: auto-create profile on sign-up (safe if you later only create users via admin)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null), 'kader')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Patients
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  nik text,
  date_of_birth date not null,
  gender text not null check (gender in ('L','P')),
  address text,
  phone text,
  patient_type text not null check (patient_type in ('bayi','balita','ibu_hamil','remaja_dewasa','lansia')),
  parent_name text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patients_patient_type_idx on public.patients (patient_type);
create index if not exists patients_created_at_idx on public.patients (created_at);

drop trigger if exists trg_patients_updated_at on public.patients;
create trigger trg_patients_updated_at
before update on public.patients
for each row
execute function public.set_updated_at();

-- Visits
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  visit_date date not null,
  weight numeric,
  height numeric,
  head_circumference numeric,
  arm_circumference numeric,
  blood_pressure text,
  notes text,
  complaints text,
  recommendations text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists visits_visit_date_idx on public.visits (visit_date);
create index if not exists visits_patient_id_visit_date_desc_idx on public.visits (patient_id, visit_date desc);

drop trigger if exists trg_visits_updated_at on public.visits;
create trigger trg_visits_updated_at
before update on public.visits
for each row
execute function public.set_updated_at();

-- Immunizations
create table if not exists public.immunizations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  vaccine_name text not null,
  vaccine_date date not null,
  next_schedule date,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists immunizations_next_schedule_idx
  on public.immunizations (next_schedule)
  where next_schedule is not null;

-- Pregnancies
create table if not exists public.pregnancies (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  pregnancy_order int,
  estimated_due_date date,
  status text not null default 'ongoing' check (status in ('ongoing','completed','miscarriage')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_pregnancies_updated_at on public.pregnancies;
create trigger trg_pregnancies_updated_at
before update on public.pregnancies
for each row
execute function public.set_updated_at();

-- Patient extended data (wide table)
create table if not exists public.patient_extended_data (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null unique references public.patients(id) on delete cascade,

  weight numeric,
  height numeric,
  head_circumference numeric,
  arm_circumference numeric,
  waist_circumference numeric,
  measurement_date date,

  asi_exclusive text check (asi_exclusive in ('ya','tidak','berlangsung')),
  asi_duration_months int,
  mpasi_started boolean,
  mpasi_age_months int,
  mpasi_types text,
  immunizations jsonb,
  vitamin_a_given boolean,
  vitamin_a_date date,

  ispa_history boolean,
  ispa_last_date date,
  diare_history boolean,
  diare_last_date date,
  other_illness text,

  pregnancy_week int,
  usg_count int,
  pregnancy_risk_level text check (pregnancy_risk_level in ('rendah','sedang','tinggi')),
  ttd_received int,
  ttd_compliance text check (ttd_compliance in ('rutin','kadang','tidak')),

  occupation text,
  marital_status text,
  smoking_status text check (smoking_status in ('tidak_pernah','pernah','aktif')),
  cigarettes_per_day int,
  physical_activity text check (physical_activity in ('kurang','cukup','sangat')),
  activity_minutes_per_week int,
  vegetable_portions_per_day numeric,
  fruit_portions_per_day numeric,

  blood_sugar_random numeric,
  blood_sugar_fasting numeric,
  cholesterol_total numeric,
  cholesterol_ldl numeric,
  cholesterol_hdl numeric,
  triglycerides numeric,
  uric_acid numeric,

  adl_score int,
  iadl_score int,
  cognitive_status text,
  chronic_diseases jsonb,
  current_medications jsonb,
  special_notes text,
  education_given jsonb,

  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_extended_data_patient_id
  on public.patient_extended_data(patient_id);

create index if not exists idx_patient_extended_data_measurement_date
  on public.patient_extended_data(measurement_date desc)
  where measurement_date is not null;

create index if not exists idx_patient_extended_immunizations_gin
  on public.patient_extended_data using gin (immunizations);

create index if not exists idx_patient_extended_chronic_diseases_gin
  on public.patient_extended_data using gin (chronic_diseases);

create index if not exists idx_patient_extended_medications_gin
  on public.patient_extended_data using gin (current_medications);


drop trigger if exists trg_patient_extended_data_updated_at on public.patient_extended_data;
create trigger trg_patient_extended_data_updated_at
before update on public.patient_extended_data
for each row
execute function public.set_updated_at();

-- Announcements
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  type text not null default 'info' check (type in ('info','schedule','event','warning')),
  published boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announcements_published on public.announcements(published);
create index if not exists idx_announcements_type on public.announcements(type);
create index if not exists idx_announcements_created_at on public.announcements(created_at desc);

drop trigger if exists trg_announcements_updated_at on public.announcements;
create trigger trg_announcements_updated_at
before update on public.announcements
for each row
execute function public.set_updated_at();

-- Schedules (full fields used by API/UI)
create table if not exists public.schedules (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  description text,
  date date not null,
  time text,
  duration text,
  location text,
  full_address text,
  map_link text,
  capacity int,
  registered int default 0,
  price text default 'GRATIS',
  price_note text,
  coordinator_name text,
  coordinator_role text,
  contact_phone text,
  contact_whatsapp text,
  requirements text[] default '{}'::text[],
  important_note_title text,
  important_note_message text,
  tags text[] default '{}'::text[],
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_schedules_date on public.schedules(date);
create index if not exists idx_schedules_created_at on public.schedules(created_at desc);

drop trigger if exists trg_schedules_updated_at on public.schedules;
create trigger trg_schedules_updated_at
before update on public.schedules
for each row
execute function public.set_updated_at();

-- Gallery (used by landing page)
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text not null,
  consent_obtained boolean not null default false,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists gallery_created_at_idx on public.gallery(created_at desc);

-- Audit logs (used mainly for backup; safe to keep simple)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  changes jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists audit_logs_table_record_idx on public.audit_logs(table_name, record_id);

-- Posyandu settings (singleton)
create table if not exists public.posyandu_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  address text,
  kelurahan text,
  kecamatan text,
  kota text,
  phone text,
  email text,
  puskesmas text,
  ketua text,
  operational_days text[] not null default '{}'::text[],
  operational_hours text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_posyandu_settings_updated_at on public.posyandu_settings;
create trigger trg_posyandu_settings_updated_at
before update on public.posyandu_settings
for each row
execute function public.set_updated_at();

create unique index if not exists posyandu_settings_singleton_idx
  on public.posyandu_settings ((true));

insert into public.posyandu_settings (
  name,
  code,
  address,
  kelurahan,
  kecamatan,
  kota,
  phone,
  email,
  puskesmas,
  ketua,
  operational_days,
  operational_hours
)
select
  'Posyandu Melati Sehat',
  'PSY-001',
  'Jl. Melati No. 10, RT 05/RW 03, Kelurahan Sukamaju',
  'Sukamaju',
  'Cilandak',
  'Jakarta Selatan',
  '021-12345678',
  'posyandu.melati@gmail.com',
  'Puskesmas Cilandak',
  'Ibu Siti Aminah',
  array['Senin','Kamis']::text[],
  '08:00 - 12:00'
where not exists (select 1 from public.posyandu_settings);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.visits enable row level security;
alter table public.immunizations enable row level security;
alter table public.pregnancies enable row level security;
alter table public.patient_extended_data enable row level security;
alter table public.announcements enable row level security;
alter table public.schedules enable row level security;
alter table public.gallery enable row level security;
alter table public.audit_logs enable row level security;
alter table public.posyandu_settings enable row level security;

-- PROFILES

drop policy if exists "profiles_read_authenticated" on public.profiles;
create policy "profiles_read_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- PATIENTS

drop policy if exists "patients_read_authenticated" on public.patients;
create policy "patients_read_authenticated"
on public.patients
for select
to authenticated
using (true);

drop policy if exists "patients_write_staff" on public.patients;
create policy "patients_write_staff"
on public.patients
for insert
to authenticated
with check (public.is_staff());

drop policy if exists "patients_update_staff" on public.patients;
create policy "patients_update_staff"
on public.patients
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "patients_delete_staff" on public.patients;
create policy "patients_delete_staff"
on public.patients
for delete
to authenticated
using (public.is_staff());

-- VISITS

drop policy if exists "visits_read_authenticated" on public.visits;
create policy "visits_read_authenticated"
on public.visits
for select
to authenticated
using (true);

drop policy if exists "visits_write_staff" on public.visits;
create policy "visits_write_staff"
on public.visits
for insert
to authenticated
with check (public.is_staff());

drop policy if exists "visits_update_staff" on public.visits;
create policy "visits_update_staff"
on public.visits
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "visits_delete_staff" on public.visits;
create policy "visits_delete_staff"
on public.visits
for delete
to authenticated
using (public.is_staff());

-- IMMUNIZATIONS

drop policy if exists "immunizations_read_authenticated" on public.immunizations;
create policy "immunizations_read_authenticated"
on public.immunizations
for select
to authenticated
using (true);

drop policy if exists "immunizations_write_staff" on public.immunizations;
create policy "immunizations_write_staff"
on public.immunizations
for insert
to authenticated
with check (public.is_staff());

drop policy if exists "immunizations_update_staff" on public.immunizations;
create policy "immunizations_update_staff"
on public.immunizations
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "immunizations_delete_staff" on public.immunizations;
create policy "immunizations_delete_staff"
on public.immunizations
for delete
to authenticated
using (public.is_staff());

-- PREGNANCIES

drop policy if exists "pregnancies_read_authenticated" on public.pregnancies;
create policy "pregnancies_read_authenticated"
on public.pregnancies
for select
to authenticated
using (true);

drop policy if exists "pregnancies_write_staff" on public.pregnancies;
create policy "pregnancies_write_staff"
on public.pregnancies
for insert
to authenticated
with check (public.is_staff());

drop policy if exists "pregnancies_update_staff" on public.pregnancies;
create policy "pregnancies_update_staff"
on public.pregnancies
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "pregnancies_delete_staff" on public.pregnancies;
create policy "pregnancies_delete_staff"
on public.pregnancies
for delete
to authenticated
using (public.is_staff());

-- PATIENT EXTENDED DATA

drop policy if exists "patient_extended_read_authenticated" on public.patient_extended_data;
create policy "patient_extended_read_authenticated"
on public.patient_extended_data
for select
to authenticated
using (true);

drop policy if exists "patient_extended_write_staff" on public.patient_extended_data;
create policy "patient_extended_write_staff"
on public.patient_extended_data
for insert
to authenticated
with check (public.is_staff());

drop policy if exists "patient_extended_update_staff" on public.patient_extended_data;
create policy "patient_extended_update_staff"
on public.patient_extended_data
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "patient_extended_delete_staff" on public.patient_extended_data;
create policy "patient_extended_delete_staff"
on public.patient_extended_data
for delete
to authenticated
using (public.is_staff());

-- ANNOUNCEMENTS

drop policy if exists "announcements_public_published" on public.announcements;
create policy "announcements_public_published"
on public.announcements
for select
using (published = true);

drop policy if exists "announcements_authenticated_all" on public.announcements;
create policy "announcements_authenticated_all"
on public.announcements
for select
to authenticated
using (true);

drop policy if exists "announcements_write_authenticated" on public.announcements;
create policy "announcements_write_authenticated"
on public.announcements
for insert
to authenticated
with check (true);

drop policy if exists "announcements_update_authenticated" on public.announcements;
create policy "announcements_update_authenticated"
on public.announcements
for update
to authenticated
using (true)
with check (true);

drop policy if exists "announcements_delete_authenticated" on public.announcements;
create policy "announcements_delete_authenticated"
on public.announcements
for delete
to authenticated
using (true);

-- SCHEDULES

drop policy if exists "schedules_public_read" on public.schedules;
create policy "schedules_public_read"
on public.schedules
for select
using (true);

drop policy if exists "schedules_write_authenticated" on public.schedules;
create policy "schedules_write_authenticated"
on public.schedules
for insert
to authenticated
with check (true);

drop policy if exists "schedules_update_authenticated" on public.schedules;
create policy "schedules_update_authenticated"
on public.schedules
for update
to authenticated
using (true)
with check (true);

drop policy if exists "schedules_delete_authenticated" on public.schedules;
create policy "schedules_delete_authenticated"
on public.schedules
for delete
to authenticated
using (true);

-- GALLERY

drop policy if exists "gallery_public_read" on public.gallery;
create policy "gallery_public_read"
on public.gallery
for select
using (true);

drop policy if exists "gallery_write_authenticated" on public.gallery;
create policy "gallery_write_authenticated"
on public.gallery
for insert
to authenticated
with check (true);

drop policy if exists "gallery_update_authenticated" on public.gallery;
create policy "gallery_update_authenticated"
on public.gallery
for update
to authenticated
using (true)
with check (true);

drop policy if exists "gallery_delete_authenticated" on public.gallery;
create policy "gallery_delete_authenticated"
on public.gallery
for delete
to authenticated
using (true);

-- AUDIT LOGS (read admin-only; allow inserts if you decide to write logs from app)

drop policy if exists "audit_logs_read_admin" on public.audit_logs;
create policy "audit_logs_read_admin"
on public.audit_logs
for select
to authenticated
using (public.is_admin());

drop policy if exists "audit_logs_insert_authenticated" on public.audit_logs;
create policy "audit_logs_insert_authenticated"
on public.audit_logs
for insert
to authenticated
with check (true);

-- POSYANDU SETTINGS (authenticated read, admin write)

drop policy if exists "posyandu_settings_read" on public.posyandu_settings;
create policy "posyandu_settings_read"
on public.posyandu_settings
for select
to authenticated
using (true);

drop policy if exists "posyandu_settings_update_admin" on public.posyandu_settings;
create policy "posyandu_settings_update_admin"
on public.posyandu_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "posyandu_settings_insert_admin" on public.posyandu_settings;
create policy "posyandu_settings_insert_admin"
on public.posyandu_settings
for insert
to authenticated
with check (public.is_admin());

-- =============================================================================
-- Dashboard functions
-- =============================================================================

create or replace function public.dashboard_nutrition_counts()
returns table(status text, count int)
language sql
stable
as $$
  with latest as (
    select distinct on (v.patient_id)
      v.patient_id,
      v.weight,
      v.height
    from public.visits v
    join public.patients p on p.id = v.patient_id
    where p.patient_type = 'balita'
      and v.weight is not null
      and v.height is not null
    order by v.patient_id, v.visit_date desc
  ),
  scored as (
    select
      case
        when (weight / power((height / 100.0), 2)) >= 18.5 then 'Gizi Baik'
        when (weight / power((height / 100.0), 2)) >= 16   then 'Gizi Kurang'
        when (weight / power((height / 100.0), 2)) >= 14   then 'Gizi Buruk'
        else 'Stunting'
      end as status
    from latest
  )
  select status, count(*)::int as count
  from scored
  group by status;
$$;

create or replace function public.dashboard_visit_trends(
  start_date timestamptz,
  end_date timestamptz
)
returns table(month date, patient_type text, total int)
language sql
stable
as $$
  select
    date_trunc('month', v.visit_date)::date as month,
    p.patient_type::text as patient_type,
    count(*)::int as total
  from public.visits v
  join public.patients p on p.id = v.patient_id
  where v.visit_date >= start_date
    and v.visit_date < end_date
  group by 1, 2
  order by 1, 2;
$$;

commit;
