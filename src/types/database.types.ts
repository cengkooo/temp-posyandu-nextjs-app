export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: 'info' | 'schedule' | 'event'
          published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          type?: 'info' | 'schedule' | 'event'
          published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: 'info' | 'schedule' | 'event'
          published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          time: string | null
          location: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          time?: string | null
          location?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          time?: string | null
          location?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gallery: {
        Row: {
          id: string
          title: string | null
          description: string | null
          image_url: string
          consent_obtained: boolean
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          image_url: string
          consent_obtained?: boolean
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          image_url?: string
          consent_obtained?: boolean
          uploaded_by?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'admin' | 'kader'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'admin' | 'kader'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'admin' | 'kader'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          full_name: string
          nik: string | null
          date_of_birth: string
          gender: 'L' | 'P'
          address: string | null
          phone: string | null
          patient_type: 'balita' | 'ibu_hamil' | 'lansia'
          parent_name: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          nik?: string | null
          date_of_birth: string
          gender: 'L' | 'P'
          address?: string | null
          phone?: string | null
          patient_type: 'balita' | 'ibu_hamil' | 'lansia'
          parent_name?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          nik?: string | null
          date_of_birth?: string
          gender?: 'L' | 'P'
          address?: string | null
          phone?: string | null
          patient_type?: 'balita' | 'ibu_hamil' | 'lansia'
          parent_name?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      visits: {
        Row: {
          id: string
          patient_id: string
          visit_date: string
          weight: number | null
          height: number | null
          head_circumference: number | null
          arm_circumference: number | null
          blood_pressure: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          visit_date: string
          weight?: number | null
          height?: number | null
          head_circumference?: number | null
          arm_circumference?: number | null
          blood_pressure?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          visit_date?: string
          weight?: number | null
          height?: number | null
          head_circumference?: number | null
          arm_circumference?: number | null
          blood_pressure?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      immunizations: {
        Row: {
          id: string
          patient_id: string
          vaccine_name: string
          vaccine_date: string
          next_schedule: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          vaccine_name: string
          vaccine_date: string
          next_schedule?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          vaccine_name?: string
          vaccine_date?: string
          next_schedule?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      pregnancies: {
        Row: {
          id: string
          patient_id: string
          pregnancy_order: number | null
          estimated_due_date: string | null
          status: 'ongoing' | 'completed' | 'miscarriage'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          pregnancy_order?: number | null
          estimated_due_date?: string | null
          status?: 'ongoing' | 'completed' | 'miscarriage'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          pregnancy_order?: number | null
          estimated_due_date?: string | null
          status?: 'ongoing' | 'completed' | 'miscarriage'
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          changes: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          changes?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}