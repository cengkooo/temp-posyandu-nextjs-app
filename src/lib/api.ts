import { createClient } from './supabase'
import type { 
  AnnouncementInsert, 
  ScheduleInsert, 
  PatientInsert,
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

export async function createPatient(patient: PatientInsert) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single()
  
  return { data, error }
}

// Visits
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