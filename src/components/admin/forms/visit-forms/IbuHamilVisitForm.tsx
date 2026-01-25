'use client';

import React, { useMemo } from 'react';
import NumberInputWithControls from '../NumberInputWithControls';
import BloodPressureInput from '../BloodPressureInput';
import ChecklistInput, { ChecklistItem } from '../ChecklistInput';
import StatusIndicatorBadge from '../StatusIndicatorBadge';
import { getLILAStatus, calculatePregnancyWeeks, getPregnancyTrimester } from '@/lib/nutritionCalculator';

const KONSELING_ITEMS = [
  { id: 'gizi_hamil', label: 'Gizi Ibu Hamil' },
  { id: 'persiapan_persalinan', label: 'Persiapan Persalinan' },
  { id: 'asi_eksklusif', label: 'ASI Eksklusif' },
  { id: 'perawatan_bayi', label: 'Perawatan Bayi' },
  { id: 'tanda_bahaya', label: 'Tanda Bahaya Kehamilan' },
  { id: 'kb', label: 'KB Pasca Persalinan' },
];

const IMUNISASI_TT_ITEMS = [
  { id: 'tt1', label: 'TT1' },
  { id: 'tt2', label: 'TT2' },
  { id: 'tt3', label: 'TT3' },
  { id: 'tt4', label: 'TT4' },
  { id: 'tt5', label: 'TT5' },
];

export interface IbuHamilVisitData {
  // Vital Signs
  weight?: number;
  height?: number;
  lila?: number;
  systolic?: number;
  diastolic?: number;
  pregnancy_weeks?: number;

  // Pregnancy Specific
  fundal_height?: number;
  fetal_heart_rate?: number;
  fetal_presentation: string;
  edema: boolean | null;
  protein_urine: 'negatif' | 'positif' | '';

  // Services
  ttd_given?: number;
  immunization_tt: ChecklistItem[];
  counseling: ChecklistItem[];

  // Notes
  complaints: string;
  notes: string;
}

interface IbuHamilVisitFormProps {
  data: IbuHamilVisitData;
  onChange: (data: IbuHamilVisitData) => void;
  hpht?: string; // Hari Pertama Haid Terakhir
  initialWeight?: number; // BB sebelum hamil
  disabled?: boolean;
  errors?: Record<string, string>;
}

