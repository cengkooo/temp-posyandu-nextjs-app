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
          patient_type: 'bayi' | 'balita' | 'ibu_hamil' | 'remaja_dewasa' | 'lansia'
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
          patient_type: 'bayi' | 'balita' | 'ibu_hamil' | 'remaja_dewasa' | 'lansia'
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
          patient_type?: 'bayi' | 'balita' | 'ibu_hamil' | 'remaja_dewasa' | 'lansia'
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
          complaints: string | null
          recommendations: string | null
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
          complaints?: string | null
          recommendations?: string | null
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
          complaints?: string | null
          recommendations?: string | null
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
      patient_extended_data: {
        Row: {
          id: string
          patient_id: string
          weight: number | null
          height: number | null
          head_circumference: number | null
          arm_circumference: number | null
          waist_circumference: number | null
          measurement_date: string | null
          asi_exclusive: 'ya' | 'tidak' | 'berlangsung' | null
          asi_duration_months: number | null
          mpasi_started: boolean | null
          mpasi_age_months: number | null
          mpasi_types: string | null
          immunizations: Json | null
          vitamin_a_given: boolean | null
          vitamin_a_date: string | null
          ispa_history: boolean | null
          ispa_last_date: string | null
          diare_history: boolean | null
          diare_last_date: string | null
          other_illness: string | null
          pregnancy_week: number | null
          usg_count: number | null
          pregnancy_risk_level: 'rendah' | 'sedang' | 'tinggi' | null
          ttd_received: number | null
          ttd_compliance: 'rutin' | 'kadang' | 'tidak' | null
          occupation: string | null
          marital_status: string | null
          smoking_status: 'tidak_pernah' | 'pernah' | 'aktif' | null
          cigarettes_per_day: number | null
          physical_activity: 'kurang' | 'cukup' | 'sangat' | null
          activity_minutes_per_week: number | null
          vegetable_portions_per_day: number | null
          fruit_portions_per_day: number | null
          blood_sugar_random: number | null
          blood_sugar_fasting: number | null
          cholesterol_total: number | null
          cholesterol_ldl: number | null
          cholesterol_hdl: number | null
          triglycerides: number | null
          uric_acid: number | null
          adl_score: number | null
          iadl_score: number | null
          cognitive_status: string | null
          chronic_diseases: Json | null
          current_medications: Json | null
          special_notes: string | null
          education_given: Json | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          weight?: number | null
          height?: number | null
          head_circumference?: number | null
          arm_circumference?: number | null
          waist_circumference?: number | null
          measurement_date?: string | null
          asi_exclusive?: 'ya' | 'tidak' | 'berlangsung' | null
          asi_duration_months?: number | null
          mpasi_started?: boolean | null
          mpasi_age_months?: number | null
          mpasi_types?: string | null
          immunizations?: Json | null
          vitamin_a_given?: boolean | null
          vitamin_a_date?: string | null
          ispa_history?: boolean | null
          ispa_last_date?: string | null
          diare_history?: boolean | null
          diare_last_date?: string | null
          other_illness?: string | null
          pregnancy_week?: number | null
          usg_count?: number | null
          pregnancy_risk_level?: 'rendah' | 'sedang' | 'tinggi' | null
          ttd_received?: number | null
          ttd_compliance?: 'rutin' | 'kadang' | 'tidak' | null
          occupation?: string | null
          marital_status?: string | null
          smoking_status?: 'tidak_pernah' | 'pernah' | 'aktif' | null
          cigarettes_per_day?: number | null
          physical_activity?: 'kurang' | 'cukup' | 'sangat' | null
          activity_minutes_per_week?: number | null
          vegetable_portions_per_day?: number | null
          fruit_portions_per_day?: number | null
          blood_sugar_random?: number | null
          blood_sugar_fasting?: number | null
          cholesterol_total?: number | null
          cholesterol_ldl?: number | null
          cholesterol_hdl?: number | null
          triglycerides?: number | null
          uric_acid?: number | null
          adl_score?: number | null
          iadl_score?: number | null
          cognitive_status?: string | null
          chronic_diseases?: Json | null
          current_medications?: Json | null
          special_notes?: string | null
          education_given?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          weight?: number | null
          height?: number | null
          head_circumference?: number | null
          arm_circumference?: number | null
          waist_circumference?: number | null
          measurement_date?: string | null
          asi_exclusive?: 'ya' | 'tidak' | 'berlangsung' | null
          asi_duration_months?: number | null
          mpasi_started?: boolean | null
          mpasi_age_months?: number | null
          mpasi_types?: string | null
          immunizations?: Json | null
          vitamin_a_given?: boolean | null
          vitamin_a_date?: string | null
          ispa_history?: boolean | null
          ispa_last_date?: string | null
          diare_history?: boolean | null
          diare_last_date?: string | null
          other_illness?: string | null
          pregnancy_week?: number | null
          usg_count?: number | null
          pregnancy_risk_level?: 'rendah' | 'sedang' | 'tinggi' | null
          ttd_received?: number | null
          ttd_compliance?: 'rutin' | 'kadang' | 'tidak' | null
          occupation?: string | null
          marital_status?: string | null
          smoking_status?: 'tidak_pernah' | 'pernah' | 'aktif' | null
          cigarettes_per_day?: number | null
          physical_activity?: 'kurang' | 'cukup' | 'sangat' | null
          activity_minutes_per_week?: number | null
          vegetable_portions_per_day?: number | null
          fruit_portions_per_day?: number | null
          blood_sugar_random?: number | null
          blood_sugar_fasting?: number | null
          cholesterol_total?: number | null
          cholesterol_ldl?: number | null
          cholesterol_hdl?: number | null
          triglycerides?: number | null
          uric_acid?: number | null
          adl_score?: number | null
          iadl_score?: number | null
          cognitive_status?: string | null
          chronic_diseases?: Json | null
          current_medications?: Json | null
          special_notes?: string | null
          education_given?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type _AddRelationships<T> = T extends {
  Row: infer R
  Insert: infer I
  Update: infer U
}
  ? {
      Row: R
      Insert: I
      Update: U
      Relationships: []
    }
  : T

// Supabase JS expects each table to include `Relationships` (even if empty).
// Keep `Database` as the app-facing type, and use `SupabaseDatabase` for the client.
export type SupabaseDatabase = {
  public: {
    Tables: {
      [K in keyof Database['public']['Tables']]: _AddRelationships<
        Database['public']['Tables'][K]
      >
    }
    Views: Database['public']['Views']
    Functions: Database['public']['Functions']
    Enums: Database['public']['Enums']
    CompositeTypes: Database['public']['CompositeTypes']
  }
}