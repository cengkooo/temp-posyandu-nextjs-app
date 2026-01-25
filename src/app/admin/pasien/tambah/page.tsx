'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import Card from '@/components/admin/ui/Card';
import Button from '@/components/admin/forms/Button';
import PatientTypeSelector, { PatientTypeValue } from '@/components/admin/forms/PatientTypeSelector';
import BayiForm, { BayiFormData, createInitialBayiFormData } from '@/components/admin/forms/patient-forms/BayiForm';
import BalitaForm, { BalitaFormData, createInitialBalitaFormData } from '@/components/admin/forms/patient-forms/BalitaForm';
import IbuHamilForm from '@/components/admin/forms/patient-forms/IbuHamilForm';
import LansiaForm from '@/components/admin/forms/patient-forms/LansiaForm';
import RemajaDewasaForm from '@/components/admin/forms/patient-forms/RemajaDewasaForm';
import { createPatient } from '@/lib/api';

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
      // Prepare data based on patient type
      let patientData: Record<string, unknown> = {};

      if (patientType === 'bayi') {
        patientData = {
          full_name: bayiData.full_name,
          nik: bayiData.nik || null,
          date_of_birth: bayiData.date_of_birth,
          gender: bayiData.gender,
          address: bayiData.address || null,
          phone: bayiData.phone || null,
          patient_type: 'bayi',
          parent_name: bayiData.parent_name || null,
          // Extended data stored in metadata
          metadata: {
            weight: bayiData.weight,
            height: bayiData.height,
            head_circumference: bayiData.head_circumference,
            measurement_date: bayiData.measurement_date,
            asi_exclusive: bayiData.asi_exclusive,
            asi_duration_months: bayiData.asi_duration_months,
            mpasi_started: bayiData.mpasi_started,
            mpasi_age_months: bayiData.mpasi_age_months,
            mpasi_types: bayiData.mpasi_types,
            immunizations: bayiData.immunizations,
            vitamin_a_given: bayiData.vitamin_a_given,
            vitamin_a_date: bayiData.vitamin_a_date,
            ispa_history: bayiData.ispa_history,
            ispa_last_date: bayiData.ispa_last_date,
            diare_history: bayiData.diare_history,
            diare_last_date: bayiData.diare_last_date,
            other_illness: bayiData.other_illness,
            special_notes: bayiData.special_notes,
          },
        };
      } else if (patientType === 'balita') {
        // TODO: Implement balita form data mapping
        patientData = {
          full_name: 'TODO',
          date_of_birth: new Date().toISOString().split('T')[0],
          gender: 'L',
          patient_type: 'balita',
        };
      } else {
        // Map to legacy patient types for now
        const legacyType = patientType === 'ibu_hamil' ? 'ibu_hamil' : 
                          patientType === 'lansia' ? 'lansia' : 'balita';
        patientData = {
          full_name: 'TODO',
          date_of_birth: new Date().toISOString().split('T')[0],
          gender: 'L',
          patient_type: legacyType,
        };
      }

      const { data: result, error } = await createPatient(patientData);

      if (error) {
        alert('Gagal menambahkan pasien: ' + error.message);
        setLoading(false);
        return;
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
            errors={errors}
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
            onSubmit={(data) => console.log('Ibu Hamil data:', data)}
          />
        );
      case 'remaja_dewasa':
        return (
          <RemajaDewasaForm
            onSubmit={(data) => console.log('Remaja/Dewasa data:', data)}
          />
        );
      case 'lansia':
        return (
          <LansiaForm
            onSubmit={(data) => console.log('Lansia data:', data)}
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
