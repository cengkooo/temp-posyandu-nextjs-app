/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from './supabase'
import type { 
  Statistics,
  VisitTrend,
  NutritionalStatus,
  ImmunizationCoverage,
  BreakdownRow,
  IbuHamilStats
} from '@/types'
import { subMonths, format, differenceInMonths } from 'date-fns'

const PATIENT_TYPES = ['bayi', 'balita', 'ibu_hamil', 'remaja_dewasa', 'lansia'] as const
type PatientTypeKey = typeof PATIENT_TYPES[number]

function percentTrend(current: number, previous: number) {
  if (!previous || previous <= 0) return 0
  return ((current - previous) / previous) * 100
}

// Statistics & Reporting
export async function getStatistics(startDate: string, endDate: string): Promise<{ data: Statistics | null, error: Error | null }> {
  const supabase = createClient()
  
  // Calculate previous period for trend comparison
  const start = new Date(startDate)
  const end = new Date(endDate)
  const periodLength = differenceInMonths(end, start) || 1
  const prevStart = format(subMonths(start, periodLength), 'yyyy-MM-dd')
  const prevEnd = format(subMonths(end, periodLength), 'yyyy-MM-dd')
  
  try {
    // Total Visits - Current Period
    const { count: currentVisits } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('visit_date', startDate)
      .lte('visit_date', endDate)
    
    // Total Visits - Previous Period
    const { count: prevVisits } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('visit_date', prevStart)
      .lte('visit_date', prevEnd)
    
    // New Patients - Current Period
    const { count: currentPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate)
      .lte('created_at', endDate)
    
    // New Patients - Previous Period
    const { count: prevPatients } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', prevStart)
      .lte('created_at', prevEnd)
    
    // Immunization Coverage - Current Period
    const { data: balitaPatients } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_type', 'balita')
    
    const balitaCount = balitaPatients?.length || 0
    
    const { count: immunizedCount } = await supabase
      .from('immunizations')
      .select('patient_id', { count: 'exact', head: true })
      .gte('vaccine_date', startDate)
      .lte('vaccine_date', endDate)
    
    const currentCoverage = balitaCount > 0 ? ((immunizedCount || 0) / balitaCount) * 100 : 0
    
    // Immunization Coverage - Previous Period
    const { count: prevImmunizedCount } = await supabase
      .from('immunizations')
      .select('patient_id', { count: 'exact', head: true })
      .gte('vaccine_date', prevStart)
      .lte('vaccine_date', prevEnd)
    
    const prevCoverage = balitaCount > 0 ? ((prevImmunizedCount || 0) / balitaCount) * 100 : 0
    
    // Total Balita - Current
    const { count: currentBalita } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('patient_type', 'balita')

    // New Balita - Current Period (for trend approximation)
    const { count: currentNewBalita } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('patient_type', 'balita')
      .gte('created_at', startDate)
      .lte('created_at', endDate)

    // New Balita - Previous Period
    const { count: prevNewBalita } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('patient_type', 'balita')
      .gte('created_at', prevStart)
      .lte('created_at', prevEnd)
    
    // Calculate trends
    const visitsTrend = prevVisits && prevVisits > 0 
      ? ((currentVisits || 0) - prevVisits) / prevVisits * 100 
      : 0
    
    const patientsTrend = prevPatients && prevPatients > 0
      ? ((currentPatients || 0) - prevPatients) / prevPatients * 100
      : 0
    
    const coverageTrend = prevCoverage > 0
      ? currentCoverage - prevCoverage
      : 0
    
    const balitaTrend = percentTrend(currentNewBalita || 0, prevNewBalita || 0)

    const data: Statistics = {
      totalVisits: currentVisits || 0,
      totalVisitsTrend: Math.round(visitsTrend),
      newPatients: currentPatients || 0,
      newPatientsTrend: Math.round(patientsTrend),
      immunizationCoverage: Math.round(currentCoverage),
      immunizationCoverageTrend: Math.round(coverageTrend),
      totalBalita: currentBalita || 0,
      totalBalitaTrend: Math.round(balitaTrend),
    }
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getVisitTrends(startDate: string, endDate: string): Promise<{ data: VisitTrend[] | null, error: Error | null }> {
  const supabase = createClient()
  
  try {
    const { data: visits, error } = await supabase
      .from('visits')
      .select(`
        visit_date,
        patient:patients(patient_type)
      `)
      .gte('visit_date', startDate)
      .lte('visit_date', endDate)
    
    if (error) return { data: null, error: error as Error }
    
    // Group by month (YYYY-MM) and patient type
    const monthlyData: Record<string, { monthLabel: string } & Record<PatientTypeKey, number>> = {}

    // @ts-expect-error - Supabase relation type issue
    visits?.forEach((visit: { visit_date: string; patient: { patient_type: string } | null }) => {
      const visitDate = new Date(visit.visit_date)
      const key = format(visitDate, 'yyyy-MM')
      const monthLabel = format(visitDate, 'MMM')

      if (!monthlyData[key]) {
        monthlyData[key] = {
          monthLabel,
          bayi: 0,
          balita: 0,
          ibu_hamil: 0,
          remaja_dewasa: 0,
          lansia: 0,
        }
      }

      const type = visit.patient?.patient_type as PatientTypeKey | undefined
      if (type && type in monthlyData[key]) {
        monthlyData[key][type]++
      }
    })

    const trends: VisitTrend[] = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, counts]) => {
        const total =
          counts.bayi +
          counts.balita +
          counts.ibu_hamil +
          counts.remaja_dewasa +
          counts.lansia

        return {
          month: counts.monthLabel,
          bayi: counts.bayi,
          balita: counts.balita,
          ibu_hamil: counts.ibu_hamil,
          remaja_dewasa: counts.remaja_dewasa,
          lansia: counts.lansia,
          total,
        }
      })
    
    return { data: trends, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getNutritionalStatus(): Promise<{ data: NutritionalStatus[] | null, error: Error | null }> {
  const supabase = createClient()
  
  try {
    // Get latest visit for each balita patient
    const { data: balitaPatients, error: patientsError } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_type', 'balita')
    
    if (patientsError) return { data: null, error: patientsError }
    
    const statusCounts = {
      'Gizi Baik': 0,
      'Gizi Kurang': 0,
      'Gizi Buruk': 0,
      'Stunting': 0
    }
    
    let totalBalita = 0
    
    for (const patient of balitaPatients || []) {
      const { data: latestVisit } = await supabase
        .from('visits')
        .select('weight, height')
        .eq('patient_id', patient.id)
        .order('visit_date', { ascending: false })
        .limit(1)
        .single()
      
      if (latestVisit && latestVisit.weight && latestVisit.height) {
        totalBalita++
        // Simple BMI-like calculation (this should use WHO growth charts in production)
        const bmi = latestVisit.weight / ((latestVisit.height / 100) ** 2)
        
        if (bmi >= 18.5) statusCounts['Gizi Baik']++
        else if (bmi >= 16) statusCounts['Gizi Kurang']++
        else if (bmi >= 14) statusCounts['Gizi Buruk']++
        else statusCounts['Stunting']++
      }
    }
    
    const data: NutritionalStatus[] = [
      { status: 'Gizi Baik', count: statusCounts['Gizi Baik'], percentage: totalBalita > 0 ? (statusCounts['Gizi Baik'] / totalBalita) * 100 : 0, color: '#10b981' },
      { status: 'Gizi Kurang', count: statusCounts['Gizi Kurang'], percentage: totalBalita > 0 ? (statusCounts['Gizi Kurang'] / totalBalita) * 100 : 0, color: '#f59e0b' },
      { status: 'Gizi Buruk', count: statusCounts['Gizi Buruk'], percentage: totalBalita > 0 ? (statusCounts['Gizi Buruk'] / totalBalita) * 100 : 0, color: '#ef4444' },
      { status: 'Stunting', count: statusCounts['Stunting'], percentage: totalBalita > 0 ? (statusCounts['Stunting'] / totalBalita) * 100 : 0, color: '#6366f1' }
    ]
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getImmunizationCoverage(): Promise<{ data: ImmunizationCoverage[] | null, error: Error | null }> {
  const supabase = createClient()
  
  try {
    const { data: balitaPatients } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_type', 'balita')
    
    const totalBalita = balitaPatients?.length || 1
    
    // Common vaccines
    const vaccines = ['BCG', 'DPT', 'Polio', 'Campak', 'Hepatitis B']
    
    const data: ImmunizationCoverage[] = []
    
    for (const vaccine of vaccines) {
      const { count } = await supabase
        .from('immunizations')
        .select('*', { count: 'exact', head: true })
        .ilike('vaccine_name', `%${vaccine}%`)
      
      const actual = count || 0
      const percentage = (actual / totalBalita) * 100
      
      data.push({
        vaccine,
        actual,
        target: totalBalita,
        percentage: Math.min(percentage, 100)
      })
    }
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getPatientDistribution(): Promise<{ data: Array<{ name: string; value: number; color: string }> | null, error: Error | null }> {
  const supabase = createClient()
  
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('patient_type')
    
    if (error) return { data: null, error: error as Error }
    
    const distribution: Record<PatientTypeKey, number> = {
      bayi: 0,
      balita: 0,
      ibu_hamil: 0,
      remaja_dewasa: 0,
      lansia: 0,
    }

    patients?.forEach((patient: { patient_type: string }) => {
      const type = patient.patient_type as PatientTypeKey | undefined
      if (type && type in distribution) distribution[type]++
    })

    const data = [
      { name: 'Bayi', value: distribution.bayi, color: '#3B82F6' },
      { name: 'Balita', value: distribution.balita, color: '#06B6D4' },
      { name: 'Ibu Hamil', value: distribution.ibu_hamil, color: '#EC4899' },
      { name: 'Remaja/Dewasa', value: distribution.remaja_dewasa, color: '#8B5CF6' },
      { name: 'Lansia', value: distribution.lansia, color: '#F59E0B' },
    ]
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getDetailedBreakdown(startDate: string, endDate: string): Promise<{ data: BreakdownRow[] | null, error: Error | null }> {
  const supabase = createClient()
  
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const monthsDiff = differenceInMonths(end, start) || 1

    const periodLength = monthsDiff
    const prevStart = format(subMonths(start, periodLength), 'yyyy-MM-dd')
    const prevEnd = format(subMonths(end, periodLength), 'yyyy-MM-dd')

    // Patients by type
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('patient_type')

    if (patientsError) return { data: null, error: patientsError }

    const patientCounts: Record<PatientTypeKey, number> = {
      bayi: 0,
      balita: 0,
      ibu_hamil: 0,
      remaja_dewasa: 0,
      lansia: 0,
    }

    patients?.forEach((p: { patient_type: string }) => {
      const type = p.patient_type as PatientTypeKey | undefined
      if (type && type in patientCounts) patientCounts[type]++
    })

    // Visits by type for current and previous periods
    const [{ data: currentVisits, error: currentVisitsError }, { data: prevVisits, error: prevVisitsError }] = await Promise.all([
      supabase
        .from('visits')
        .select('id, patient:patients(patient_type)')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate),
      supabase
        .from('visits')
        .select('id, patient:patients(patient_type)')
        .gte('visit_date', prevStart)
        .lte('visit_date', prevEnd),
    ])

    if (currentVisitsError) return { data: null, error: currentVisitsError }
    if (prevVisitsError) return { data: null, error: prevVisitsError }

    const currentCounts: Record<PatientTypeKey, number> = {
      bayi: 0,
      balita: 0,
      ibu_hamil: 0,
      remaja_dewasa: 0,
      lansia: 0,
    }
    const prevCounts: Record<PatientTypeKey, number> = {
      bayi: 0,
      balita: 0,
      ibu_hamil: 0,
      remaja_dewasa: 0,
      lansia: 0,
    }

    // @ts-expect-error - Supabase relation type issue
    currentVisits?.forEach((v: { patient: { patient_type: string } | null }) => {
      const type = v.patient?.patient_type as PatientTypeKey | undefined
      if (type && type in currentCounts) currentCounts[type]++
    })
    // @ts-expect-error - Supabase relation type issue
    prevVisits?.forEach((v: { patient: { patient_type: string } | null }) => {
      const type = v.patient?.patient_type as PatientTypeKey | undefined
      if (type && type in prevCounts) prevCounts[type]++
    })

    const labels: Record<PatientTypeKey, string> = {
      bayi: 'Bayi',
      balita: 'Balita',
      ibu_hamil: 'Ibu Hamil',
      remaja_dewasa: 'Remaja/Dewasa',
      lansia: 'Lansia',
    }

    const data: BreakdownRow[] = PATIENT_TYPES.map((type) => {
      const visitCount = currentCounts[type]
      const previousVisitCount = prevCounts[type]
      const averagePerMonth = visitCount / monthsDiff
      const trend = percentTrend(visitCount, previousVisitCount)

      return {
        category: labels[type],
        patientCount: patientCounts[type],
        visitCount,
        averagePerMonth: Math.round(averagePerMonth),
        trend: Math.round(trend),
      }
    })

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getIbuHamilStats(): Promise<{ data: IbuHamilStats | null, error: Error | null }> {
  const supabase = createClient()

  try {
    const { data: ibuHamilPatients, error: patientsError } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_type', 'ibu_hamil')

    if (patientsError) return { data: null, error: patientsError }

    const ids = (ibuHamilPatients || []).map((p: { id: string }) => p.id)

    if (ids.length === 0) {
      return {
        data: {
          totalIbuHamil: 0,
          risikoTinggi: 0,
          trimester1: 0,
          trimester2: 0,
          trimester3: 0,
        },
        error: null,
      }
    }

    const { data: extended, error: extendedError } = await supabase
      .from('patient_extended_data')
      .select('patient_id, pregnancy_week, pregnancy_risk_level')
      .in('patient_id', ids)

    if (extendedError) return { data: null, error: extendedError }

    let trimester1 = 0
    let trimester2 = 0
    let trimester3 = 0
    let risikoTinggi = 0

    extended?.forEach((row: { pregnancy_week: number | null; pregnancy_risk_level: string | null }) => {
      if (row.pregnancy_risk_level === 'tinggi') risikoTinggi++
      const week = row.pregnancy_week
      if (typeof week === 'number') {
        if (week <= 12) trimester1++
        else if (week <= 27) trimester2++
        else trimester3++
      }
    })

    const data: IbuHamilStats = {
      totalIbuHamil: ids.length,
      risikoTinggi,
      trimester1,
      trimester2,
      trimester3,
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
