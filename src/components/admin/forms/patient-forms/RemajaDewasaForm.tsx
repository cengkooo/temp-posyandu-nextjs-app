'use client';

import { useState, useMemo } from 'react';
import TabNavigation, { Tab } from '../TabNavigation';
import NumberInputWithControls from '../NumberInputWithControls';
import ChecklistInput from '../ChecklistInput';
import StatusIndicatorBadge from '../StatusIndicatorBadge';
import { calculateIMT, getIMTStatus } from '@/lib/nutritionCalculator';
import { User, Ruler, Activity, Heart } from 'lucide-react';

export interface RemajaDewasaFormData {
  // Tab 1: Data Diri
  full_name: string;
  nik: string;
  date_of_birth: string;
  gender: 'L' | 'P' | '';
  address: string;
  phone: string;
  occupation: string;
  marital_status: string;
  
  // Tab 2: Antropometri
  weight: number | undefined;
  height: number | undefined;
  waist_circumference: number | undefined;
  blood_pressure_systolic: number | undefined;
  blood_pressure_diastolic: number | undefined;
  measurement_date: string;
  
  // Tab 3: Faktor Risiko PTM
  smoking_status: 'tidak_pernah' | 'pernah' | 'aktif';
  cigarettes_per_day: number | undefined;
  physical_activity: 'kurang' | 'cukup' | 'sangat';
  activity_minutes_per_week: number | undefined;
  vegetable_portions_per_day: number | undefined;
  fruit_portions_per_day: number | undefined;
  
  // Tab 4: Pemeriksaan Lab (Optional)
  blood_sugar_random: number | undefined;
  blood_sugar_fasting: number | undefined;
  cholesterol_total: number | undefined;
  cholesterol_ldl: number | undefined;
  cholesterol_hdl: number | undefined;
  triglycerides: number | undefined;
  uric_acid: number | undefined;
  
  special_notes: string;
}

export function createInitialRemajaDewasaFormData(): RemajaDewasaFormData {
  return {
    full_name: '',
    nik: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
    occupation: '',
    marital_status: '',
    weight: undefined,
    height: undefined,
    waist_circumference: undefined,
    blood_pressure_systolic: undefined,
    blood_pressure_diastolic: undefined,
    measurement_date: new Date().toISOString().split('T')[0],
    smoking_status: 'tidak_pernah',
    cigarettes_per_day: undefined,
    physical_activity: 'kurang',
    activity_minutes_per_week: undefined,
    vegetable_portions_per_day: undefined,
    fruit_portions_per_day: undefined,
    blood_sugar_random: undefined,
    blood_sugar_fasting: undefined,
    cholesterol_total: undefined,
    cholesterol_ldl: undefined,
    cholesterol_hdl: undefined,
    triglycerides: undefined,
    uric_acid: undefined,
    special_notes: '',
  };
}

