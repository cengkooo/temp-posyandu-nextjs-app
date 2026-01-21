import { createClient } from './supabase'
import type { 
  AnnouncementInsert, 
  ScheduleInsert, 
  PatientInsert,
  PatientUpdate,
  VisitInsert 
} from '@/types'

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

export async function getPatientById(id: string) {
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

export async function createPatient(patient: PatientInsert) {
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
  type?: 'balita' | 'ibu_hamil' | 'lansia'
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
  
  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      patient:patients(*),
      profile:profiles(*)
    `)
    .order('visit_date', { ascending: false })
  
  return { data, error }
}

export async function getVisitById(id: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      patient:patients(*),
      profile:profiles(*)
    `)
    .eq('id', id)
    .single()
  
  return { data, error }
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