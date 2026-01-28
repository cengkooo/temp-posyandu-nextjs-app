'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import PatientTypeSelector, { PatientTypeValue } from '@/components/admin/forms/PatientTypeSelector';
import BayiForm, { BayiFormData, createInitialBayiFormData } from '@/components/admin/forms/patient-forms/BayiForm';
import BalitaForm, { BalitaFormData, createInitialBalitaFormData } from '@/components/admin/forms/patient-forms/BalitaForm';
import IbuHamilForm, {
  createInitialIbuHamilFormData,
  type IbuHamilFormData,
} from '@/components/admin/forms/patient-forms/IbuHamilForm';
import LansiaForm, {
  createInitialLansiaFormData,
  type LansiaFormData,
} from '@/components/admin/forms/patient-forms/LansiaForm';
import RemajaDewasaForm, { RemajaDewasaFormData, createInitialRemajaDewasaFormData } from '@/components/admin/forms/patient-forms/RemajaDewasaForm';
import { createPatient, createPatientExtendedData } from '@/lib/api';
import type { PatientInsert } from '@/types';

type Step = 'select_type' | 'fill_form';

export default function TambahPasienPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('select_type');
  const [patientType, setPatientType] = useState<PatientTypeValue | null>(null);
  const [loading, setLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Form data states for each patient type
  const [bayiData, setBayiData] = useState<BayiFormData>(createInitialBayiFormData());
  const [balitaData, setBalitaData] = useState<BalitaFormData>(createInitialBalitaFormData());
  const [remajaDewasaData, setRemajaDewasaData] = useState<RemajaDewasaFormData>(createInitialRemajaDewasaFormData());
  const [ibuHamilData, setIbuHamilData] = useState<IbuHamilFormData>(createInitialIbuHamilFormData());
  const [lansiaData, setLansiaData] = useState<LansiaFormData>(createInitialLansiaFormData());

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectType = (type: PatientTypeValue) => {
    setPatientType(type);
  };

  const handleContinueToForm = () => {
    if (patientType) {
      setStep('fill_form');
    }
  };

  const handleBackToTypeSelection = () => {
    setStep('select_type');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (patientType === 'bayi') {
      if (!bayiData.full_name.trim()) {
        newErrors.full_name = 'Nama lengkap wajib diisi';
      }
      if (!bayiData.date_of_birth) {
        newErrors.date_of_birth = 'Tanggal lahir wajib diisi';
      }
      if (!bayiData.gender) {
        newErrors.gender = 'Jenis kelamin wajib dipilih';
      }
      if (!bayiData.parent_name.trim()) {
        newErrors.parent_name = 'Nama orang tua wajib diisi';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Mohon lengkapi data yang wajib diisi');
      return;
    }

    if (!consentChecked) {
      alert('Anda harus menyetujui kebijakan privasi terlebih dahulu');
      return;
    }

    setLoading(true);

    try {
      const requireGender = (value: string): 'L' | 'P' => {
        if (value === 'L' || value === 'P') return value;
        throw new Error('Jenis kelamin wajib diisi');
      };

      // Prepare data based on patient type
      let patientData: PatientInsert | null = null;

      if (patientType === 'bayi') {
        patientData = {
          full_name: bayiData.full_name,
          nik: bayiData.nik || null,
          date_of_birth: bayiData.date_of_birth,
          gender: requireGender(bayiData.gender),
          address: bayiData.address || null,
          phone: bayiData.phone || null,
          patient_type: 'bayi',
          parent_name: bayiData.parent_name || null,
        };
      } else if (patientType === 'balita') {
        patientData = {
          full_name: balitaData.full_name,
          nik: balitaData.nik || null,
          date_of_birth: balitaData.date_of_birth,
          gender: requireGender(balitaData.gender),
          address: balitaData.address || null,
          phone: balitaData.phone || null,
          patient_type: 'balita',
          parent_name: balitaData.parent_name || null,
        };
      } else if (patientType === 'ibu_hamil') {
        patientData = {
          full_name: ibuHamilData.full_name || balitaData.full_name,
          nik: ibuHamilData.nik || balitaData.nik || null,
          date_of_birth: ibuHamilData.date_of_birth || balitaData.date_of_birth,
          gender: requireGender(balitaData.gender),
          address: ibuHamilData.address || balitaData.address || null,
          phone: ibuHamilData.phone || balitaData.phone || null,
          patient_type: 'ibu_hamil',
          parent_name: null,
        };
      } else if (patientType === 'remaja_dewasa') {
        patientData = {
          full_name: remajaDewasaData.full_name,
          nik: remajaDewasaData.nik || null,
          date_of_birth: remajaDewasaData.date_of_birth,
          gender: requireGender(remajaDewasaData.gender),
          address: remajaDewasaData.address || null,
          phone: remajaDewasaData.phone || null,
          patient_type: 'remaja_dewasa',
          parent_name: null,
        };
      } else if (patientType === 'lansia') {
        patientData = {
          full_name: lansiaData.full_name || balitaData.full_name,
          nik: lansiaData.nik || balitaData.nik || null,
          date_of_birth: lansiaData.date_of_birth || balitaData.date_of_birth,
          gender: requireGender(lansiaData.gender || balitaData.gender),
          address: lansiaData.address || balitaData.address || null,
          phone: lansiaData.phone || balitaData.phone || null,
          patient_type: 'lansia',
          parent_name: null,
        };
      }

      if (!patientData) {
        throw new Error('Tipe pasien tidak valid');
      }

      const { data: result, error } = await createPatient(patientData);

      if (error) {
        alert('Gagal menambahkan pasien: ' + error.message);
        setLoading(false);
        return;
      }

      // Save extended data if patient was created successfully
      if (result && result.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let extendedData: any = {
          patient_id: result.id,
        };

        if (patientType === 'bayi') {
          extendedData = {
            ...extendedData,
            weight: bayiData.weight || null,
            height: bayiData.height || null,
            head_circumference: bayiData.head_circumference || null,
            measurement_date: bayiData.measurement_date || null,
            asi_exclusive: bayiData.asi_exclusive || null,
            asi_duration_months: bayiData.asi_duration_months || null,
            mpasi_started: bayiData.mpasi_started,
            mpasi_age_months: bayiData.mpasi_age_months || null,
            mpasi_types: bayiData.mpasi_types || null,
            immunizations: bayiData.immunizations || [],
            vitamin_a_given: bayiData.vitamin_a_given,
            vitamin_a_date: bayiData.vitamin_a_date || null,
            ispa_history: bayiData.ispa_history,
            ispa_last_date: bayiData.ispa_last_date || null,
            diare_history: bayiData.diare_history,
            diare_last_date: bayiData.diare_last_date || null,
            other_illness: bayiData.other_illness || null,
            special_notes: bayiData.special_notes || null,
          };
        } else if (patientType === 'balita') {
          extendedData = {
            ...extendedData,
            weight: balitaData.weight || null,
            height: balitaData.height || null,
            lila: balitaData.lila || null,
            measurement_date: balitaData.measurement_date || null,
            immunizations: balitaData.immunizations || [],
            vitamin_a_blue_given: balitaData.vitamin_a_blue_given,
            vitamin_a_blue_date: balitaData.vitamin_a_blue_date || null,
            vitamin_a_red_given: balitaData.vitamin_a_red_given,
            vitamin_a_red_date: balitaData.vitamin_a_red_date || null,
            deworming_given: balitaData.deworming_given,
            deworming_date: balitaData.deworming_date || null,
            ispa_status: balitaData.ispa_status,
            ispa_last_date: balitaData.ispa_last_date || null,
            ispa_notes: balitaData.ispa_notes || null,
            diare_status: balitaData.diare_status,
            diare_last_date: balitaData.diare_last_date || null,
            diare_notes: balitaData.diare_notes || null,
            pneumonia_ever: balitaData.pneumonia_ever,
            pneumonia_date: balitaData.pneumonia_date || null,
            dbd_ever: balitaData.dbd_ever,
            dbd_date: balitaData.dbd_date || null,
            campak_ever: balitaData.campak_ever,
            campak_date: balitaData.campak_date || null,
            cacar_ever: balitaData.cacar_ever,
            cacar_date: balitaData.cacar_date || null,
            allergies: balitaData.allergies || [],
            allergy_notes: balitaData.allergy_notes || null,
            hospitalization_ever: balitaData.hospitalization_ever,
            hospitalization_date: balitaData.hospitalization_date || null,
            hospitalization_diagnosis: balitaData.hospitalization_diagnosis || null,
            hospitalization_place: balitaData.hospitalization_place || null,
            motor_development: balitaData.motor_development || null,
            motor_notes: balitaData.motor_notes || null,
            language_development: balitaData.language_development || null,
            social_development: balitaData.social_development || null,
            special_notes: balitaData.special_notes || null,
          };
        } else if (patientType === 'remaja_dewasa') {
          extendedData = {
            ...extendedData,
            weight: remajaDewasaData.weight || null,
            height: remajaDewasaData.height || null,
            waist_circumference: remajaDewasaData.waist_circumference || null,
            measurement_date: remajaDewasaData.measurement_date || null,
            occupation: remajaDewasaData.occupation || null,
            marital_status: remajaDewasaData.marital_status || null,
            smoking_status: remajaDewasaData.smoking_status || null,
            cigarettes_per_day: remajaDewasaData.cigarettes_per_day || null,
            physical_activity: remajaDewasaData.physical_activity || null,
            activity_minutes_per_week: remajaDewasaData.activity_minutes_per_week || null,
            vegetable_portions_per_day: remajaDewasaData.vegetable_portions_per_day || null,
            fruit_portions_per_day: remajaDewasaData.fruit_portions_per_day || null,
            blood_sugar_random: remajaDewasaData.blood_sugar_random || null,
            blood_sugar_fasting: remajaDewasaData.blood_sugar_fasting || null,
            cholesterol_total: remajaDewasaData.cholesterol_total || null,
            cholesterol_ldl: remajaDewasaData.cholesterol_ldl || null,
            cholesterol_hdl: remajaDewasaData.cholesterol_hdl || null,
            triglycerides: remajaDewasaData.triglycerides || null,
            uric_acid: remajaDewasaData.uric_acid || null,
            special_notes: remajaDewasaData.special_notes || null,
          };
        }

        // Insert extended data
        const { error: extError } = await createPatientExtendedData(extendedData as Parameters<typeof createPatientExtendedData>[0]);
        if (extError) {
          console.error('Warning: Failed to save extended data:', extError);
          // Don't block the process, just log the error
        }
      }

      alert('Pasien berhasil ditambahkan!');
      router.push('/admin/pasien');
    } catch (err) {
      alert('Terjadi kesalahan: ' + (err as Error).message);
      setLoading(false);
    }
  };

  const getPatientTypeLabel = (type: PatientTypeValue | null): string => {
    const labels: Record<PatientTypeValue, string> = {
      bayi: 'Bayi (0-11 bulan)',
      balita: 'Balita (1-5 tahun)',
      ibu_hamil: 'Ibu Hamil',
      remaja_dewasa: 'Remaja & Dewasa (15-45 tahun)',
      lansia: 'Lansia (≥60 tahun)',
    };
    return type ? labels[type] : '';
  };

  const renderForm = () => {
    switch (patientType) {
      case 'bayi':
        return (
          <BayiForm
            data={bayiData}
            onChange={setBayiData}
            errors={errors as Partial<Record<keyof BayiFormData, string>>}
            disabled={loading}
          />
        );
      case 'balita':
        return (
          <BalitaForm
            data={balitaData}
            onChange={setBalitaData}
            errors={errors}
            disabled={loading}
          />
        );
      case 'ibu_hamil':
        return (
          <IbuHamilForm
            data={ibuHamilData}
            onChange={setIbuHamilData}
            disabled={loading}
          />
        );
      case 'remaja_dewasa':
        return (
          <RemajaDewasaForm
            data={remajaDewasaData}
            onChange={setRemajaDewasaData}
            errors={errors}
            disabled={loading}
          />
        );
      case 'lansia':
        return (
          <LansiaForm
            data={lansiaData}
            onChange={setLansiaData}
            disabled={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => (step === 'fill_form' ? handleBackToTypeSelection() : router.back())}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Pasien Baru</h1>
          <p className="text-sm text-gray-500">
            {step === 'select_type'
              ? 'Pilih tipe pasien untuk melanjutkan'
              : `Mengisi data ${getPatientTypeLabel(patientType)}`}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            step === 'select_type'
              ? 'bg-teal-100 text-teal-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span className="w-5 h-5 flex items-center justify-center bg-teal-600 text-white text-xs rounded-full">
            1
          </span>
          Pilih Tipe
        </div>
        <div className="w-8 h-0.5 bg-gray-200" />
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            step === 'fill_form'
              ? 'bg-teal-100 text-teal-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span
            className={`w-5 h-5 flex items-center justify-center text-xs rounded-full ${
              step === 'fill_form' ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}
          >
            2
          </span>
          Isi Data
        </div>
      </div>

      {/* Content */}
      <Card>
        {step === 'select_type' ? (
          <div className="space-y-6">
            <PatientTypeSelector
              value={patientType}
              onChange={handleSelectType}
            />

            {/* Continue button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                onClick={handleContinueToForm}
                disabled={!patientType}
                className="flex items-center gap-2"
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Form content */}
            {renderForm()}

            {/* Privacy Consent */}
            <div className="pt-6 border-t border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 text-teal-500 focus:ring-teal-500 rounded"
                />
                <span className="text-sm text-gray-700">
                  Saya menyetujui data pasien ini disimpan dan diproses sesuai kebijakan privasi
                  Posyandu
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBackToTypeSelection}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={loading || !consentChecked}
                  isLoading={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
