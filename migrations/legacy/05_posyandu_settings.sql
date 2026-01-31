-- Global settings for a single Posyandu instance.

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

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_posyandu_settings_updated_at on public.posyandu_settings;
create trigger trg_posyandu_settings_updated_at
before update on public.posyandu_settings
for each row
execute function public.set_updated_at();

-- Ensure one-row semantics.
create unique index if not exists posyandu_settings_singleton_idx
  on public.posyandu_settings ((true));

-- Seed a default row if none exists.
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
  'Posyandu Way Kalam',
  'PSY-WK',
  'Way Kalam, Kec. Penengahan, Kabupaten Lampung Selatan, Lampung',
  'Way Kalam',
  'Penengahan',
  'Lampung Selatan',
  '021-12345678',
  'posyandu.melati@gmail.com',
  'Puskesmas Cilandak',
  'Ibu Siti Aminah',
  array['Senin','Kamis']::text[],
  '08:00 - 12:00'
where not exists (select 1 from public.posyandu_settings);

-- RLS: allow read for authenticated, write for admin.
alter table public.posyandu_settings enable row level security;

drop policy if exists "posyandu_settings_read" on public.posyandu_settings;
create policy "posyandu_settings_read"
on public.posyandu_settings
for select
to authenticated
using (true);

-- Requires profiles.role = 'admin'
-- Assumes public.profiles.id = auth.uid().
drop policy if exists "posyandu_settings_update_admin" on public.posyandu_settings;
create policy "posyandu_settings_update_admin"
on public.posyandu_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "posyandu_settings_insert_admin" on public.posyandu_settings;
create policy "posyandu_settings_insert_admin"
on public.posyandu_settings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