interface RemajaDewasaFormProps {
  data: RemajaDewasaFormData;
  onChange: (data: RemajaDewasaFormData) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

const tabs: Tab[] = [
  { id: 'identitas', label: 'Data Diri', icon: <User className="w-4 h-4" /> },
  { id: 'antropometri', label: 'Antropometri', icon: <Ruler className="w-4 h-4" /> },
  { id: 'faktor_risiko', label: 'Faktor Risiko PTM', icon: <Activity className="w-4 h-4" /> },
  { id: 'lab', label: 'Hasil Lab', icon: <Heart className="w-4 h-4" /> },
];

export default function RemajaDewasaForm({ data, onChange, errors = {}, disabled = false }: RemajaDewasaFormProps) {
  const [activeTab, setActiveTab] = useState('identitas');

  const updateField = (field: keyof RemajaDewasaFormData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  // IMT calculation
  const imtResult = useMemo(() => {
    if (data.weight === undefined || data.height === undefined || data.height === 0) return null;
    const weight = data.weight;
    const height = data.height;
    const imt = calculateIMT(weight, height);
    return {
      value: imt,
      status: getIMTStatus(imt)
    };
  }, [data.weight, data.height]);

  // Metabolic risk based on waist circumference
  const metabolicRisk = useMemo(() => {
    if (data.waist_circumference === undefined || !data.gender) return null;
    const waist = data.waist_circumference;
    const isMale = data.gender === 'L';
    const threshold = isMale ? 90 : 80;
    if (waist >= threshold) return { type: 'danger' as const, label: 'Berisiko' };
    return { type: 'good' as const, label: 'Normal' };
  }, [data.waist_circumference, data.gender]);

  // Blood pressure status
  const bpStatus = useMemo(() => {
    if (data.blood_pressure_systolic === undefined || data.blood_pressure_diastolic === undefined) return null;
    const sys = data.blood_pressure_systolic;
    const dia = data.blood_pressure_diastolic;
    
    if (sys < 120 && dia < 80) return { type: 'good' as const, label: 'Normal' };
    if (sys < 130 && dia < 85) return { type: 'warning' as const, label: 'Prehipertensi' };
    if (sys < 140 || dia < 90) return { type: 'warning' as const, label: 'Hipertensi Stage 1' };
    return { type: 'danger' as const, label: 'Hipertensi Stage 2' };
  }, [data.blood_pressure_systolic, data.blood_pressure_diastolic]);

  // Diet status
  const dietStatus = useMemo(() => {
    const veg = data.vegetable_portions_per_day ?? 0;
    const fruit = data.fruit_portions_per_day ?? 0;
    const total = veg + fruit;
    if (total >= 5) return { type: 'good' as const, label: 'Cukup' };
    return { type: 'warning' as const, label: 'Kurang' };
  }, [data.vegetable_portions_per_day, data.fruit_portions_per_day]);

  return (
    <div className="space-y-6">
      <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Data Diri */}
      {activeTab === 'identitas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={disabled}
                value={data.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
              {errors?.full_name && (
                <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
              <input
                type="text"
                maxLength={16}
                disabled={disabled}
                value={data.nik}
                onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                placeholder="16 digit angka"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={disabled}
                value={data.date_of_birth}
                onChange={(e) => updateField('date_of_birth', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={disabled}
                value={data.gender}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === 'L' || value === 'P') {
                    updateField('gender', value);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              >
                <option value="">Pilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea
              disabled={disabled}
              value={data.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
              <input
                type="tel"
                disabled={disabled}
                value={data.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pekerjaan</label>
              <input
                type="text"
                disabled={disabled}
                value={data.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Pernikahan</label>
            <select
              disabled={disabled}
              value={data.marital_status}
              onChange={(e) => updateField('marital_status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="">Pilih</option>
              <option value="belum_menikah">Belum Menikah</option>
              <option value="menikah">Menikah</option>
              <option value="cerai">Cerai</option>
              <option value="janda_duda">Janda/Duda</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab 2: Antropometri */}
      {activeTab === 'antropometri' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pengukuran</label>
            <input
              type="date"
              disabled={disabled}
              value={data.measurement_date}
              onChange={(e) => updateField('measurement_date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Berat Badan (kg)</label>
              <NumberInputWithControls
                value={data.weight}
                onChange={(val) => updateField('weight', val)}
                min={30}
                max={200}
                step={0.1}
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tinggi Badan (cm)</label>
              <NumberInputWithControls
                value={data.height}
                onChange={(val) => updateField('height', val)}
                min={100}
                max={220}
                step={0.5}
                disabled={disabled}
              />
            </div>
          </div>

          {imtResult && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Indeks Massa Tubuh (IMT):</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-gray-900">{imtResult.value.toFixed(1)}</span>
                <StatusIndicatorBadge status={imtResult.status.type} label={imtResult.status.label} size="md" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lingkar Perut (cm)
              <span className="text-xs text-gray-500 ml-1">
                (Risiko: Pria ≥90 cm, Wanita ≥80 cm)
              </span>
            </label>
            <NumberInputWithControls
              value={data.waist_circumference}
              onChange={(val) => updateField('waist_circumference', val)}
              min={50}
              max={200}
              step={0.5}
              disabled={disabled}
            />
            {metabolicRisk && (
              <div className="mt-2">
                <StatusIndicatorBadge 
                  status={metabolicRisk.type} 
                  label={`Risiko Metabolik: ${metabolicRisk.label}`} 
                  size="sm" 
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tekanan Darah (mmHg)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sistolik</label>
                <NumberInputWithControls
                  value={data.blood_pressure_systolic}
                  onChange={(val) => updateField('blood_pressure_systolic', val)}
                  min={60}
                  max={250}
                  step={1}
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Diastolik</label>
                <NumberInputWithControls
                  value={data.blood_pressure_diastolic}
                  onChange={(val) => updateField('blood_pressure_diastolic', val)}
                  min={40}
                  max={150}
                  step={1}
                  disabled={disabled}
                />
              </div>
            </div>
            {bpStatus && (
              <div className="mt-2">
                <StatusIndicatorBadge status={bpStatus.type} label={bpStatus.label} size="sm" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Faktor Risiko PTM */}
      {activeTab === 'faktor_risiko' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Status Merokok</h3>
            <div className="space-y-2">
              {[
                { value: 'tidak_pernah', label: 'Tidak Pernah' },
                { value: 'pernah', label: 'Pernah (sudah berhenti)' },
                { value: 'aktif', label: 'Aktif Merokok' },
              ].map((item) => (
                <label key={item.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="smoking_status"
                    value={item.value}
                    disabled={disabled}
                    checked={data.smoking_status === item.value}
                    onChange={(e) => updateField('smoking_status', e.target.value as 'tidak' | 'aktif' | 'mantan')}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
            {data.smoking_status === 'aktif' && (
              <div className="mt-3">
                <label className="block text-sm text-gray-600 mb-1">Batang per hari:</label>
                <NumberInputWithControls
                  value={data.cigarettes_per_day}
                  onChange={(val) => updateField('cigarettes_per_day', val)}
                  min={1}
                  max={100}
                  disabled={disabled}
                />
              </div>
            )}
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Aktivitas Fisik</h3>
            <div className="space-y-2">
              {[
                { value: 'kurang', label: 'Kurang Aktif (< 150 menit/minggu)' },
                { value: 'cukup', label: 'Cukup Aktif (150-300 menit/minggu)' },
                { value: 'sangat', label: 'Sangat Aktif (> 300 menit/minggu)' },
              ].map((item) => (
                <label key={item.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="physical_activity"
                    value={item.value}
                    disabled={disabled}
                    checked={data.physical_activity === item.value}
                    onChange={(e) => updateField('physical_activity', e.target.value as 'tidak_aktif' | 'ringan' | 'sedang' | 'berat')}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-600 mb-1">Durasi per minggu (menit):</label>
              <NumberInputWithControls
                value={data.activity_minutes_per_week}
                onChange={(val) => updateField('activity_minutes_per_week', val)}
                min={0}
                max={1000}
                step={10}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Pola Makan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Porsi Sayur per hari:</label>
                <NumberInputWithControls
                  value={data.vegetable_portions_per_day}
                  onChange={(val) => updateField('vegetable_portions_per_day', val)}
                  min={0}
                  max={10}
                  step={0.5}
                  disabled={disabled}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Porsi Buah per hari:</label>
                <NumberInputWithControls
                  value={data.fruit_portions_per_day}
                  onChange={(val) => updateField('fruit_portions_per_day', val)}
                  min={0}
                  max={10}
                  step={0.5}
                  disabled={disabled}
                />
              </div>
            </div>
            {dietStatus && (
              <div className="mt-3">
                <StatusIndicatorBadge 
                  status={dietStatus.type} 
                  label={`Konsumsi Sayur & Buah: ${dietStatus.label} (Target: ≥5 porsi)`} 
                  size="sm" 
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Hasil Lab */}
      {activeTab === 'lab' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">Field ini opsional dan bisa diisi saat pemeriksaan lab dilakukan</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gula Darah Sewaktu (mg/dL)
              </label>
              <NumberInputWithControls
                value={data.blood_sugar_random}
                onChange={(val) => updateField('blood_sugar_random', val)}
                min={50}
                max={600}
                step={1}
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gula Darah Puasa (mg/dL)
              </label>
              <NumberInputWithControls
                value={data.blood_sugar_fasting}
                onChange={(val) => updateField('blood_sugar_fasting', val)}
                min={50}
                max={400}
                step={1}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kolesterol Total (mg/dL)
              </label>
              <NumberInputWithControls
                value={data.cholesterol_total}
                onChange={(val) => updateField('cholesterol_total', val)}
                min={100}
                max={500}
                step={1}
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LDL (mg/dL)
              </label>
              <NumberInputWithControls
                value={data.cholesterol_ldl}
                onChange={(val) => updateField('cholesterol_ldl', val)}
                min={50}
                max={400}
                step={1}
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HDL (mg/dL)
              </label>
              <NumberInputWithControls
                value={data.cholesterol_hdl}
                onChange={(val) => updateField('cholesterol_hdl', val)}
                min={20}
                max={150}
                step={1}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trigliserida (mg/dL)
              </label>
              <NumberInputWithControls
                value={data.triglycerides}
                onChange={(val) => updateField('triglycerides', val)}
                min={50}
                max={1000}
                step={1}
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asam Urat (mg/dL)
              </label>
              <NumberInputWithControls
                value={data.uric_acid}
                onChange={(val) => updateField('uric_acid', val)}
                min={1}
                max={20}
                step={0.1}
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Khusus</label>
            <textarea
              disabled={disabled}
              value={data.special_notes}
              onChange={(e) => updateField('special_notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:bg-gray-100"
              placeholder="Catatan tambahan terkait kesehatan pasien..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
