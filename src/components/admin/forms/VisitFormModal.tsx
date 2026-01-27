'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Save, Printer, Plus, Search } from 'lucide-react';
import { getPatients, createVisit, updateVisit } from '@/lib/api';
import type { Patient, Visit } from '@/types';
import Button from './Button';
import Card from '../ui/Card';
import BayiBalitaVisitForm, {
  BayiBalitaVisitData,
  createInitialBayiBalitaVisitData,
} from './visit-forms/BayiBalitaVisitForm';
import IbuHamilVisitForm, {
  IbuHamilVisitData,
  createInitialIbuHamilVisitData,
} from './visit-forms/IbuHamilVisitForm';
import RemajaDewasaVisitForm, {
  RemajaDewasaVisitData,
  createInitialRemajaDewasaVisitData,
} from './visit-forms/RemajaDewasaVisitForm';
import LansiaVisitForm, {
  LansiaVisitData,
  createInitialLansiaVisitData,
} from './visit-forms/LansiaVisitForm';
import { calculateAgeInMonths, formatAge } from '@/lib/nutritionCalculator';

interface VisitFormModalProps {
  visit?: (Visit & { patient: Patient }) | null;
  preselectedPatient?: Patient | null;
  onClose: () => void;
  onSuccess: () => void;
}

type SaveAction = 'save_close' | 'save_print' | 'save_add';

