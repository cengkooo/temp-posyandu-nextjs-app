import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()
    const { patients } = body

    if (!patients || !Array.isArray(patients) || patients.length === 0) {
      return NextResponse.json(
        { error: 'Data pasien tidak valid' },
        { status: 400 }
      )
    }

    // Validate required fields
    for (const patient of patients) {
      if (!patient.full_name || !patient.nik || !patient.date_of_birth || !patient.gender || !patient.patient_type) {
        return NextResponse.json(
          { error: 'Data tidak lengkap. Pastikan semua field required terisi.' },
          { status: 400 }
        )
      }
    }

    // Get current user for created_by field
    const { data: { user } } = await supabase.auth.getUser()

    // Prepare data with created_by
    const patientsData = patients.map(patient => ({
      ...patient,
      created_by: user?.id || null,
      created_at: new Date().toISOString(),
    }))

    // Insert all patients
    const { data, error } = await supabase
      .from('patients')
      .insert(patientsData)
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Gagal menyimpan data ke database', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `${data.length} pasien berhasil diimpor`,
      data 
    })
  } catch (error) {
    console.error('Error batch insert patients:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Gagal memproses data', details: errorMessage },
      { status: 500 }
    )
  }
}
