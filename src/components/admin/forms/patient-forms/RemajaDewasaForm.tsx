'use client';

import { useState } from 'react';
import TabNavigation, { Tab } from '../TabNavigation';
import NumberInputWithControls from '../NumberInputWithControls';
import BloodPressureInput from '../BloodPressureInput';
import ChecklistInput from '../ChecklistInput';
import StatusIndicatorBadge from '../StatusIndicatorBadge';
import { calculateIMT, getIMTStatus } from '@/lib/nutritionCalculator';

interface RemajaDewasaFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

const tabs: Tab[] = [
  { id: 'identitas', label: 'Data Diri' },
  { id: 'antropometri', label: 'Antropometri' },
  { id: 'faktor_risiko', label: 'Faktor Risiko' },
  { id: 'gaya_hidup', label: 'Gaya Hidup' },
];

export default function RemajaDewasaForm({ onSubmit, initialData }: RemajaDewasaFormProps) {
  const [activeTab, setActiveTab] = useState('identitas');
  const [formData, setFormData] = useState({
    // Tab 1: Data Diri
    full_name: initialData?.full_name || '',
    nik: initialData?.nik || '',
    date_of_birth: initialData?.date_of_birth || '',
    gender: initialData?.gender || 'L',
    address: initialData?.address || '',
    phone: initialData?.phone || '',
    occupation: initialData?.occupation || '',
    education: initialData?.education || '',

    // Tab 2: Antropometri
    weight: initialData?.weight || '',
    height: initialData?.height || '',
    waist_circumference: initialData?.waist_circumference || '',
    blood_pressure_systolic: initialData?.blood_pressure_systolic || '',
    blood_pressure_diastolic: initialData?.blood_pressure_diastolic || '',

    // Tab 3: Faktor Risiko
    has_hypertension: initialData?.has_hypertension || false,
    has_diabetes: initialData?.has_diabetes || false,
    has_heart_disease: initialData?.has_heart_disease || false,
    family_history: initialData?.family_history || [],
    allergies: initialData?.allergies || '',
    current_medications: initialData?.current_medications || '',

    // Tab 4: Gaya Hidup
    smoking_status: initialData?.smoking_status || 'tidak_pernah',
    cigarettes_per_day: initialData?.cigarettes_per_day || 0,
    alcohol_status: initialData?.alcohol_status || 'tidak_pernah',
    physical_activity: initialData?.physical_activity || 'kurang_aktif',
    exercise_minutes_per_week: initialData?.exercise_minutes_per_week || 0,
    fruit_servings_per_day: initialData?.fruit_servings_per_day || 0,
    vegetable_servings_per_day: initialData?.vegetable_servings_per_day || 0,
    sleep_hours_per_day: initialData?.sleep_hours_per_day || 7,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // IMT calculation
  const imtStatus = formData.weight && formData.height
    ? getIMTStatus(calculateIMT(parseFloat(formData.weight), parseFloat(formData.height)))
    : null;

  // Metabolic risk based on waist circumference
  const getMetabolicRisk = () => {
    if (!formData.waist_circumference) return null;
    const waist = parseFloat(formData.waist_circumference);
    const isMale = formData.gender === 'L';
    const threshold = isMale ? 90 : 80;
    if (waist >= threshold) return { type: 'danger' as const, label: 'Berisiko' };
    return { type: 'good' as const, label: 'Normal' };
  };

  const metabolicRisk = getMetabolicRisk();

  // Diet status
  const getDietStatus = () => {
    const total = (formData.fruit_servings_per_day || 0) + (formData.vegetable_servings_per_day || 0);
    if (total >= 5) return { type: 'good' as const, label: 'Cukup' };
    return { type: 'warning' as const, label: 'Kurang' };
  };

  const dietStatus = getDietStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      patient_type: 'remaja_dewasa',
    });
  };

  const familyHistoryOptions = [
    { id: 'diabetes', label: 'Diabetes Melitus' },
    { id: 'hipertensi', label: 'Hipertensi' },
    { id: 'jantung', label: 'Penyakit Jantung' },
    { id: 'stroke', label: 'Stroke' },
    { id: 'kanker', label: 'Kanker' },
    { id: 'ginjal', label: 'Penyakit Ginjal' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                value={formData.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
              <input
                type="text"
                maxLength={16}
                value={formData.nik}
                onChange={(e) => updateField('nik', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pendidikan</label>
              <select
                value={formData.education}
                onChange={(e) => updateField('education', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pekerjaan</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
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
                min={30}
                max={200}
                step={0.1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tinggi Badan (cm)</label>
              <NumberInputWithControls
                value={formData.height}
                onChange={(val) => updateField('height', val)}
                min={100}
                max={220}
                step={0.5}
              />
            </div>
          </div>

          {imtStatus && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Indeks Massa Tubuh (IMT):</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-gray-900">{imtStatus.value.toFixed(1)}</span>
                <StatusIndicatorBadge status={imtStatus.type} label={imtStatus.label} size="md" />
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
              value={formData.waist_circumference}
              onChange={(val) => updateField('waist_circumference', val)}
              min={50}
              max={200}
              step={0.5}
            />
            {metabolicRisk && (
              <div className="mt-2">
                <StatusIndicatorBadge status={metabolicRisk.type} label={`Risiko Metabolik: ${metabolicRisk.label}`} size="sm" />
              </div>
            )}
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

      {/* Tab 3: Faktor Risiko */}
      {activeTab === 'faktor_risiko' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Riwayat Penyakit</h3>
            <div className="space-y-2">
              {[
                { key: 'has_hypertension', label: 'Hipertensi' },
                { key: 'has_diabetes', label: 'Diabetes Melitus' },
                { key: 'has_heart_disease', label: 'Penyakit Jantung' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData[item.key as keyof typeof formData] as boolean}
                    onChange={(e) => updateField(item.key, e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Riwayat Penyakit Keluarga
            </label>
            <ChecklistInput
              items={familyHistoryOptions}
              selectedItems={formData.family_history}
              onChange={(items) => updateField('family_history', items)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alergi</label>
            <textarea
              value={formData.allergies}
              onChange={(e) => updateField('allergies', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Obat yang Dikonsumsi Rutin</label>
            <textarea
              value={formData.current_medications}
              onChange={(e) => updateField('current_medications', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
        </div>
      )}

      {/* Tab 4: Gaya Hidup */}
      {activeTab === 'gaya_hidup' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Merokok</h3>
            <div className="space-y-2">
              {[
                { value: 'tidak_pernah', label: 'Tidak Pernah' },
                { value: 'pernah', label: 'Pernah (sudah berhenti)' },
                { value: 'aktif', label: 'Aktif' },
              ].map((item) => (
                <label key={item.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="smoking_status"
                    value={item.value}
                    checked={formData.smoking_status === item.value}
                    onChange={(e) => updateField('smoking_status', e.target.value)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
            {formData.smoking_status === 'aktif' && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">Batang per hari:</span>
                <NumberInputWithControls
                  value={formData.cigarettes_per_day}
                  onChange={(val) => updateField('cigarettes_per_day', val)}
                  min={1}
                  max={100}
                />
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Aktivitas Fisik</h3>
            <div className="space-y-2">
              {[
                { value: 'kurang_aktif', label: 'Kurang Aktif (< 150 menit/minggu)' },
                { value: 'cukup_aktif', label: 'Cukup Aktif (150-300 menit/minggu)' },
                { value: 'sangat_aktif', label: 'Sangat Aktif (> 300 menit/minggu)' },
              ].map((item) => (
                <label key={item.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="physical_activity"
                    value={item.value}
                    checked={formData.physical_activity === item.value}
                    onChange={(e) => updateField('physical_activity', e.target.value)}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Pola Makan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Porsi buah per hari</label>
                <NumberInputWithControls
                  value={formData.fruit_servings_per_day}
                  onChange={(val) => updateField('fruit_servings_per_day', val)}
                  min={0}
                  max={10}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Porsi sayur per hari</label>
                <NumberInputWithControls
                  value={formData.vegetable_servings_per_day}
                  onChange={(val) => updateField('vegetable_servings_per_day', val)}
                  min={0}
                  max={10}
                />
              </div>
            </div>
            <div className="mt-3">
              <StatusIndicatorBadge status={dietStatus.type} label={`Konsumsi Serat: ${dietStatus.label} (${(formData.fruit_servings_per_day || 0) + (formData.vegetable_servings_per_day || 0)}/5 porsi)`} size="sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jam Tidur per Hari</label>
            <NumberInputWithControls
              value={formData.sleep_hours_per_day}
              onChange={(val) => updateField('sleep_hours_per_day', val)}
              min={3}
              max={12}
            />
          </div>
        </div>
      )}
    </form>
  );
}