export default function IbuHamilVisitForm({
  data,
  onChange,
  hpht,
  initialWeight,
  disabled = false,
  errors = {},
}: IbuHamilVisitFormProps) {
  // Calculate pregnancy info
  const pregnancyInfo = useMemo(() => {
    if (!hpht) return null;
    const weeks = calculatePregnancyWeeks(hpht);
    const trimester = getPregnancyTrimester(weeks);
    return { weeks, trimester };
  }, [hpht]);

  // Calculate LILA status
  const lilaStatus = useMemo(() => {
    if (!data.lila) return null;
    return getLILAStatus(data.lila);
  }, [data.lila]);

  // Calculate weight gain
  const weightGain = useMemo(() => {
    if (!data.weight || !initialWeight) return null;
    const gain = data.weight - initialWeight;
    const status = gain < 0 ? 'danger' : gain < 8 ? 'warning' : gain <= 16 ? 'good' : 'warning';
    return { gain, status, label: `${gain > 0 ? '+' : ''}${gain.toFixed(1)} kg` };
  }, [data.weight, initialWeight]);

  const updateField = <K extends keyof IbuHamilVisitData>(field: K, value: IbuHamilVisitData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Pregnancy Info Summary */}
      {pregnancyInfo && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-pink-700 font-medium">
              Usia Kehamilan: {pregnancyInfo.weeks} minggu
            </span>
            <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
              Trimester {pregnancyInfo.trimester}
            </span>
          </div>
        </div>
      )}

      {/* Vital Signs Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
          Tanda Vital & Antropometri
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumberInputWithControls
            label="Berat Badan"
            value={data.weight}
            onChange={(v) => updateField('weight', v)}
            min={30}
            max={150}
            step={0.1}
            unit="kg"
            disabled={disabled}
            error={errors.weight}
            required
          />

          <NumberInputWithControls
            label="Tinggi Badan"
            value={data.height}
            onChange={(v) => updateField('height', v)}
            min={100}
            max={200}
            step={1}
            unit="cm"
            disabled={disabled}
            error={errors.height}
          />

          <NumberInputWithControls
            label="LILA"
            value={data.lila}
            onChange={(v) => updateField('lila', v)}
            min={15}
            max={50}
            step={0.5}
            unit="cm"
            disabled={disabled}
            error={errors.lila}
            required
          />

          <div className="col-span-2 md:col-span-1">
            <BloodPressureInput
              systolic={data.systolic}
              diastolic={data.diastolic}
              onSystolicChange={(v) => updateField('systolic', v)}
              onDiastolicChange={(v) => updateField('diastolic', v)}
              label="Tekanan Darah"
              disabled={disabled}
              required
            />
          </div>

          <NumberInputWithControls
            label="Usia Kehamilan"
            value={data.pregnancy_weeks}
            onChange={(v) => updateField('pregnancy_weeks', v)}
            min={1}
            max={45}
            step={1}
            unit="minggu"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Auto-calculated Indicators */}
      {(lilaStatus || weightGain) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Status (Auto-calculated)</h3>
          <div className="flex flex-wrap gap-3">
            {lilaStatus && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600">Status LILA:</span>
                <StatusIndicatorBadge
                  status={lilaStatus.type}
                  label={lilaStatus.label}
                  size="sm"
                />
              </div>
            )}
            {weightGain && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600">Kenaikan BB:</span>
                <StatusIndicatorBadge
                  status={weightGain.status as 'good' | 'warning' | 'danger'}
                  label={weightGain.label}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pregnancy Specific Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
          Pemeriksaan Kehamilan
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumberInputWithControls
            label="Tinggi Fundus Uteri"
            value={data.fundal_height}
            onChange={(v) => updateField('fundal_height', v)}
            min={0}
            max={45}
            step={1}
            unit="cm"
            disabled={disabled}
          />

          <NumberInputWithControls
            label="Denyut Jantung Janin"
            value={data.fetal_heart_rate}
            onChange={(v) => updateField('fetal_heart_rate', v)}
            min={80}
            max={200}
            step={1}
            unit="x/menit"
            disabled={disabled}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presentasi/Letak Janin
            </label>
            <select
              value={data.fetal_presentation}
              onChange={(e) => updateField('fetal_presentation', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Pilih...</option>
              <option value="kepala">Kepala</option>
              <option value="bokong">Bokong/Sungsang</option>
              <option value="lintang">Lintang</option>
              <option value="belum_teraba">Belum Teraba</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Edema</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={data.edema === false}
                  onChange={() => updateField('edema', false)}
                  disabled={disabled}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">Tidak</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={data.edema === true}
                  onChange={() => updateField('edema', true)}
                  disabled={disabled}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">Ya</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Protein Urine</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={data.protein_urine === 'negatif'}
                  onChange={() => updateField('protein_urine', 'negatif')}
                  disabled={disabled}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">Negatif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={data.protein_urine === 'positif'}
                  onChange={() => updateField('protein_urine', 'positif')}
                  disabled={disabled}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">Positif</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Services Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-500"></span>
          Layanan yang Diberikan
        </h3>

        <div className="space-y-4">
          <NumberInputWithControls
            label="Tablet Tambah Darah (TTD)"
            value={data.ttd_given}
            onChange={(v) => updateField('ttd_given', v)}
            min={0}
            max={90}
            step={1}
            unit="tablet"
            disabled={disabled}
          />

          <ChecklistInput
            label="Imunisasi TT"
            items={data.immunization_tt}
            onChange={(items) => updateField('immunization_tt', items)}
            showDates={true}
            columns={3}
            disabled={disabled}
          />

          <ChecklistInput
            label="Konseling"
            items={data.counseling}
            onChange={(items) => updateField('counseling', items)}
            showDates={false}
            columns={2}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Complaints & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Keluhan</label>
          <textarea
            value={data.complaints}
            onChange={(e) => updateField('complaints', e.target.value)}
            placeholder="Keluhan ibu hamil..."
            rows={3}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan</label>
          <textarea
            value={data.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Catatan pemeriksaan..."
            rows={3}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// Helper to create initial form data
export function createInitialIbuHamilVisitData(): IbuHamilVisitData {
  return {
    weight: undefined,
    height: undefined,
    lila: undefined,
    systolic: undefined,
    diastolic: undefined,
    pregnancy_weeks: undefined,
    fundal_height: undefined,
    fetal_heart_rate: undefined,
    fetal_presentation: '',
    edema: null,
    protein_urine: '',
    ttd_given: undefined,
    immunization_tt: IMUNISASI_TT_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      checked: false,
    })),
    counseling: KONSELING_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      checked: false,
    })),
    complaints: '',
    notes: '',
  };
}