export default function VisitFormModal({
  visit,
  preselectedPatient,
  onClose,
  onSuccess,
}: VisitFormModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    preselectedPatient || visit?.patient || null
  );
  const [visitDate, setVisitDate] = useState(
    visit?.visit_date || new Date().toISOString().split('T')[0]
  );

  // Form data per patient type
  const [bayiBalitaData, setBayiBalitaData] = useState<BayiBalitaVisitData>(
    createInitialBayiBalitaVisitData()
  );
  const [ibuHamilData, setIbuHamilData] = useState<IbuHamilVisitData>(
    createInitialIbuHamilVisitData()
  );
  const [remajaDewasaData, setRemajaDewasaData] = useState<RemajaDewasaVisitData>(
    createInitialRemajaDewasaVisitData()
  );
  const [lansiaData, setLansiaData] = useState<LansiaVisitData>(createInitialLansiaVisitData());

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const { data } = await getPatients();
    if (data) {
      setPatients(data);
    }
  };

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.full_name.toLowerCase().includes(query) ||
        p.patient_type.toLowerCase().includes(query)
    );
  }, [patients, searchQuery]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchQuery(patient.full_name);
    setShowPatientDropdown(false);
  };

  // Determine patient type for form rendering
  const patientType = selectedPatient?.patient_type;
  const isBayi = useMemo(() => {
    if (!selectedPatient?.date_of_birth) return false;
    const months = calculateAgeInMonths(selectedPatient.date_of_birth);
    return months < 12;
  }, [selectedPatient?.date_of_birth]);

  const getPatientTypeColor = (type: string) => {
    switch (type) {
      case 'bayi':
        return 'bg-blue-100 text-blue-700';
      case 'balita':
        return 'bg-cyan-100 text-cyan-700';
      case 'ibu_hamil':
        return 'bg-pink-100 text-pink-700';
      case 'remaja_dewasa':
        return 'bg-purple-100 text-purple-700';
      case 'lansia':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPatientTypeLabel = (type: string) => {
    switch (type) {
      case 'bayi':
        return 'Bayi';
      case 'balita':
        return 'Balita';
      case 'ibu_hamil':
        return 'Ibu Hamil';
      case 'remaja_dewasa':
        return 'Remaja/Dewasa';
      case 'lansia':
        return 'Lansia';
      default:
        return type;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedPatient) {
      newErrors.patient = 'Pilih pasien terlebih dahulu';
    }

    if (!visitDate) {
      newErrors.visit_date = 'Tanggal kunjungan wajib diisi';
    }

    // Add type-specific validations here if needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prepareVisitData = () => {
    const baseData = {
      patient_id: selectedPatient!.id,
      visit_date: visitDate,
    };

    // Merge form data based on patient type
    let typeSpecificData = {};

    if (patientType === 'bayi' || patientType === 'balita') {
      typeSpecificData = {
        weight: bayiBalitaData.weight || null,
        height: bayiBalitaData.height || null,
        head_circumference: bayiBalitaData.head_circumference || null,
        arm_circumference: bayiBalitaData.arm_circumference || null,
        notes: bayiBalitaData.notes || null,
        complaints: bayiBalitaData.complaints || null,
        recommendations: `Pemeriksaan fisik: ${bayiBalitaData.physical_exam || '-'}\nTindakan: ${bayiBalitaData.actions || '-'}`,
      };
    } else if (patientType === 'ibu_hamil') {
      typeSpecificData = {
        weight: ibuHamilData.weight || null,
        height: ibuHamilData.height || null,
        arm_circumference: ibuHamilData.lila || null,
        blood_pressure: ibuHamilData.systolic && ibuHamilData.diastolic
          ? `${ibuHamilData.systolic}/${ibuHamilData.diastolic}`
          : null,
        notes: ibuHamilData.notes || null,
        complaints: ibuHamilData.complaints || null,
        recommendations: `Usia kehamilan: ${ibuHamilData.pregnancy_weeks || '-'} minggu\nTinggi fundus: ${ibuHamilData.fundal_height || '-'} cm\nDJJ: ${ibuHamilData.fetal_heart_rate || '-'} bpm\nPresentasi: ${ibuHamilData.fetal_presentation || '-'}\nEdema: ${ibuHamilData.edema || '-'}\nProtein urine: ${ibuHamilData.protein_urine || '-'}\nTTD: ${ibuHamilData.ttd_given ? 'Ya' : 'Tidak'}\nImunisasi TT: ${ibuHamilData.immunization_tt || '-'}\nKonseling: ${ibuHamilData.counseling || '-'}`,
      };
    } else if (patientType === 'remaja_dewasa') {
      typeSpecificData = {
        weight: remajaDewasaData.weight || null,
        height: remajaDewasaData.height || null,
        blood_pressure: remajaDewasaData.systolic && remajaDewasaData.diastolic
          ? `${remajaDewasaData.systolic}/${remajaDewasaData.diastolic}`
          : null,
        notes: remajaDewasaData.notes || null,
        complaints: remajaDewasaData.complaints || null,
        recommendations: `Lingkar pinggang: ${remajaDewasaData.waist_circumference || '-'} cm\nGula darah: ${remajaDewasaData.blood_sugar || '-'} mg/dL\nKolesterol: ${remajaDewasaData.cholesterol || '-'} mg/dL\nAsam urat: ${remajaDewasaData.uric_acid || '-'} mg/dL\nAktivitas fisik: ${remajaDewasaData.physical_activity || '-'}\nPorsi sayur/buah: ${remajaDewasaData.vegetable_fruit_portions || '-'}\nStatus merokok: ${remajaDewasaData.smoking_status || '-'}${remajaDewasaData.cigarettes_per_day ? ` (${remajaDewasaData.cigarettes_per_day} batang/hari)` : ''}\nPemeriksaan: ${remajaDewasaData.examination || '-'}\nKonseling: ${remajaDewasaData.counseling || '-'}${remajaDewasaData.referral_needed ? `\nRujukan ke: ${remajaDewasaData.referral_to || '-'}` : ''}`,
      };
    } else if (patientType === 'lansia') {
      typeSpecificData = {
        weight: lansiaData.weight || null,
        height: lansiaData.height || null,
        blood_pressure: lansiaData.systolic && lansiaData.diastolic
          ? `${lansiaData.systolic}/${lansiaData.diastolic}`
          : null,
        notes: lansiaData.notes || null,
        complaints: lansiaData.main_complaint || null,
        recommendations: `Tinggi lutut: ${lansiaData.knee_height || '-'} cm\nNadi: ${lansiaData.pulse_rate || '-'} x/menit\nGula darah: ${lansiaData.blood_sugar || '-'} mg/dL\nSuhu: ${lansiaData.temperature || '-'}°C\nKemandirian makan: ${lansiaData.eating_independence || '-'}\nKemandirian berpakaian: ${lansiaData.dressing_independence || '-'}\nKemandirian mandi: ${lansiaData.bathing_independence || '-'}\nKemandirian toileting: ${lansiaData.toileting_independence || '-'}\nKemandirian mobilitas: ${lansiaData.mobility_independence || '-'}${lansiaData.mobility_type ? ` (${lansiaData.mobility_type})` : ''}\nStatus mental: ${lansiaData.mental_status || '-'}\nRisiko jatuh: ${lansiaData.fall_risk_items || '-'}\nSkala nyeri: ${lansiaData.pain_scale || '-'}\nPemeriksaan: ${lansiaData.examination || '-'}\nObat: ${lansiaData.medication_given || '-'}\nKonseling: ${lansiaData.counseling || '-'}${lansiaData.referral_needed ? `\nRujukan ke: ${lansiaData.referral_to || '-'}` : ''}`,
      };
    }

    return { ...baseData, ...typeSpecificData };
  };

  const handleSubmit = async (action: SaveAction) => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const visitData = prepareVisitData();

      let result;
      if (visit) {
        result = await updateVisit(visit.id, visitData);
      } else {
        result = await createVisit(visitData as any);
      }

      if (result.error) {
        alert('Gagal menyimpan data kunjungan: ' + result.error.message);
        setLoading(false);
        return;
      }

      if (action === 'save_print') {
        // TODO: Implement KMS print
        alert('Data tersimpan. Fitur cetak KMS dalam pengembangan.');
      } else if (action === 'save_add') {
        // Reset form for new entry
        setSelectedPatient(null);
        setSearchQuery('');
        setVisitDate(new Date().toISOString().split('T')[0]);
        setBayiBalitaData(createInitialBayiBalitaVisitData());
        setIbuHamilData(createInitialIbuHamilVisitData());
        setRemajaDewasaData(createInitialRemajaDewasaVisitData());
        setLansiaData(createInitialLansiaVisitData());
        alert('Data kunjungan berhasil disimpan! Silakan tambah kunjungan baru.');
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      alert('Terjadi kesalahan: ' + (err as Error).message);
      setLoading(false);
    }
  };

  const renderFormByPatientType = () => {
    if (!selectedPatient) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">Pilih Pasien</p>
          <p className="text-sm">Cari dan pilih pasien untuk mencatat kunjungan</p>
        </div>
      );
    }

    switch (patientType) {
      case 'bayi':
      case 'balita':
        return (
          <BayiBalitaVisitForm
            data={bayiBalitaData}
            onChange={setBayiBalitaData}
            patientDateOfBirth={selectedPatient.date_of_birth}
            patientGender={selectedPatient.gender as 'L' | 'P'}
            isBayi={isBayi}
            disabled={loading}
            errors={errors}
          />
        );
      case 'ibu_hamil':
        return (
          <IbuHamilVisitForm
            data={ibuHamilData}
            onChange={setIbuHamilData}
            disabled={loading}
            errors={errors}
          />
        );
      case 'remaja_dewasa':
        return (
          <RemajaDewasaVisitForm
            data={remajaDewasaData}
            onChange={setRemajaDewasaData}
            patientGender={selectedPatient.gender as 'L' | 'P'}
            disabled={loading}
            errors={errors}
          />
        );
      case 'lansia':
        return (
          <LansiaVisitForm
            data={lansiaData}
            onChange={setLansiaData}
            disabled={loading}
            errors={errors}
          />
        );
      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">Tipe pasien tidak dikenali</p>
            <p className="text-sm">Silakan pilih pasien dengan tipe yang valid</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-emerald-600">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {visit ? 'Edit Kunjungan' : 'Catat Kunjungan'}
            </h2>
            <p className="text-sm text-teal-100">
              {selectedPatient
                ? `${selectedPatient.full_name} - ${getPatientTypeLabel(patientType || '')}`
                : 'Pilih pasien untuk memulai'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Patient Selection */}
          <Card padding="sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Pasien <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    placeholder="Cari nama pasien..."
                    disabled={!!visit}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.patient ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.patient && (
                  <p className="text-red-500 text-sm mt-1">{errors.patient}</p>
                )}

                {/* Dropdown */}
                {showPatientDropdown && !visit && filteredPatients.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.slice(0, 10).map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{patient.full_name}</p>
                          <p className="text-xs text-gray-500">
                            {patient.date_of_birth && formatAge(patient.date_of_birth)}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getPatientTypeColor(
                            patient.patient_type
                          )}`}
                        >
                          {getPatientTypeLabel(patient.patient_type)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Visit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Kunjungan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.visit_date ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.visit_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.visit_date}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Dynamic Form */}
          {renderFormByPatientType()}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => handleSubmit('save_print')}
                disabled={loading || !selectedPatient}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Simpan & Cetak KMS
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleSubmit('save_add')}
                disabled={loading || !selectedPatient}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Simpan & Tambah Lagi
              </Button>

              <Button
                variant="primary"
                onClick={() => handleSubmit('save_close')}
                disabled={loading || !selectedPatient}
                isLoading={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan & Tutup
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
