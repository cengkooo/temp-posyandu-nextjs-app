'use client';

import { useMemo, useState } from 'react';
import TabNavigation, { Tab } from '../TabNavigation';
import NumberInputWithControls from '../NumberInputWithControls';
import BloodPressureInput from '../BloodPressureInput';
import ChecklistInput from '../ChecklistInput';
import StatusIndicatorBadge from '../StatusIndicatorBadge';
import { calculateIMT, getIMTStatus } from '@/lib/nutritionCalculator';

export type LansiaFormData = {
  full_name: string;
  nik: string;
  date_of_birth: string;
  gender: 'L' | 'P';
  address: string;
  phone: string;
  family_name: string;
  family_phone: string;
  family_relation: string;
  living_status: 'dengan_keluarga' | 'sendiri' | 'panti';
  weight: number | undefined;
  height: number | undefined;
  knee_height: number | undefined;
  waist_circumference: number | undefined;
  blood_pressure_systolic: number | undefined;
  blood_pressure_diastolic: number | undefined;
  chronic_diseases: string[];
  current_medications: string;
  allergies: string;
  surgery_history: string;
  hospitalization_history: string;
  adl_eating: 'mandiri' | 'bantuan_sebagian' | 'bantuan_penuh';
  adl_bathing: 'mandiri' | 'bantuan_sebagian' | 'bantuan_penuh';
  adl_dressing: 'mandiri' | 'bantuan_sebagian' | 'bantuan_penuh';
  adl_toileting: 'mandiri' | 'bantuan_sebagian' | 'bantuan_penuh';
  adl_mobility: 'mandiri' | 'bantuan_sebagian' | 'bantuan_penuh';
  uses_assistive_device: boolean;
  assistive_device_type: string;
  fall_history: boolean;
  fall_count_last_year: number;
};

export function createInitialLansiaFormData(): LansiaFormData {
  return {
    full_name: '',
    nik: '',
    date_of_birth: '',
    gender: 'L',
    address: '',
    phone: '',
    family_name: '',
    family_phone: '',
    family_relation: '',
    living_status: 'dengan_keluarga',
    weight: undefined,
    height: undefined,
    knee_height: undefined,
    waist_circumference: undefined,
    blood_pressure_systolic: undefined,
    blood_pressure_diastolic: undefined,
    chronic_diseases: [],
    current_medications: '',
    allergies: '',
    surgery_history: '',
    hospitalization_history: '',
    adl_eating: 'mandiri',
    adl_bathing: 'mandiri',
    adl_dressing: 'mandiri',
    adl_toileting: 'mandiri',
    adl_mobility: 'mandiri',
    uses_assistive_device: false,
    assistive_device_type: '',
    fall_history: false,
    fall_count_last_year: 0,
  };
}

interface LansiaFormProps {
  data: LansiaFormData;
  onChange: (data: LansiaFormData) => void;
  disabled?: boolean;
}

const tabs: Tab[] = [
  { id: 'identitas', label: 'Data Lansia' },
  { id: 'antropometri', label: 'Antropometri' },
  { id: 'kesehatan', label: 'Riwayat Kesehatan' },
  { id: 'fungsional', label: 'Status Fungsional' },
];

