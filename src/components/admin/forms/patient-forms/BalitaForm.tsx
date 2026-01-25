'use client';

import { useState, useMemo, useEffect } from 'react';
import TabNavigation, { Tab } from '../TabNavigation';
import NumberInputWithControls from '../NumberInputWithControls';
import ChecklistInput from '../ChecklistInput';
import StatusIndicatorBadge from '../StatusIndicatorBadge';
import { calculateBBU, calculateTBU, calculateBBTB, getIMTStatus } from '@/lib/nutritionCalculator';
import { Baby, Ruler, Utensils, Syringe, HeartPulse, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export interface BalitaFormData {
  // Tab 1: Data Balita
  full_name: string;
  nik: string;
  date_of_birth: string;
  gender: 'L' | 'P';
  parent_name: string;
  phone: string;
  address: string;
  blood_type: string;

  // Tab 2: Pengukuran
  measurement_date: string;
  weight: number | string;
  height: number | string;
  lila: number | string;

  // Tab 3: ASI & MPASI
  asi_exclusive: 'yes_6m' | 'yes_less' | 'no' | 'unknown';
  asi_duration_months: number;
  mpasi_start_age: number;
  mpasi_types: string[];
  meal_frequency: number;
  snack_frequency: number;
  eating_pattern: string;
  appetite: 'good' | 'enough' | 'poor' | 'very_poor';
  eating_problems: string[];

  // Tab 4: Imunisasi
  immunizations: Record<string, { given: boolean; date: string }>;
  vitamin_a_blue_given: boolean;
  vitamin_a_blue_date: string;
  vitamin_a_red_given: boolean;
  vitamin_a_red_date: string;
  deworming_given: boolean;
  deworming_date: string;

  // Tab 5: Riwayat Kesehatan
  ispa_status: 'never' | 'once' | 'frequent';
  ispa_last_date: string;
  ispa_notes: string;
  diare_status: 'never' | 'once' | 'frequent';
  diare_last_date: string;
  diare_notes: string;
  pneumonia_ever: boolean;
  pneumonia_date: string;
  dbd_ever: boolean;
  dbd_date: string;
  campak_ever: boolean;
  campak_date: string;
  cacar_ever: boolean;
  cacar_date: string;
  allergies: string[];
  allergy_notes: string;
  hospitalization_ever: boolean;
  hospitalization_date: string;
  hospitalization_diagnosis: string;
  hospitalization_place: string;
  motor_development: 'normal' | 'delayed' | 'not_assessed';
  motor_notes: string;
  language_development: 'normal' | 'delayed' | 'not_assessed';
  social_development: 'normal' | 'has_issue' | 'not_assessed';
  special_notes: string;
}

export function createInitialBalitaFormData(): BalitaFormData {
  return {
    full_name: '',
    nik: '',
    date_of_birth: '',
    gender: 'L',
    parent_name: '',
    phone: '',
    address: '',
    blood_type: '',
    measurement_date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    lila: '',
    asi_exclusive: 'unknown',
    asi_duration_months: 6,
    mpasi_start_age: 6,
    mpasi_types: [],
    meal_frequency: 3,
    snack_frequency: 2,
    eating_pattern: '',
    appetite: 'good',
    eating_problems: [],
    immunizations: {},
    vitamin_a_blue_given: false,
    vitamin_a_blue_date: '',
    vitamin_a_red_given: false,
    vitamin_a_red_date: '',
    deworming_given: false,
    deworming_date: '',
    ispa_status: 'never',
    ispa_last_date: '',
    ispa_notes: '',
    diare_status: 'never',
    diare_last_date: '',
    diare_notes: '',
    pneumonia_ever: false,
    pneumonia_date: '',
    dbd_ever: false,
    dbd_date: '',
    campak_ever: false,
    campak_date: '',
    cacar_ever: false,
    cacar_date: '',
    allergies: [],
    allergy_notes: '',
    hospitalization_ever: false,
    hospitalization_date: '',
    hospitalization_diagnosis: '',
    hospitalization_place: '',
    motor_development: 'not_assessed',
    motor_notes: '',
    language_development: 'not_assessed',
    social_development: 'not_assessed',
    special_notes: '',
  };
}

interface BalitaFormProps {
  data: BalitaFormData;
  onChange: (data: BalitaFormData) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

const tabs: Tab[] = [
  { id: 'data', label: 'Data Balita', icon: <Baby className="w-4 h-4" /> },
  { id: 'pengukuran', label: 'Pengukuran', icon: <Ruler className="w-4 h-4" /> },
  { id: 'mpasi', label: 'ASI & MPASI', icon: <Utensils className="w-4 h-4" /> },
  { id: 'imunisasi', label: 'Imunisasi', icon: <Syringe className="w-4 h-4" /> },
  { id: 'kesehatan', label: 'Riwayat Kesehatan', icon: <HeartPulse className="w-4 h-4" /> },
];

// Immunization list for Balita
const immunizationList = [
  { id: 'hb0', name: 'HB0 (Hepatitis B0)', target_age: '0-24 jam' },
  { id: 'bcg', name: 'BCG', target_age: '<2 bulan' },
  { id: 'polio1', name: 'Polio 1', target_age: '1 bulan' },
  { id: 'polio2', name: 'Polio 2', target_age: '2 bulan' },
  { id: 'dpthbhib1', name: 'DPT-HB-Hib 1', target_age: '2 bulan' },
  { id: 'polio3', name: 'Polio 3', target_age: '3 bulan' },
  { id: 'dpthbhib2', name: 'DPT-HB-Hib 2', target_age: '3 bulan' },
  { id: 'polio4', name: 'Polio 4', target_age: '4 bulan' },
  { id: 'dpthbhib3', name: 'DPT-HB-Hib 3', target_age: '4 bulan' },
  { id: 'ipv', name: 'IPV', target_age: '4 bulan' },
  { id: 'mr1', name: 'Campak/MR 1', target_age: '9 bulan' },
  { id: 'dpthbhib4', name: 'DPT-HB-Hib 4 (Booster)', target_age: '18 bulan' },
  { id: 'mr2', name: 'Campak/MR 2 (Booster)', target_age: '18 bulan' },
];

const mpasiTypes = [
  { id: 'bubur', label: 'Bubur/Nasi Tim' },
  { id: 'sayuran', label: 'Sayuran' },
  { id: 'buah', label: 'Buah-buahan' },
  { id: 'protein_hewani', label: 'Protein Hewani (telur, ikan, ayam, daging)' },
  { id: 'protein_nabati', label: 'Protein Nabati (tahu, tempe, kacang)' },
  { id: 'susu_formula', label: 'Susu Formula' },
  { id: 'makanan_instan', label: 'Makanan Instan/Kemasan' },
];

const eatingProblems = [
  { id: 'none', label: 'Tidak ada masalah' },
  { id: 'gtm', label: 'Sulit makan/GTM (Gerakan Tutup Mulut)' },
  { id: 'picky', label: 'Pilih-pilih makanan (picky eater)' },
  { id: 'allergy', label: 'Alergi makanan tertentu' },
  { id: 'nausea', label: 'Mual/muntah' },
  { id: 'diarrhea', label: 'Diare' },
];

const allergyOptions = [
  { id: 'none', label: 'Tidak ada alergi' },
  { id: 'food', label: 'Alergi makanan' },
  { id: 'medicine', label: 'Alergi obat' },
  { id: 'other', label: 'Alergi lainnya' },
];

export default function BalitaForm({ data, onChange, errors = {}, disabled = false }: BalitaFormProps) {
  const [activeTab, setActiveTab] = useState('data');

  const updateField = (field: keyof BalitaFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateImmunization = (id: string, given: boolean, date?: string) => {
    const current = data.immunizations[id] || { given: false, date: '' };
    onChange({
      ...data,
      immunizations: {
        ...data.immunizations,
        [id]: { given, date: date ?? current.date },
      },
    });
  };

  // Calculate age in months
  const ageMonths = useMemo(() => {
    if (!data.date_of_birth) return null;
    const birth = new Date(data.date_of_birth);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return months;
  }, [data.date_of_birth]);

  const ageDisplay = useMemo(() => {
    if (!ageMonths) return null;
    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    if (years < 1) return `${ageMonths} bulan`;
    return `${years} tahun ${months} bulan`;
  }, [ageMonths]);

  // Nutrition status calculation
  const nutritionStatus = useMemo(() => {
    if (!data.weight || !data.height || !ageMonths) return null;

    const weight = parseFloat(String(data.weight));
    const height = parseFloat(String(data.height));
    const gender = data.gender;

    const bbu = calculateBBU(weight, ageMonths, gender);
    const tbu = calculateTBU(height, ageMonths, gender);
    const bbtb = calculateBBTB(weight, height, gender);

    // Determine overall status
    let overallStatus = 'Gizi Baik';
    let overallType: 'good' | 'warning' | 'danger' = 'good';

    if (bbu.zScore < -3 || bbtb.zScore < -3) {
      overallStatus = 'Gizi Buruk';
      overallType = 'danger';
    } else if (bbu.zScore < -2 || bbtb.zScore < -2) {
      overallStatus = 'Gizi Kurang';
      overallType = 'warning';
    } else if (tbu.zScore < -2) {
      overallStatus = 'Stunting (Pendek)';
      overallType = 'warning';
    }

    return { bbu, tbu, bbtb, overallStatus, overallType };
  }, [data.weight, data.height, ageMonths, data.gender]);

  // Immunization progress
  const immunizationProgress = useMemo(() => {
    const total = immunizationList.length;
    const completed = immunizationList.filter(imm => data.immunizations[imm.id]?.given).length;
    return { total, completed, percentage: Math.round((completed / total) * 100) };
  }, [data.immunizations]);

  const renderDataTab = () => (
    <div className="space-y-6">
      {/* Identitas Balita */}
      <div className="p-4 bg-cyan-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Baby className="w-5 h-5 text-cyan-600" />
          Identitas Balita
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap Balita <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                disabled={disabled}
                placeholder="Masukkan nama lengkap balita"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.full_name ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIK Balita (Optional)</label>
              <input
                type="text"
                maxLength={16}
                value={data.nik}
                onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))}
                disabled={disabled}
                placeholder="Nomor Induk Kependudukan"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-gray-400 mt-1">Data akan dienkripsi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={data.date_of_birth}
                onChange={(e) => updateField('date_of_birth', e.target.value)}
                disabled={disabled}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.date_of_birth ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {ageDisplay && (
                <p className="text-sm text-cyan-600 mt-1 font-medium">
                  Umur saat ini: {ageDisplay}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-6 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="L"
                    checked={data.gender === 'L'}
                    onChange={(e) => updateField('gender', e.target.value)}
                    disabled={disabled}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-gray-700">Laki-laki</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="P"
                    checked={data.gender === 'P'}
                    onChange={(e) => updateField('gender', e.target.value)}
                    disabled={disabled}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-gray-700">Perempuan</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Orang Tua */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Data Orang Tua/Wali</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Orang Tua/Wali <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.parent_name}
                onChange={(e) => updateField('parent_name', e.target.value)}
                disabled={disabled}
                placeholder="Nama lengkap ibu atau ayah"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.parent_name ? 'border-red-500' : 'border-gray-200'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                disabled={disabled}
                placeholder="08xx-xxxx-xxxx"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              value={data.address}
              onChange={(e) => updateField('address', e.target.value)}
              disabled={disabled}
              rows={2}
              placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${
                errors.address ? 'border-red-500' : 'border-gray-200'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPengukuranTab = () => (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <p className="text-sm text-blue-800">
          Pengukuran ini dapat diisi sekarang atau nanti saat kunjungan
        </p>
      </div>

      {/* Tanggal Pengukuran */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pengukuran</label>
        <input
          type="date"
          value={data.measurement_date}
          onChange={(e) => updateField('measurement_date', e.target.value)}
          disabled={disabled}
          className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Antropometri Dasar */}
      <div className="p-4 bg-cyan-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Antropometri Dasar</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Berat Badan (BB) <span className="text-red-500">*</span>
            </label>
            <NumberInputWithControls
              value={data.weight}
              onChange={(val) => updateField('weight', val)}
              min={5}
              max={30}
              step={0.1}
              disabled={disabled}
            />
            {ageMonths && (
              <p className="text-xs text-gray-500 mt-1">
                Range normal: {ageMonths < 24 ? '10-14' : '12-18'} kg (untuk usia {ageMonths} bulan)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tinggi Badan (TB) <span className="text-red-500">*</span>
            </label>
            <NumberInputWithControls
              value={data.height}
              onChange={(val) => updateField('height', val)}
              min={50}
              max={120}
              step={0.5}
              disabled={disabled}
            />
            {ageMonths && (
              <p className="text-xs text-gray-500 mt-1">
                Range normal: {ageMonths < 24 ? '75-90' : '85-105'} cm
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lingkar Lengan Atas (LILA)
            </label>
            <NumberInputWithControls
              value={data.lila}
              onChange={(val) => updateField('lila', val)}
              min={10}
              max={25}
              step={0.1}
              disabled={disabled}
            />
            <p className="text-xs text-gray-500 mt-1">Range normal: ≥13.5 cm</p>
          </div>
        </div>
      </div>

      {/* Status Gizi - Auto Calculated */}
      {nutritionStatus && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">Status Gizi - Auto Calculated</h3>
          
          <div className="space-y-4">
            {/* BB/U */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">BB/U (Berat Badan menurut Umur)</p>
                <p className="text-xs text-gray-500">Z-Score: {nutritionStatus.bbu.zScore.toFixed(2)}</p>
              </div>
              <StatusIndicatorBadge
                status={nutritionStatus.bbu.status === 'Normal' ? 'good' : nutritionStatus.bbu.status.includes('Buruk') ? 'danger' : 'warning'}
                label={nutritionStatus.bbu.status}
                size="sm"
              />
            </div>

            {/* TB/U */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">TB/U (Tinggi Badan menurut Umur)</p>
                <p className="text-xs text-gray-500">Z-Score: {nutritionStatus.tbu.zScore.toFixed(2)}</p>
              </div>
              <StatusIndicatorBadge
                status={nutritionStatus.tbu.status === 'Normal' ? 'good' : nutritionStatus.tbu.status.includes('Pendek') ? 'warning' : 'danger'}
                label={nutritionStatus.tbu.status}
                size="sm"
              />
            </div>

            {/* BB/TB */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">BB/TB (Berat Badan menurut Tinggi Badan)</p>
                <p className="text-xs text-gray-500">Z-Score: {nutritionStatus.bbtb.zScore.toFixed(2)}</p>
              </div>
              <StatusIndicatorBadge
                status={nutritionStatus.bbtb.status === 'Gizi Baik' ? 'good' : nutritionStatus.bbtb.status.includes('Buruk') ? 'danger' : 'warning'}
                label={nutritionStatus.bbtb.status}
                size="sm"
              />
            </div>
          </div>

          {/* Overall Status */}
          <div className={`mt-4 p-4 rounded-lg text-center ${
            nutritionStatus.overallType === 'good' ? 'bg-green-100' :
            nutritionStatus.overallType === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <p className="text-xs text-gray-600 mb-1">STATUS GIZI AKHIR:</p>
            <p className={`text-lg font-bold ${
              nutritionStatus.overallType === 'good' ? 'text-green-700' :
              nutritionStatus.overallType === 'warning' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {nutritionStatus.overallStatus}
            </p>
            {nutritionStatus.overallType !== 'good' && (
              <p className="text-sm text-gray-600 mt-1">
                Perlu tindak lanjut dan pemantauan khusus
              </p>
            )}
          </div>

          {/* Alert for stunting */}
          {nutritionStatus.tbu.zScore < -2 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Perhatian: Balita menunjukkan tanda stunting (pendek)</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Rekomendasi: Konseling gizi, rujuk ke puskesmas
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderMpasiTab = () => (
    <div className="space-y-6">
      {/* ASI Eksklusif */}
      <div className="p-4 bg-cyan-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Riwayat ASI Eksklusif</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Apakah balita mendapat ASI Eksklusif? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'yes_6m', label: 'Ya, selama 6 bulan penuh' },
                { value: 'yes_less', label: 'Ya, tapi kurang dari 6 bulan' },
                { value: 'no', label: 'Tidak' },
                { value: 'unknown', label: 'Tidak tahu' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="asi_exclusive"
                    value={opt.value}
                    checked={data.asi_exclusive === opt.value}
                    onChange={(e) => updateField('asi_exclusive', e.target.value)}
                    disabled={disabled}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {(data.asi_exclusive === 'yes_6m' || data.asi_exclusive === 'yes_less') && (
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durasi ASI Eksklusif
              </label>
              <NumberInputWithControls
                value={data.asi_duration_months}
                onChange={(val) => updateField('asi_duration_months', val)}
                min={0}
                max={24}
                disabled={disabled}
              />
              <p className="text-xs text-gray-500 mt-1">bulan</p>
            </div>
          )}
        </div>
      </div>

      {/* MP-ASI */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Makanan Pendamping ASI (MP-ASI)</h3>
        
        <div className="space-y-4">
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usia mulai pemberian MP-ASI <span className="text-red-500">*</span>
            </label>
            <NumberInputWithControls
              value={data.mpasi_start_age}
              onChange={(val) => updateField('mpasi_start_age', val)}
              min={0}
              max={24}
              disabled={disabled}
            />
            <p className="text-xs text-gray-500 mt-1">bulan (Rekomendasi WHO: 6 bulan)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis MP-ASI yang diberikan saat ini
            </label>
            <ChecklistInput
              items={mpasiTypes}
              selectedItems={data.mpasi_types}
              onChange={(items) => updateField('mpasi_types', items)}
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frekuensi makan per hari
              </label>
              <NumberInputWithControls
                value={data.meal_frequency}
                onChange={(val) => updateField('meal_frequency', val)}
                min={1}
                max={6}
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frekuensi snack/cemilan sehat per hari
              </label>
              <NumberInputWithControls
                value={data.snack_frequency}
                onChange={(val) => updateField('snack_frequency', val)}
                min={0}
                max={5}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Gizi & Nafsu Makan */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Status Gizi Saat Ini</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Nafsu Makan</label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'good', label: 'Baik' },
                { value: 'enough', label: 'Cukup' },
                { value: 'poor', label: 'Kurang' },
                { value: 'very_poor', label: 'Sangat Kurang' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="appetite"
                    value={opt.value}
                    checked={data.appetite === opt.value}
                    onChange={(e) => updateField('appetite', e.target.value)}
                    disabled={disabled}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masalah Makan (boleh pilih lebih dari 1)
            </label>
            <ChecklistInput
              items={eatingProblems}
              selectedItems={data.eating_problems}
              onChange={(items) => updateField('eating_problems', items)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderImunisasiTab = () => (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <Syringe className="w-5 h-5 text-blue-600 mt-0.5" />
        <p className="text-sm text-blue-800">
          Tandai imunisasi yang sudah diberikan dan isi tanggal pemberian
        </p>
      </div>

      {/* Progress Bar */}
      <div className="p-4 bg-cyan-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Status Imunisasi Lengkap</span>
          <span className="text-sm font-bold text-cyan-700">
            {immunizationProgress.completed}/{immunizationProgress.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              immunizationProgress.percentage >= 80 ? 'bg-green-500' :
              immunizationProgress.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${immunizationProgress.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {immunizationProgress.percentage}% imunisasi dasar sudah diberikan
        </p>
      </div>

      {/* Immunization List */}
      <div className="space-y-3">
        {immunizationList.map((imm) => {
          const immData = data.immunizations[imm.id] || { given: false, date: '' };
          return (
            <div
              key={imm.id}
              className={`p-4 rounded-lg border ${
                immData.given ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={immData.given}
                    onChange={(e) => updateImmunization(imm.id, e.target.checked)}
                    disabled={disabled}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <p className={`font-medium ${immData.given ? 'text-gray-900' : 'text-gray-600'}`}>
                      {imm.name}
                    </p>
                    <p className="text-xs text-gray-500">Target usia: {imm.target_age}</p>
                  </div>
                </label>
                {immData.given && (
                  <input
                    type="date"
                    value={immData.date}
                    onChange={(e) => updateImmunization(imm.id, true, e.target.value)}
                    disabled={disabled}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vitamin & Suplemen */}
      <div className="p-4 bg-orange-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Vitamin & Suplemen</h3>
        
        <div className="space-y-4">
          {/* Vitamin A Merah */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.vitamin_a_red_given}
                onChange={(e) => updateField('vitamin_a_red_given', e.target.checked)}
                disabled={disabled}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
              <div>
                <p className="font-medium text-gray-900">Vitamin A (Kapsul Merah - 200.000 IU)</p>
                <p className="text-xs text-gray-500">Untuk usia 12-59 bulan, setiap 6 bulan</p>
              </div>
            </label>
            {data.vitamin_a_red_given && (
              <input
                type="date"
                value={data.vitamin_a_red_date}
                onChange={(e) => updateField('vitamin_a_red_date', e.target.value)}
                disabled={disabled}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}
          </div>

          {/* Obat Cacing */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.deworming_given}
                onChange={(e) => updateField('deworming_given', e.target.checked)}
                disabled={disabled}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
              />
              <div>
                <p className="font-medium text-gray-900">Obat Cacing</p>
                <p className="text-xs text-gray-500">Untuk usia &gt;2 tahun</p>
              </div>
            </label>
            {data.deworming_given && (
              <input
                type="date"
                value={data.deworming_date}
                onChange={(e) => updateField('deworming_date', e.target.value)}
                disabled={disabled}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderKesehatanTab = () => (
    <div className="space-y-6">
      {/* Riwayat Penyakit */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Riwayat Penyakit</h3>
        
        <div className="space-y-6">
          {/* ISPA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ISPA (Infeksi Saluran Pernapasan Akut)
            </label>
            <div className="flex flex-wrap gap-4 mb-2">
              {[
                { value: 'never', label: 'Tidak pernah' },
                { value: 'once', label: 'Pernah' },
                { value: 'frequent', label: 'Sering (>3x dalam 6 bulan)' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ispa_status"
                    value={opt.value}
                    checked={data.ispa_status === opt.value}
                    onChange={(e) => updateField('ispa_status', e.target.value)}
                    disabled={disabled}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {data.ispa_status !== 'never' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pl-6">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Terakhir kali sakit ISPA</label>
                  <input
                    type="date"
                    value={data.ispa_last_date}
                    onChange={(e) => updateField('ispa_last_date', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Catatan</label>
                  <input
                    type="text"
                    value={data.ispa_notes}
                    onChange={(e) => updateField('ispa_notes', e.target.value)}
                    disabled={disabled}
                    placeholder="Batuk pilek, sudah sembuh"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Diare */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diare</label>
            <div className="flex flex-wrap gap-4 mb-2">
              {[
                { value: 'never', label: 'Tidak pernah' },
                { value: 'once', label: 'Pernah' },
                { value: 'frequent', label: 'Sering (>3x dalam 6 bulan)' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="diare_status"
                    value={opt.value}
                    checked={data.diare_status === opt.value}
                    onChange={(e) => updateField('diare_status', e.target.value)}
                    disabled={disabled}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {data.diare_status !== 'never' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pl-6">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Terakhir kali diare</label>
                  <input
                    type="date"
                    value={data.diare_last_date}
                    onChange={(e) => updateField('diare_last_date', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Catatan</label>
                  <input
                    type="text"
                    value={data.diare_notes}
                    onChange={(e) => updateField('diare_notes', e.target.value)}
                    disabled={disabled}
                    placeholder="Diare 3 hari, sudah sembuh"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Other diseases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'pneumonia', label: 'Pneumonia' },
              { key: 'dbd', label: 'Demam Berdarah (DBD)' },
              { key: 'campak', label: 'Campak' },
              { key: 'cacar', label: 'Cacar Air' },
            ].map((disease) => (
              <div key={disease.key} className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(data as any)[`${disease.key}_ever`]}
                    onChange={(e) => updateField(`${disease.key}_ever` as any, e.target.checked)}
                    disabled={disabled}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-gray-700">{disease.label}</span>
                </label>
                {(data as any)[`${disease.key}_ever`] && (
                  <input
                    type="date"
                    value={(data as any)[`${disease.key}_date`]}
                    onChange={(e) => updateField(`${disease.key}_date` as any, e.target.value)}
                    disabled={disabled}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-36"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alergi */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Alergi</h3>
        <ChecklistInput
          items={allergyOptions}
          selectedItems={data.allergies}
          onChange={(items) => updateField('allergies', items)}
          disabled={disabled}
        />
        {data.allergies.length > 0 && !data.allergies.includes('none') && (
          <div className="mt-3">
            <input
              type="text"
              value={data.allergy_notes}
              onChange={(e) => updateField('allergy_notes', e.target.value)}
              disabled={disabled}
              placeholder="Jelaskan jenis alergi..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        )}
      </div>

      {/* Riwayat Rawat Inap */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Riwayat Rawat Inap</h3>
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hospitalization"
              checked={!data.hospitalization_ever}
              onChange={() => updateField('hospitalization_ever', false)}
              disabled={disabled}
              className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-gray-700">Tidak pernah</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hospitalization"
              checked={data.hospitalization_ever}
              onChange={() => updateField('hospitalization_ever', true)}
              disabled={disabled}
              className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-gray-700">Pernah</span>
          </label>
        </div>
        {data.hospitalization_ever && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tanggal rawat inap</label>
              <input
                type="date"
                value={data.hospitalization_date}
                onChange={(e) => updateField('hospitalization_date', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Diagnosa/Alasan</label>
              <input
                type="text"
                value={data.hospitalization_diagnosis}
                onChange={(e) => updateField('hospitalization_diagnosis', e.target.value)}
                disabled={disabled}
                placeholder="Demam tinggi"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Rumah Sakit</label>
              <input
                type="text"
                value={data.hospitalization_place}
                onChange={(e) => updateField('hospitalization_place', e.target.value)}
                disabled={disabled}
                placeholder="RS. Umum Daerah"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Perkembangan */}
      <div className="p-4 bg-cyan-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Perkembangan (Opsional)</h3>
        
        <div className="space-y-4">
          {[
            { key: 'motor_development', label: 'Perkembangan Motorik' },
            { key: 'language_development', label: 'Perkembangan Bahasa' },
            { key: 'social_development', label: 'Perkembangan Sosial-Emosional' },
          ].map((dev) => (
            <div key={dev.key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{dev.label}</label>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'normal', label: 'Sesuai usia' },
                  { value: 'delayed', label: dev.key === 'social_development' ? 'Ada masalah' : 'Terlambat' },
                  { value: 'not_assessed', label: 'Belum dinilai' },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={dev.key}
                      value={opt.value}
                      checked={(data as any)[dev.key] === opt.value}
                      onChange={(e) => updateField(dev.key as any, e.target.value)}
                      disabled={disabled}
                      className="w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {data.motor_development === 'delayed' && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Jelaskan keterlambatan motorik</label>
              <input
                type="text"
                value={data.motor_notes}
                onChange={(e) => updateField('motor_notes', e.target.value)}
                disabled={disabled}
                placeholder="Contoh: Belum bisa berjalan di usia 18 bulan"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Catatan Tambahan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Penting Lainnya</label>
        <textarea
          value={data.special_notes}
          onChange={(e) => updateField('special_notes', e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="Riwayat kesehatan atau kondisi khusus lainnya"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <div className="pt-2">
        {activeTab === 'data' && renderDataTab()}
        {activeTab === 'pengukuran' && renderPengukuranTab()}
        {activeTab === 'mpasi' && renderMpasiTab()}
        {activeTab === 'imunisasi' && renderImunisasiTab()}
        {activeTab === 'kesehatan' && renderKesehatanTab()}
      </div>
    </div>
  );
}
