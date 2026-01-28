'use client';

import { useMemo, useState } from 'react';
import TabNavigation, { Tab } from '../TabNavigation';
import NumberInputWithControls from '../NumberInputWithControls';
import ChecklistInput from '../ChecklistInput';
import StatusIndicatorBadge from '../StatusIndicatorBadge';
import { getIMTStatus } from '@/lib/nutritionCalculator';

export type IbuHamilFormData = {
  full_name: string;
  nik: string;
  date_of_birth: string;
  address: string;
  phone: string;
  blood_type: string;
  rhesus: '+' | '-';
  husband_name: string;
  husband_phone: string;
  education: string;
  occupation: string;
  hpht: string;
  hpl: string;
  initial_weight: number | undefined;
  initial_height: number | undefined;
  lila: number | undefined;
  gravida: number;
  para: number;
  abortus: number;
  previous_pregnancies: string;
  chronic_diseases: string[];
  allergies: string;
  current_medications: string;
  family_history: string;
};

export function createInitialIbuHamilFormData(): IbuHamilFormData {
  return {
    full_name: '',
    nik: '',
    date_of_birth: '',
    address: '',
    phone: '',
    blood_type: '',
    rhesus: '+',
    husband_name: '',
    husband_phone: '',
    education: '',
    occupation: '',
    hpht: '',
    hpl: '',
    initial_weight: undefined,
    initial_height: undefined,
    lila: undefined,
    gravida: 1,
    para: 0,
    abortus: 0,
    previous_pregnancies: '',
    chronic_diseases: [],
    allergies: '',
    current_medications: '',
    family_history: '',
  };
}

interface IbuHamilFormProps {
  data: IbuHamilFormData;
  onChange: (data: IbuHamilFormData) => void;
  disabled?: boolean;
}

const tabs: Tab[] = [
  { id: 'identitas', label: 'Data Ibu' },
  { id: 'kehamilan', label: 'Data Kehamilan' },
  { id: 'riwayat', label: 'Riwayat Obstetri' },
  { id: 'kesehatan', label: 'Riwayat Kesehatan' },
];

