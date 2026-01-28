import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Patient, Immunization } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'tracking' or 'coverage'
    const patientId = searchParams.get('patient_id') // for patient history

    if (patientId) {
      return await getPatientImmunizationHistory(supabase, patientId)
    }

    if (type === 'tracking') {
      return await getImmunizationTracking(supabase)
    } else if (type === 'coverage') {
      return await getImmunizationCoverage(supabase)
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching immunization data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('Error details:', errorMessage, errorStack)
    return NextResponse.json(
      { error: 'Failed to fetch immunization data', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()

    const { patient_id, vaccine_name, vaccine_date, next_schedule, notes } = body

    // Validasi
    if (!patient_id || !vaccine_name || !vaccine_date) {
      return NextResponse.json(
        { error: 'patient_id, vaccine_name, and vaccine_date are required' },
        { status: 400 }
      )
    }

    // Insert data ke database
    const { data, error } = await supabase
      .from('immunizations')
      .insert({
        patient_id,
        vaccine_name,
        vaccine_date,
        next_schedule: next_schedule || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error saving immunization:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to save immunization', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const body = await request.json()

    const { id, patient_id, vaccine_name, vaccine_date, next_schedule, notes } = body

    // Validasi
    if (!id || !patient_id || !vaccine_name || !vaccine_date) {
      return NextResponse.json(
        { error: 'id, patient_id, vaccine_name, and vaccine_date are required' },
        { status: 400 }
      )
    }

    // Update data di database
    const { data, error } = await supabase
      .from('immunizations')
      .update({
        vaccine_name,
        vaccine_date,
        next_schedule: next_schedule || null,
        notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating immunization:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update immunization', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    // Validasi
    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // Hapus data dari database
    const { error } = await supabase
      .from('immunizations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return NextResponse.json({ success: true, message: 'Immunization record deleted successfully' })
  } catch (error) {
    console.error('Error deleting immunization:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to delete immunization', details: errorMessage },
      { status: 500 }
    )
  }
}

// Get patient immunization history
async function getPatientImmunizationHistory(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  patientId: string
) {
  try {
    const { data, error } = await supabase
      .from('immunizations')
      .select('*')
      .eq('patient_id', patientId)
      .order('vaccine_date', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching patient immunization history:', error)
    throw error
  }
}

// Get immunization tracking data for patients
async function getImmunizationTracking(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  try {
    // Fetch all patients with type bayi or balita
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .in('patient_type', ['bayi', 'balita'])
      .order('created_at', { ascending: false })

    if (patientsError) {
      console.error('Error fetching patients:', patientsError)
      throw patientsError
    }

    console.log('Fetched patients:', patients?.length)

    // Fetch all immunizations
    const { data: immunizations, error: immunizationsError } = await supabase
      .from('immunizations')
      .select('*')
      .order('vaccine_date', { ascending: false })

    if (immunizationsError) {
      console.error('Error fetching immunizations:', immunizationsError)
      throw immunizationsError
    }

    console.log('Fetched immunizations:', immunizations?.length)

    // Define complete vaccine schedule (13 vaccines)
    const completeVaccineSchedule = [
      'Hepatitis B (HB0)',
      'BCG',
      'Polio 1',
      'DPT-HB-Hib 1',
      'Polio 2',
      'DPT-HB-Hib 2',
      'Polio 3',
      'DPT-HB-Hib 3',
      'Polio 4',
      'IPV',
      'Campak/MR',
      'DPT-HB-Hib Booster',
      'Campak/MR Booster',
    ]

    // Process each patient
    const trackingData = (patients as Patient[]).map((patient) => {
      const patientImmunizations = (immunizations as Immunization[]).filter(
        (imm) => imm.patient_id === patient.id
      )

      // Calculate age in months
      const birthDate = new Date(patient.date_of_birth)
      const today = new Date()
      const ageMonths = Math.floor(
        (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      )

      const completed = patientImmunizations.length
      const total = completeVaccineSchedule.length

      // Find next scheduled vaccine
      const completedVaccines = patientImmunizations.map((imm) => imm.vaccine_name)
      const nextVaccine = completeVaccineSchedule.find(
        (vaccine) => !completedVaccines.includes(vaccine)
      )

      // Get next schedule date from the most recent immunization record
      const latestImmunization = patientImmunizations[0]
      const nextDue = latestImmunization?.next_schedule || null

      // Determine status
      let status: 'complete' | 'on_track' | 'overdue' = 'on_track'
      if (completed === total) {
        status = 'complete'
      } else if (nextDue && new Date(nextDue) < today) {
        status = 'overdue'
      }

      return {
        id: patient.id,
        patient_id: patient.id,
        patient_name: patient.full_name,
        patient_type: patient.patient_type,
        date_of_birth: patient.date_of_birth,
        age_months: ageMonths,
        completed,
        total,
        nextDue,
        nextVaccine,
        status,
      }
    })

    console.log('Processed tracking data:', trackingData.length)

    // Calculate summary statistics
    const summary = {
      complete: trackingData.filter((p) => p.status === 'complete').length,
      on_track: trackingData.filter((p) => p.status === 'on_track').length,
      overdue: trackingData.filter((p) => p.status === 'overdue').length,
      total: trackingData.length,
    }

    return NextResponse.json({ data: trackingData, summary })
  } catch (error) {
    console.error('Error in getImmunizationTracking:', error)
    throw error
  }
}

// Get immunization coverage data
async function getImmunizationCoverage(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  // Fetch all immunizations
  const { data: immunizations, error: immunizationsError } = await supabase
    .from('immunizations')
    .select('vaccine_name')

  if (immunizationsError) {
    throw immunizationsError
  }

  // Get total eligible patients (bayi + balita)
  const { count: totalPatients, error: countError } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .in('patient_type', ['bayi', 'balita'])

  if (countError) {
    throw countError
  }

  // Define vaccine schedule with age targets
  const vaccineSchedule = [
    { vaccine: 'HB0', fullName: 'Hepatitis B (HB0)', target_age_months: 0 },
    { vaccine: 'BCG', fullName: 'BCG', target_age_months: 1 },
    { vaccine: 'Polio 1', fullName: 'Polio 1', target_age_months: 1 },
    { vaccine: 'DPT-HB-Hib 1', fullName: 'DPT-HB-Hib 1', target_age_months: 2 },
    { vaccine: 'Polio 2', fullName: 'Polio 2', target_age_months: 2 },
    { vaccine: 'DPT-HB-Hib 2', fullName: 'DPT-HB-Hib 2', target_age_months: 3 },
    { vaccine: 'Polio 3', fullName: 'Polio 3', target_age_months: 3 },
    { vaccine: 'DPT-HB-Hib 3', fullName: 'DPT-HB-Hib 3', target_age_months: 4 },
    { vaccine: 'Polio 4', fullName: 'Polio 4', target_age_months: 4 },
    { vaccine: 'IPV', fullName: 'IPV', target_age_months: 4 },
    { vaccine: 'Campak/MR', fullName: 'Campak/MR', target_age_months: 9 },
  ]

  // Count immunizations by vaccine type
  const vaccineCounts: { [key: string]: number } = {}
  const immunizationList = immunizations as Immunization[]
  immunizationList.forEach((imm) => {
    const vaccineName = imm.vaccine_name
    vaccineCounts[vaccineName] = (vaccineCounts[vaccineName] || 0) + 1
  })

  console.log('Vaccine counts from database:', vaccineCounts)

  // Calculate coverage for each vaccine
  const coverageData = vaccineSchedule.map((schedule) => {
    // Try both short name and full name
    const actual = (vaccineCounts[schedule.vaccine] || 0) + (vaccineCounts[schedule.fullName] || 0)
    const target = totalPatients || 0
    const percentage = target > 0 ? (actual / target) * 100 : 0

    return {
      vaccine: schedule.vaccine,
      target,
      actual,
      percentage: Math.round(percentage * 10) / 10,
    }
  })

  // Calculate overall IDL (Imunisasi Dasar Lengkap) coverage
  // A child is considered complete if they have all basic vaccines (first 11)
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id')
    .in('patient_type', ['bayi', 'balita'])

  if (patientsError) {
    throw patientsError
  }

  const { data: allImmunizations, error: allImmError } = await supabase
    .from('immunizations')
    .select('patient_id, vaccine_name')

  if (allImmError) {
    throw allImmError
  }

  // Group by patient
  const patientVaccines: { [key: string]: string[] } = {}
  const immunizationsList = allImmunizations as Immunization[]
  immunizationsList.forEach((imm) => {
    if (!patientVaccines[imm.patient_id]) {
      patientVaccines[imm.patient_id] = []
    }
    patientVaccines[imm.patient_id].push(imm.vaccine_name)
  })

  // Count patients with complete basic immunization
  const basicVaccines = vaccineSchedule.map((v) => v.vaccine)
  const basicVaccinesFull = vaccineSchedule.map((v) => v.fullName)
  
  const completePatients = (patients as Patient[]).filter((patient) => {
    const vaccines = patientVaccines[patient.id] || []
    // Check if patient has all basic vaccines (either short or full name)
    return basicVaccines.every((vaccine, index) => 
      vaccines.includes(vaccine) || vaccines.includes(basicVaccinesFull[index])
    )
  }).length

  const overallCoverage = totalPatients && totalPatients > 0 ? (completePatients / totalPatients) * 100 : 0

  return NextResponse.json({
    coverage: coverageData,
    overall: {
      percentage: Math.round(overallCoverage * 10) / 10,
      complete: completePatients,
      total: totalPatients || 0,
      target: 95, // UCI target
    },
  })
}