export default function LansiaForm({ data, onChange }: LansiaFormProps) {
  const [activeTab, setActiveTab] = useState('identitas');
  const formData = data;

  const updateField = <K extends keyof LansiaFormData>(field: K, value: LansiaFormData[K]) => {
    onChange({ ...formData, [field]: value });
  };

  // IMT calculation
  const imtStatus = formData.weight !== undefined && formData.height !== undefined
    ? getIMTStatus(calculateIMT(formData.weight, formData.height))
    : null;

  // ADL Score calculation
  const calculateADLScore = () => {
    const scores: Record<string, number> = {
      mandiri: 2,
      bantuan_sebagian: 1,
      bantuan_penuh: 0,
    };
    const total = 
      scores[formData.adl_eating] +
      scores[formData.adl_bathing] +
      scores[formData.adl_dressing] +
      scores[formData.adl_toileting] +
      scores[formData.adl_mobility];
    
    if (total >= 9) return { score: total, status: 'Mandiri', type: 'good' as const };
    if (total >= 5) return { score: total, status: 'Ketergantungan Ringan', type: 'warning' as const };
    return { score: total, status: 'Ketergantungan Berat', type: 'danger' as const };
  };

  const adlResult = calculateADLScore();

  const chronicDiseaseOptions = [
    { id: 'hipertensi', label: 'Hipertensi' },
    { id: 'diabetes', label: 'Diabetes Melitus' },
    { id: 'jantung', label: 'Penyakit Jantung' },
    { id: 'stroke', label: 'Stroke' },
    { id: 'arthritis', label: 'Arthritis/Rematik' },
    { id: 'osteoporosis', label: 'Osteoporosis' },
    { id: 'katarak', label: 'Katarak' },
    { id: 'gangguan_pendengaran', label: 'Gangguan Pendengaran' },
    { id: 'asma', label: 'Asma/PPOK' },
    { id: 'ginjal', label: 'Penyakit Ginjal' },
  ];

  const chronicDiseaseItems = useMemo(
    () => chronicDiseaseOptions.map((item) => ({ ...item, checked: formData.chronic_diseases.includes(item.id) })),
    [formData.chronic_diseases, chronicDiseaseOptions]
  );

  const adlOptions = [
    { value: 'mandiri', label: 'Mandiri' },
    { value: 'bantuan_sebagian', label: 'Bantuan Sebagian' },
    { value: 'bantuan_penuh', label: 'Bantuan Penuh' },
  ];

  return (
    <div className="space-y-6">
      <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Data Lansia */}
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
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
              <input
                type="text"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => updateField('date_of_birth', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'L' || value === 'P') {
                    updateField('gender', value);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Tinggal</label>
            <select
              value={formData.living_status}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'dengan_keluarga' || value === 'sendiri' || value === 'panti') {
                  updateField('living_status', value);
                }
              }}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="dengan_keluarga">Tinggal dengan Keluarga</option>
              <option value="sendiri">Tinggal Sendiri</option>
              <option value="panti">Tinggal di Panti</option>
            </select>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Kontak Keluarga/Pendamping</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                <input
                  type="text"
                  value={formData.family_name}
                  onChange={(e) => updateField('family_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                <input
                  type="tel"
                  value={formData.family_phone}
                  onChange={(e) => updateField('family_phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hubungan</label>
                <select
                  value={formData.family_relation}
                  onChange={(e) => updateField('family_relation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Pilih</option>
                  <option value="anak">Anak</option>
                  <option value="menantu">Menantu</option>
                  <option value="cucu">Cucu</option>
                  <option value="saudara">Saudara</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Antropometri */}
      {activeTab === 'antropometri' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Berat Badan (kg)</label>
              <NumberInputWithControls
                value={formData.weight}
                onChange={(val) => updateField('weight', val)}
                min={20}
                max={150}
                step={0.1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tinggi Badan (cm)</label>
              <NumberInputWithControls
                value={formData.height}
                onChange={(val) => updateField('height', val)}
                min={100}
                max={200}
                step={0.5}
              />
            </div>
          </div>

          {imtStatus && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Indeks Massa Tubuh (IMT):</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-gray-900">{imtStatus.value.toFixed(1)}</span>
                <StatusIndicatorBadge status={imtStatus.type} label={imtStatus.label} size="sm" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tinggi Lutut (cm)</label>
              <NumberInputWithControls
                value={formData.knee_height}
                onChange={(val) => updateField('knee_height', val)}
                min={30}
                max={70}
                step={0.5}
              />
              <p className="text-xs text-gray-500 mt-1">*Untuk estimasi TB jika lansia tidak bisa berdiri</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lingkar Perut (cm)</label>
              <NumberInputWithControls
                value={formData.waist_circumference}
                onChange={(val) => updateField('waist_circumference', val)}
                min={50}
                max={150}
                step={0.5}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tekanan Darah</label>
            <BloodPressureInput
              systolic={formData.blood_pressure_systolic}
              diastolic={formData.blood_pressure_diastolic}
              onSystolicChange={(val) => updateField('blood_pressure_systolic', val)}
              onDiastolicChange={(val) => updateField('blood_pressure_diastolic', val)}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Riwayat Kesehatan */}
      {activeTab === 'kesehatan' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Penyakit yang Diderita</label>
            <ChecklistInput
              items={chronicDiseaseItems}
              onChange={(items) => updateField('chronic_diseases', items.filter((i) => i.checked).map((i) => i.id))}
              showDates={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Obat yang Dikonsumsi Rutin</label>
            <textarea
              value={formData.current_medications}
              onChange={(e) => updateField('current_medications', e.target.value)}
              rows={3}
              placeholder="Contoh: Amlodipine 5mg 1x1, Metformin 500mg 2x1..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alergi Obat/Makanan</label>
            <textarea
              value={formData.allergies}
              onChange={(e) => updateField('allergies', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Riwayat Operasi</label>
            <textarea
              value={formData.surgery_history}
              onChange={(e) => updateField('surgery_history', e.target.value)}
              rows={2}
              placeholder="Contoh: Operasi katarak mata kanan (2020)..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Status Fungsional */}
      {activeTab === 'fungsional' && (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Penilaian Aktivitas Harian (ADL)</h3>
            <div className="space-y-3">
              {[
                { key: 'adl_eating' as const, label: 'Makan' },
                { key: 'adl_bathing' as const, label: 'Mandi' },
                { key: 'adl_dressing' as const, label: 'Berpakaian' },
                { key: 'adl_toileting' as const, label: 'Ke Toilet' },
                { key: 'adl_mobility' as const, label: 'Berpindah/Mobilitas' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <select
                    value={formData[item.key as keyof typeof formData] as string}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'mandiri' || value === 'bantuan_sebagian' || value === 'bantuan_penuh') {
                        updateField(item.key, value);
                      }
                    }}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {adlOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-orange-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Skor ADL</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{adlResult.score}/10</span>
                  <StatusIndicatorBadge status={adlResult.type} label={adlResult.status} size="sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="uses_assistive_device"
                checked={formData.uses_assistive_device}
                onChange={(e) => updateField('uses_assistive_device', e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <label htmlFor="uses_assistive_device" className="text-sm text-gray-700">
                Menggunakan alat bantu jalan
              </label>
            </div>
            
            {formData.uses_assistive_device && (
              <div className="ml-7">
                <select
                  value={formData.assistive_device_type}
                  onChange={(e) => updateField('assistive_device_type', e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Pilih jenis alat bantu</option>
                  <option value="tongkat">Tongkat</option>
                  <option value="walker">Walker</option>
                  <option value="kursi_roda">Kursi Roda</option>
                  <option value="kruk">Kruk</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="fall_history"
                checked={formData.fall_history}
                onChange={(e) => updateField('fall_history', e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <label htmlFor="fall_history" className="text-sm text-gray-700">
                Pernah jatuh dalam 1 tahun terakhir
              </label>
            </div>
            
            {formData.fall_history && (
              <div className="ml-7 flex items-center gap-2">
                <span className="text-sm text-gray-600">Berapa kali:</span>
                <NumberInputWithControls
                  value={formData.fall_count_last_year}
                  onChange={(val) => updateField('fall_count_last_year', val ?? formData.fall_count_last_year)}
                  min={1}
                  max={20}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
