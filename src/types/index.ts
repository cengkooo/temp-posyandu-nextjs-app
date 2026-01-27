import { Database } from './database.types'

// Table row types
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Schedule = Database['public']['Tables']['schedules']['Row']
export type Gallery = Database['public']['Tables']['gallery']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Patient = Database['public']['Tables']['patients']['Row']
export type Visit = Database['public']['Tables']['visits']['Row']
export type Immunization = Database['public']['Tables']['immunizations']['Row']
export type Pregnancy = Database['public']['Tables']['pregnancies']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type PatientExtendedData = Database['public']['Tables']['patient_extended_data']['Row']

// Insert types (untuk create)
export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert']
export type ScheduleInsert = Database['public']['Tables']['schedules']['Insert']
export type GalleryInsert = Database['public']['Tables']['gallery']['Insert']
export type PatientInsert = Database['public']['Tables']['patients']['Insert']
export type VisitInsert = Database['public']['Tables']['visits']['Insert']
export type ImmunizationInsert = Database['public']['Tables']['immunizations']['Insert']
export type PregnancyInsert = Database['public']['Tables']['pregnancies']['Insert']
export type PatientExtendedDataInsert = Database['public']['Tables']['patient_extended_data']['Insert']

// Update types (untuk update)
export type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update']
export type ScheduleUpdate = Database['public']['Tables']['schedules']['Update']
export type GalleryUpdate = Database['public']['Tables']['gallery']['Update']
export type PatientUpdate = Database['public']['Tables']['patients']['Update']
export type VisitUpdate = Database['public']['Tables']['visits']['Update']
export type ImmunizationUpdate = Database['public']['Tables']['immunizations']['Update']
export type PregnancyUpdate = Database['public']['Tables']['pregnancies']['Update']
export type PatientExtendedDataUpdate = Database['public']['Tables']['patient_extended_data']['Update']

// Enums
export type UserRole = 'admin' | 'kader'
export type AnnouncementType = 'info' | 'schedule' | 'event'
export type Gender = 'L' | 'P'
export type PatientType = 'bayi' | 'balita' | 'ibu_hamil' | 'remaja_dewasa' | 'lansia'
export type PregnancyStatus = 'ongoing' | 'completed' | 'miscarriage'

// Extended types dengan relasi
export type PatientWithVisits = Patient & {
  visits: Visit[]
}

export type PatientWithImmunizations = Patient & {
  immunizations: Immunization[]
}

export type PatientWithExtendedData = Patient & {
  extended_data: PatientExtendedData | null
}

export type PatientFull = Patient & {
  visits: Visit[]
  extended_data: PatientExtendedData | null
  immunizations: Immunization[]
}

export type VisitWithPatient = Visit & {
  patient: Patient
}

export type VisitWithPatientAndProfile = Visit & {
  patient: Patient
  profile?: Profile
}

export type ImmunizationWithPatient = Immunization & {
  patient: Patient
}

// Stats types
export type PatientStats = {
  total: number
  bayi: number
  balita: number
  ibu_hamil: number
  remaja_dewasa: number
  lansia: number
}

export type VisitStats = {
  total: number
  thisMonth: number
  thisWeek: number
}

// Reporting types
export type ReportType = 'kunjungan' | 'imunisasi' | 'lengkap'

export type Statistics = {
  totalVisits: number
  totalVisitsTrend: number
  newPatients: number
  newPatientsTrend: number
  immunizationCoverage: number
  immunizationCoverageTrend: number
  totalBalita: number
  totalBalitaTrend: number
}

export type VisitTrend = {
  month: string
  bayi: number
  balita: number
  ibu_hamil: number
  remaja_dewasa: number
  lansia: number
  total: number
}

export type IbuHamilStats = {
  totalIbuHamil: number
  risikoTinggi: number
  trimester1: number
  trimester2: number
  trimester3: number
}

export type NutritionalStatus = {
  status: 'Gizi Baik' | 'Gizi Kurang' | 'Gizi Buruk' | 'Stunting'
  count: number
  percentage: number
  color: string
}

export type ImmunizationCoverage = {
  vaccine: string
  actual: number
  target: number
  percentage: number
}

export type BreakdownRow = {
  category: string
  patientCount: number
  visitCount: number
  averagePerMonth: number
  trend: number
}