export default function IbuHamilForm({ data, onChange }: IbuHamilFormProps) {
  const [activeTab, setActiveTab] = useState('identitas');
  const formData = data;

  const updateField = <K extends keyof IbuHamilFormData>(field: K, value: IbuHamilFormData[K]) => {
    onChange({ ...formData, [field]: value });
  };

  // Calculate HPL from HPHT
  const calculateHPL = (hpht: string) => {
    if (!hpht) return '';
    const hphtDate = new Date(hpht);
    hphtDate.setDate(hphtDate.getDate() + 280); // 40 weeks
    return hphtDate.toISOString().split('T')[0];
  };

  // Calculate pregnancy weeks
  const calculatePregnancyWeeks = () => {
    if (!formData.hpht) return null;
    const hpht = new Date(formData.hpht);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hpht.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  };

  // IMT calculation
  const calculatePregnancyIMT = () => {
    if (!formData.initial_weight || !formData.initial_height) return null;
    const imt = formData.initial_weight / Math.pow(formData.initial_height / 100, 2);
    return getIMTStatus(imt);
  };

  // LILA status
  const getLILAStatus = () => {
    if (!formData.lila) return null;
    const lila = formData.lila;
    if (lila >= 23.5) return { type: 'good' as const, label: 'Normal' };
    return { type: 'danger' as const, label: 'Risiko KEK' };
  };

  const pregnancyWeeks = calculatePregnancyWeeks();
  const imtStatus = calculatePregnancyIMT();
  const lilaStatus = getLILAStatus();

  const chronicDiseaseOptions = [
    { id: 'hipertensi', label: 'Hipertensi' },
    { id: 'diabetes', label: 'Diabetes Melitus' },
    { id: 'jantung', label: 'Penyakit Jantung' },
    { id: 'asma', label: 'Asma' },
    { id: 'anemia', label: 'Anemia' },
    { id: 'tbc', label: 'TBC' },
    { id: 'hiv', label: 'HIV/AIDS' },
    { id: 'hepatitis', label: 'Hepatitis B' },
  ];

  const chronicDiseaseItems = useMemo(
    () => chronicDiseaseOptions.map((item) => ({ ...item, checked: formData.chronic_diseases.includes(item.id) })),
    [formData.chronic_diseases, chronicDiseaseOptions]
  );

  return (
    <div className="space-y-6">
      <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Data Ibu */}
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
              <input
                type="text"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                value={formData.date_of_birth}
                onChange={(e) => updateField('date_of_birth', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Golongan Darah</label>
              <select
                value={formData.blood_type}
                onChange={(e) => updateField('blood_type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Pilih</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rhesus</label>
              <select
                value={formData.rhesus}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '+' || value === '-') {
                    updateField('rhesus', value);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="+">Positif (+)</option>
                <option value="-">Negatif (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pendidikan</label>
              <select
                value={formData.education}
                onChange={(e) => updateField('education', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Pilih</option>
                <option value="sd">SD</option>
                <option value="smp">SMP</option>
                <option value="sma">SMA</option>
                <option value="d3">D3</option>
                <option value="s1">S1</option>
                <option value="s2">S2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Suami</label>
              <input
                type="text"
                value={formData.husband_name}
                onChange={(e) => updateField('husband_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon Suami</label>
              <input
                type="tel"
                value={formData.husband_phone}
                onChange={(e) => updateField('husband_phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Data Kehamilan */}
      {activeTab === 'kehamilan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HPHT (Hari Pertama Haid Terakhir) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.hpht}
                onChange={(e) => {
                  updateField('hpht', e.target.value);
                  updateField('hpl', calculateHPL(e.target.value));
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HPL (Hari Perkiraan Lahir)</label>
              <input
                type="date"
                value={formData.hpl}
                readOnly
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
              />
              {pregnancyWeeks && (
                <p className="text-sm text-pink-600 mt-1">
                  Usia Kehamilan: <strong>{pregnancyWeeks} minggu</strong> (Trimester {pregnancyWeeks <= 12 ? 1 : pregnancyWeeks <= 27 ? 2 : 3})
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">BB Sebelum Hamil (kg)</label>
              <NumberInputWithControls
                value={formData.initial_weight}
                onChange={(val) => updateField('initial_weight', val)}
                min={30}
                max={150}
                step={0.1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tinggi Badan (cm)</label>
              <NumberInputWithControls
                value={formData.initial_height}
                onChange={(val) => updateField('initial_height', val)}
                min={100}
                max={200}
                step={0.5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LILA (cm)</label>
              <NumberInputWithControls
                value={formData.lila}
                onChange={(val) => updateField('lila', val)}
                min={15}
                max={40}
                step={0.1}
              />
              {lilaStatus && (
                <div className="mt-2">
                  <StatusIndicatorBadge status={lilaStatus.type} label={lilaStatus.label} size="sm" />
                </div>
              )}
            </div>
          </div>

          {imtStatus && (
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">IMT Prahamil:</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-gray-900">{imtStatus.value.toFixed(1)}</span>
                <StatusIndicatorBadge status={imtStatus.type} label={imtStatus.label} size="sm" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Riwayat Obstetri */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          <div className="p-4 bg-pink-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Riwayat Kehamilan (GPA)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Gravida (G)</label>
                <NumberInputWithControls
                  value={formData.gravida}
                  onChange={(val) => updateField('gravida', val ?? formData.gravida)}
                  min={1}
                  max={20}
                />
                <p className="text-xs text-gray-500 mt-1">Kehamilan ke-</p>
              </div>
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Para (P)</label>
                <NumberInputWithControls
                  value={formData.para}
                  onChange={(val) => updateField('para', val ?? formData.para)}
                  min={0}
                  max={20}
                />
                <p className="text-xs text-gray-500 mt-1">Persalinan</p>
              </div>
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">Abortus (A)</label>
                <NumberInputWithControls
                  value={formData.abortus}
                  onChange={(val) => updateField('abortus', val ?? formData.abortus)}
                  min={0}
                  max={20}
                />
                <p className="text-xs text-gray-500 mt-1">Keguguran</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Riwayat Persalinan Sebelumnya</label>
            <textarea
              value={formData.previous_pregnancies}
              onChange={(e) => updateField('previous_pregnancies', e.target.value)}
              rows={4}
              placeholder="Contoh: Tahun 2020 - Persalinan normal, BBL 3.2 kg, sehat..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Riwayat Kesehatan */}
      {activeTab === 'kesehatan' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Riwayat Penyakit</label>
            <ChecklistInput
              items={chronicDiseaseItems}
              onChange={(items) => updateField('chronic_diseases', items.filter((i) => i.checked).map((i) => i.id))}
              showDates={false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alergi</label>
            <textarea
              value={formData.allergies}
              onChange={(e) => updateField('allergies', e.target.value)}
              rows={2}
              placeholder="Contoh: Alergi obat penisilin, alergi makanan laut..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Obat yang Dikonsumsi Rutin</label>
            <textarea
              value={formData.current_medications}
              onChange={(e) => updateField('current_medications', e.target.value)}
              rows={2}
              placeholder="Contoh: Vitamin prenatal, suplemen zat besi..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Riwayat Penyakit Keluarga</label>
            <textarea
              value={formData.family_history}
              onChange={(e) => updateField('family_history', e.target.value)}
              rows={2}
              placeholder="Contoh: Ibu diabetes, ayah hipertensi..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
