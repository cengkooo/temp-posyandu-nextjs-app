import { z } from 'zod'

export const visitSchema = z.object({
  patient_id: z.string().uuid({ message: 'Pilih pasien terlebih dahulu' }),
  visit_date: z.string().refine(
    (date) => {
      const visitDate = new Date(date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return visitDate <= today
    },
    { message: 'Tanggal kunjungan tidak boleh di masa depan' }
  ),
  weight: z.number()
    .positive({ message: 'Berat badan harus lebih dari 0' })
    .max(500, { message: 'Berat badan maksimal 500 kg' })
    .nullable()
    .optional(),
  height: z.number()
    .positive({ message: 'Tinggi badan harus lebih dari 0' })
    .max(300, { message: 'Tinggi badan maksimal 300 cm' })
    .nullable()
    .optional(),
  head_circumference: z.number()
    .positive({ message: 'Lingkar kepala harus lebih dari 0' })
    .max(100, { message: 'Lingkar kepala maksimal 100 cm' })
    .nullable()
    .optional(),
  arm_circumference: z.number()
    .positive({ message: 'Lingkar lengan harus lebih dari 0' })
    .max(100, { message: 'Lingkar lengan maksimal 100 cm' })
    .nullable()
    .optional(),
  blood_pressure: z.string()
    .regex(/^\d{2,3}\/\d{2,3}$/, { message: 'Format tekanan darah harus xxx/xx (contoh: 120/80)' })
    .nullable()
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .min(10, { message: 'Catatan pemeriksaan minimal 10 karakter' })
    .nullable()
    .optional(),
  complaints: z.string().nullable().optional(),
  recommendations: z.string().nullable().optional(),
})

export type VisitFormData = z.infer<typeof visitSchema>
