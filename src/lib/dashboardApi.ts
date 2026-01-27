import { createClient } from './supabase'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import type { NutritionalStatus, VisitTrend } from '@/types'

export type AdminDashboardSummary = {
  totalPatients: number
  visitsThisMonth: number
  immunizationsPending: number
  balitaGiziBuruk: number
}

export type RecentVisitRow = {
  name: string
  type: string
  date: string
  officer: string
  typeColor: string
}

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  bayi: { label: 'Bayi', className: 'text-blue-600 bg-blue-50' },
  balita: { label: 'Balita', className: 'text-teal-600 bg-teal-50' },
  ibu_hamil: { label: 'Ibu Hamil', className: 'text-orange-600 bg-orange-50' },
  remaja_dewasa: { label: 'Remaja/Dewasa', className: 'text-purple-600 bg-purple-50' },
  lansia: { label: 'Lansia', className: 'text-amber-700 bg-amber-50' },
}

export async function getAdminDashboardSummary(nutritionalStatus: NutritionalStatus[]): Promise<{ data: AdminDashboardSummary | null; error: any }> {
  const supabase = createClient()
  try {
    const { count: totalPatients, error: patientsError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    if (patientsError) return { data: null, error: patientsError }

    const start = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const end = format(endOfMonth(new Date()), 'yyyy-MM-dd')

    const { count: visitsThisMonth, error: visitsError } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('visit_date', start)
      .lte('visit_date', end)

    if (visitsError) return { data: null, error: visitsError }

    // Heuristic: consider immunizations "pending" if next_schedule exists and is due today or earlier.
    const today = format(new Date(), 'yyyy-MM-dd')
    const { count: immunizationsPending, error: immunizationsError } = await supabase
      .from('immunizations')
      .select('*', { count: 'exact', head: true })
      .not('next_schedule', 'is', null)
      .lte('next_schedule', today)

    if (immunizationsError) return { data: null, error: immunizationsError }

    const balitaGiziBuruk = nutritionalStatus.find((s) => s.status === 'Gizi Buruk')?.count || 0

    return {
      data: {
        totalPatients: totalPatients || 0,
        visitsThisMonth: visitsThisMonth || 0,
        immunizationsPending: immunizationsPending || 0,
        balitaGiziBuruk,
      },
      error: null,
    }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getDashboardVisitTrends(months: number): Promise<{ data: VisitTrend[] | null; error: any }> {
  const supabase = createClient()
  try {
    const end = new Date()
    const start = subMonths(end, months - 1)
    const startDate = format(startOfMonth(start), 'yyyy-MM-dd')
    const endDate = format(endOfMonth(end), 'yyyy-MM-dd')

    const { data: visits, error } = await supabase
      .from('visits')
      .select('visit_date, patient:patients(patient_type)')
      .gte('visit_date', startDate)
      .lte('visit_date', endDate)

    if (error) return { data: null, error }

    const buckets: Record<string, VisitTrend> = {}

    visits?.forEach((v: any) => {
      const date = new Date(v.visit_date)
      const key = format(date, 'yyyy-MM')
      const label = format(date, 'MMM')
      if (!buckets[key]) {
        buckets[key] = {
          month: label,
          bayi: 0,
          balita: 0,
          ibu_hamil: 0,
          remaja_dewasa: 0,
          lansia: 0,
          total: 0,
        }
      }
      const type = v.patient?.patient_type
      if (type && type in buckets[key]) {
        // @ts-expect-error runtime-safe mapping
        buckets[key][type]++
        buckets[key].total++
      }
    })

    const data = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value)

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getRecentVisits(limit = 5): Promise<{ data: RecentVisitRow[] | null; error: any }> {
  const supabase = createClient()
  try {
    const { data: visits, error } = await supabase
      .from('visits')
      .select('visit_date, created_by, patient:patients(full_name, patient_type)')
      .order('visit_date', { ascending: false })
      .limit(limit)

    if (error) return { data: null, error }

    const creatorIds = Array.from(
      new Set((visits || []).map((v: any) => v.created_by).filter(Boolean))
    )

    const profilesById: Record<string, string> = {}
    if (creatorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds)

      profiles?.forEach((p: any) => {
        profilesById[p.id] = p.full_name || 'Petugas'
      })
    }

    const mapped: RecentVisitRow[] = (visits || []).map((v: any) => {
      const patientType = v.patient?.patient_type || 'balita'
      const badge = TYPE_BADGE[patientType] || { label: String(patientType), className: 'text-gray-700 bg-gray-50' }
      return {
        name: v.patient?.full_name || '-',
        type: badge.label,
        date: v.visit_date ? format(new Date(v.visit_date), 'dd MMM yyyy') : '-',
        officer: v.created_by ? (profilesById[v.created_by] || '-') : '-',
        typeColor: badge.className,
      }
    })

    return { data: mapped, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
