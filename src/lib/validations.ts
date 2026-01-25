import { z } from 'zod'

// Patient form validation schema
export const patientFormSchema = z.object({
  full_name: z.string()
    .min(3, 'Nama lengkap minimal 3 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter')
    .regex(/^[a-zA-Z\s]+$/, 'Nama hanya boleh mengandung huruf dan spasi'),
  
  nik: z.string()
    .regex(/^\d{16}$/, 'NIK harus 16 digit angka')
    .optional()
    .or(z.literal('')),
  
  date_of_birth: z.string()
    .min(1, 'Tanggal lahir wajib diisi'),
  
  gender: z.enum(['L', 'P'], { 
    message: 'Jenis kelamin wajib dipilih' 
  }),
  
  address: z.string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid (contoh: 081234567890)')
    .optional()
    .or(z.literal('')),
  
  patient_type: z.enum(['bayi', 'balita', 'ibu_hamil', 'remaja_dewasa', 'lansia'], { 
    message: 'Tipe pasien wajib dipilih' 
  }),
  
  parent_name: z.string()
    .max(100, 'Nama orang tua maksimal 100 karakter')
    .optional()
    .or(z.literal('')),
})

export type PatientFormData = z.infer<typeof patientFormSchema>

// Visit form validation schema
export const visitFormSchema = z.object({
  patient_id: z.string().uuid('ID pasien tidak valid'),
  visit_date: z.string().min(1, 'Tanggal kunjungan wajib diisi'),
  weight: z.number().positive('Berat badan harus lebih dari 0').optional(),
  height: z.number().positive('Tinggi badan harus lebih dari 0').optional(),
  head_circumference: z.number().positive('Lingkar kepala harus lebih dari 0').optional(),
  arm_circumference: z.number().positive('Lingkar lengan harus lebih dari 0').optional(),
  blood_pressure: z.string().optional(),
  notes: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
})

export type VisitFormData = z.infer<typeof visitFormSchema>
