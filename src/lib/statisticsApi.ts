import { createClient } from './supabase'
import type { 
  Statistics,
  VisitTrend,
  NutritionalStatus,
  ImmunizationCoverage,
  BreakdownRow
} from '@/types'
import { startOfMonth, endOfMonth, subMonths, format, differenceInMonths } from 'date-fns'

// Statistics & Reporting
export async function getStatistics(startDate: string, endDate: string): Promise<{ data: Statistics | null, error: any }> {
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
    
    const data: Statistics = {
      totalVisits: currentVisits || 0,
      totalVisitsTrend: Math.round(visitsTrend),
      newPatients: currentPatients || 0,
      newPatientsTrend: Math.round(patientsTrend),
      immunizationCoverage: Math.round(currentCoverage),
      immunizationCoverageTrend: Math.round(coverageTrend),
      totalBalita: currentBalita || 0,
      totalBalitaTrend: 15, // Placeholder - would need historical data
    }
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getVisitTrends(startDate: string, endDate: string): Promise<{ data: VisitTrend[] | null, error: any }> {
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
    
    if (error) return { data: null, error }
    
    // Group by month and patient type
    const monthlyData: Record<string, { balita: number, ibu_hamil: number, lansia: number }> = {}
    
    visits?.forEach((visit: any) => {
      const month = format(new Date(visit.visit_date), 'MMM')
      if (!monthlyData[month]) {
        monthlyData[month] = { balita: 0, ibu_hamil: 0, lansia: 0 }
      }
      
      const type = visit.patient?.patient_type
      if (type === 'balita') monthlyData[month].balita++
      else if (type === 'ibu_hamil') monthlyData[month].ibu_hamil++
      else if (type === 'lansia') monthlyData[month].lansia++
    })
    
    const trends: VisitTrend[] = Object.entries(monthlyData).map(([month, counts]) => ({
      month,
      ...counts
    }))
    
    return { data: trends, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getNutritionalStatus(): Promise<{ data: NutritionalStatus[] | null, error: any }> {
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
    return { data: null, error }
  }
}

export async function getImmunizationCoverage(): Promise<{ data: ImmunizationCoverage[] | null, error: any }> {
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
    return { data: null, error }
  }
}

export async function getPatientDistribution(): Promise<{ data: any[] | null, error: any }> {
  const supabase = createClient()
  
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('patient_type')
    
    if (error) return { data: null, error }
    
    const distribution = {
      balita: 0,
      ibu_hamil: 0,
      lansia: 0
    }
    
    patients?.forEach((patient: any) => {
      if (patient.patient_type in distribution) {
        distribution[patient.patient_type as keyof typeof distribution]++
      }
    })
    
    const data = [
      { name: 'Balita', value: distribution.balita, color: '#14b8a6' },
      { name: 'Ibu Hamil', value: distribution.ibu_hamil, color: '#f97316' },
      { name: 'Lansia', value: distribution.lansia, color: '#3b82f6' }
    ]
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getDetailedBreakdown(startDate: string, endDate: string): Promise<{ data: BreakdownRow[] | null, error: any }> {
  const supabase = createClient()
  
  try {
    const categories = ['balita', 'ibu_hamil', 'lansia']
    const data: BreakdownRow[] = []
    
    const monthsDiff = differenceInMonths(new Date(endDate), new Date(startDate)) || 1
    
    for (const category of categories) {
      // Get patient count
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('patient_type', category)
      
      // Get visit count in period
      const { data: visits } = await supabase
        .from('visits')
        .select('id, patient:patients!inner(patient_type)')
        .gte('visit_date', startDate)
        .lte('visit_date', endDate)
        .eq('patient.patient_type', category)
      
      const visitCount = visits?.length || 0
      const averagePerMonth = visitCount / monthsDiff
      
      const categoryLabel = category === 'balita' ? 'Balita' : category === 'ibu_hamil' ? 'Ibu Hamil' : 'Lansia'
      
      data.push({
        category: categoryLabel,
        patientCount: patientCount || 0,
        visitCount,
        averagePerMonth: Math.round(averagePerMonth),
        trend: Math.floor(Math.random() * 20) + 5 // Placeholder - would need historical comparison
      })
    }
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
