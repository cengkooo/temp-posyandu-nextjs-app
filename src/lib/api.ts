import { createClient } from './supabase'
import type { 
  AnnouncementInsert, 
  ScheduleInsert, 
  Profile,
  Patient,
  PatientInsert,
  PatientUpdate,
  Visit,
  VisitInsert,
  PatientExtendedDataInsert,
  PatientExtendedDataUpdate
} from '@/types'

type VisitWithRelations = Visit & {
  patient: Patient
  profile?: Profile | null
}

// Announcements
export async function getPublishedAnnouncements() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function createAnnouncement(announcement: AnnouncementInsert) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcement)
    .select()
    .single()
  
  return { data, error }
}

// Schedules
export async function getUpcomingSchedules() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
  
  return { data, error }
}

// Gallery
export async function getGalleryImages(limit = 12) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

// Patients
export async function getPatients() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function getPatientById(id: string): Promise<{ data: Patient | null; error: any }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

export async function getPatientWithVisits(id: string) {
  const supabase = createClient()
  
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  
  if (patientError || !patient) return { data: null, error: patientError }
  
  const { data: visits, error: visitsError } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', id)
    .order('visit_date', { ascending: false })
  
  return { 
    data: { ...patient, visits: visits || [] }, 
    error: visitsError 
  }
}

export async function createPatient(patient: PatientInsert): Promise<{ data: Patient | null; error: any }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single()
  
  return { data, error }
}

export async function updatePatient(id: string, updates: PatientUpdate) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deletePatient(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)
  
  return { error }
}

export async function searchPatients(query: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .or(`full_name.ilike.%${query}%,nik.ilike.%${query}%`)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function filterPatients(filters: {
  type?: 'bayi' | 'balita' | 'ibu_hamil' | 'remaja_dewasa' | 'lansia'
  gender?: 'L' | 'P'
}) {
  const supabase = createClient()
  
  let query = supabase
    .from('patients')
    .select('*')
  
  if (filters.type) {
    query = query.eq('patient_type', filters.type)
  }
  
  if (filters.gender) {
    query = query.eq('gender', filters.gender)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  return { data, error }
}

// Visits
export async function getAllVisits() {
  const supabase = createClient()
  
  const { data: visits, error: visitsError } = await supabase
    .from('visits')
    .select('*')
    .order('visit_date', { ascending: false })

  if (visitsError || !visits) return { data: null, error: visitsError }
  if (visits.length === 0) return { data: [] as VisitWithRelations[], error: null }

  const patientIds = Array.from(new Set(visits.map((v) => v.patient_id)))
  const createdByIds = Array.from(
    new Set(visits.map((v) => v.created_by).filter(Boolean) as string[])
  )

  const [{ data: patients, error: patientsError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase.from('patients').select('*').in('id', patientIds),
      createdByIds.length
        ? supabase.from('profiles').select('*').in('id', createdByIds)
        : Promise.resolve({ data: [] as Profile[], error: null }),
    ])

  const patientMap = new Map((patients ?? []).map((p) => [p.id, p]))
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const combined = visits
    .map((visit) => {
      const patient = patientMap.get(visit.patient_id)
      if (!patient) return null
      return {
        ...visit,
        patient,
        profile: visit.created_by ? profileMap.get(visit.created_by) ?? null : null,
      } satisfies VisitWithRelations
    })
    .filter(Boolean) as VisitWithRelations[]

  return { data: combined, error: visitsError || patientsError || profilesError }
}

export async function getVisitById(id: string) {
  const supabase = createClient()
  
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select('*')
    .eq('id', id)
    .single()

  if (visitError || !visit) return { data: null, error: visitError }

  const [{ data: patient, error: patientError }, { data: profile, error: profileError }] =
    await Promise.all([
      supabase.from('patients').select('*').eq('id', visit.patient_id).single(),
      visit.created_by
        ? supabase.from('profiles').select('*').eq('id', visit.created_by).maybeSingle()
        : Promise.resolve({ data: null as Profile | null, error: null }),
    ])

  if (patientError || !patient) return { data: null, error: patientError }

  const combined: VisitWithRelations = {
    ...visit,
    patient,
    profile: profile ?? null,
  }

  return { data: combined, error: visitError || patientError || profileError }
}

export async function getPatientVisits(patientId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false })
  
  return { data, error }
}

export async function createVisit(visit: VisitInsert) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('visits')
    .insert(visit)
    .select()
    .single()
  
  return { data, error }
}

export async function updateVisit(id: string, updates: any) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('visits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

export async function deleteVisit(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('visits')
    .delete()
    .eq('id', id)
  
  return { error }
}

export async function searchVisits(query: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      patient:patients(*)
    `)
    .or(`patient.full_name.ilike.%${query}%,visit_date.ilike.%${query}%`)
    .order('visit_date', { ascending: false })
  
  return { data, error }
}

export async function getRecentVisits(limit = 10) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      patient:patients(*)
    `)
    .order('visit_date', { ascending: false })
    .limit(limit)
  
  return { data, error }
}

// Patient Extended Data Functions
export async function getPatientExtendedData(patientId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patient_extended_data')
    .select('*')
    .eq('patient_id', patientId)
    .single()
  
  return { data, error }
}

export async function createPatientExtendedData(extendedData: PatientExtendedDataInsert) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patient_extended_data')
    .insert(extendedData)
    .select()
    .single()
  
  return { data, error }
}

export async function updatePatientExtendedData(patientId: string, updates: PatientExtendedDataUpdate) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patient_extended_data')
    .update(updates)
    .eq('patient_id', patientId)
    .select()
    .single()
  
  return { data, error }
}

export async function getPatientWithExtendedData(patientId: string) {
  const supabase = createClient()
  
  const { data: patient, error: patientError } = await getPatientById(patientId)
  if (patientError || !patient) return { data: null, error: patientError }
  
  const { data: extendedData } = await getPatientExtendedData(patientId)
  
  return {
    data: {
      ...patient,
      extended_data: extendedData || null
    },
    error: null
  }
}