-- Dashboard & reporting performance helpers
-- Adds aggregate SQL functions + helpful indexes to avoid N+1 queries.

-- Latest visit per balita patient, classified into simple nutrition buckets.
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

-- Monthly visit counts by patient_type (for charts).
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

-- Helpful indexes for common dashboard/report queries.
create index if not exists visits_visit_date_idx
  on public.visits (visit_date);

create index if not exists visits_patient_id_visit_date_desc_idx
  on public.visits (patient_id, visit_date desc);

create index if not exists patients_patient_type_idx
  on public.patients (patient_type);

create index if not exists patients_created_at_idx
  on public.patients (created_at);

create index if not exists immunizations_next_schedule_idx
  on public.immunizations (next_schedule)
  where next_schedule is not null;
