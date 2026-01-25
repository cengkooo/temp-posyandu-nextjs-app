'use client';

import React, { useMemo } from 'react';
import NumberInputWithControls from '../NumberInputWithControls';
import BloodPressureInput from '../BloodPressureInput';
import ChecklistInput, { ChecklistItem } from '../ChecklistInput';
import StatusIndicatorBadge from '../StatusIndicatorBadge';
import { calculateIMT, getIMTStatus, getWaistCircumferenceRisk } from '@/lib/nutritionCalculator';

const KONSELING_ITEMS = [
  { id: 'diet_sehat', label: 'Diet Sehat' },
  { id: 'aktivitas_fisik', label: 'Aktivitas Fisik' },
  { id: 'stop_merokok', label: 'Stop Merokok' },
  { id: 'manajemen_stress', label: 'Manajemen Stress' },
  { id: 'cek_kesehatan_rutin', label: 'Cek Kesehatan Rutin' },
];

export interface RemajaDewasaVisitData {
  // Measurements
  weight?: number;
  height?: number;
  waist_circumference?: number;
  systolic?: number;
  diastolic?: number;

  // Lab Results (Optional)
  blood_sugar?: number;
  cholesterol?: number;
  uric_acid?: number;

  // Lifestyle Assessment
  physical_activity: 'kurang_aktif' | 'cukup_aktif' | 'sangat_aktif' | '';
  vegetable_fruit_portions?: number;
  smoking_status: 'tidak_pernah' | 'pernah' | 'aktif' | '';
  cigarettes_per_day?: number;

  // Notes
  complaints: string;
  examination: string;
  counseling: ChecklistItem[];
  referral_needed: boolean;
  referral_to: string;
  notes: string;
}

interface RemajaDewasaVisitFormProps {
  data: RemajaDewasaVisitData;
  onChange: (data: RemajaDewasaVisitData) => void;
  patientGender?: 'L' | 'P';
  disabled?: boolean;
  errors?: Record<string, string>;
}

export default function RemajaDewasaVisitForm({
  data,
  onChange,
  patientGender,
  disabled = false,
  errors = {},
}: RemajaDewasaVisitFormProps) {
  // Calculate IMT
  const imtResult = useMemo(() => {
    if (!data.weight || !data.height) return null;
    const imt = calculateIMT(data.weight, data.height);
    return getIMTStatus(imt);
  }, [data.weight, data.height]);

  // Calculate metabolic risk from waist circumference
  const metabolicRisk = useMemo(() => {
    if (!data.waist_circumference || !patientGender) return null;
    return getWaistCircumferenceRisk(data.waist_circumference, patientGender);
  }, [data.waist_circumference, patientGender]);

  const updateField = <K extends keyof RemajaDewasaVisitData>(field: K, value: RemajaDewasaVisitData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Measurements Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Pengukuran
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInputWithControls
            label="Berat Badan"
            value={data.weight}
            onChange={(v) => updateField('weight', v)}
            min={20}
            max={200}
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
            max={220}
            step={1}
            unit="cm"
            disabled={disabled}
            error={errors.height}
            required
          />

          <NumberInputWithControls
            label="Lingkar Perut"
            value={data.waist_circumference}
            onChange={(v) => updateField('waist_circumference', v)}
            min={50}
            max={200}
            step={1}
            unit="cm"
            disabled={disabled}
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
        </div>
      </div>

      {/* Auto-calculated Indicators */}
      {(imtResult || metabolicRisk) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Status (Auto-calculated)</h3>
          <div className="flex flex-wrap gap-3">
            {imtResult && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600">IMT: {imtResult.value.toFixed(1)}</span>
                <StatusIndicatorBadge
                  status={imtResult.type}
                  label={imtResult.label}
                  size="sm"
                />
              </div>
            )}
            {metabolicRisk && (
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600">Risiko Metabolik:</span>
                <StatusIndicatorBadge
                  status={metabolicRisk.type}
                  label={metabolicRisk.label}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lab Results (Optional) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Hasil Laboratorium (Opsional)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumberInputWithControls
            label="Gula Darah Sewaktu"
            value={data.blood_sugar}
            onChange={(v) => updateField('blood_sugar', v)}
            min={50}
            max={600}
            step={1}
            unit="mg/dL"
            disabled={disabled}
          />

          <NumberInputWithControls
            label="Kolesterol Total"
            value={data.cholesterol}
            onChange={(v) => updateField('cholesterol', v)}
            min={50}
            max={500}
            step={1}
            unit="mg/dL"
            disabled={disabled}
          />

          <NumberInputWithControls
            label="Asam Urat"
            value={data.uric_acid}
            onChange={(v) => updateField('uric_acid', v)}
            min={1}
            max={20}
            step={0.1}
            unit="mg/dL"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Lifestyle Assessment */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Penilaian Gaya Hidup
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aktivitas Fisik</label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'kurang_aktif', label: 'Kurang Aktif' },
                { value: 'cukup_aktif', label: 'Cukup Aktif' },
                { value: 'sangat_aktif', label: 'Sangat Aktif' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={data.physical_activity === option.value}
                    onChange={() => updateField('physical_activity', option.value as RemajaDewasaVisitData['physical_activity'])}
                    disabled={disabled}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <NumberInputWithControls
            label="Konsumsi Sayur/Buah"
            value={data.vegetable_fruit_portions}
            onChange={(v) => updateField('vegetable_fruit_portions', v)}
            min={0}
            max={20}
            step={1}
            unit="porsi/hari"
            disabled={disabled}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Merokok</label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'tidak_pernah', label: 'Tidak Pernah' },
                { value: 'pernah', label: 'Pernah (Sudah Berhenti)' },
                { value: 'aktif', label: 'Aktif Merokok' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={data.smoking_status === option.value}
                    onChange={() => updateField('smoking_status', option.value as RemajaDewasaVisitData['smoking_status'])}
                    disabled={disabled}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {data.smoking_status === 'aktif' && (
            <NumberInputWithControls
              label="Jumlah Rokok"
              value={data.cigarettes_per_day}
              onChange={(v) => updateField('cigarettes_per_day', v)}
              min={1}
              max={100}
              step={1}
              unit="batang/hari"
              disabled={disabled}
            />
          )}
        </div>
      </div>

      {/* Notes & Counseling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Keluhan</label>
          <textarea
            value={data.complaints}
            onChange={(e) => updateField('complaints', e.target.value)}
            placeholder="Keluhan pasien..."
            rows={3}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pemeriksaan</label>
          <textarea
            value={data.examination}
            onChange={(e) => updateField('examination', e.target.value)}
            placeholder="Hasil pemeriksaan..."
            rows={3}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>
      </div>

      <ChecklistInput
        label="Konseling yang Diberikan"
        items={data.counseling}
        onChange={(items) => updateField('counseling', items)}
        showDates={false}
        columns={2}
        disabled={disabled}
      />

      {/* Referral */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.referral_needed}
              onChange={(e) => updateField('referral_needed', e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">Perlu Rujukan</span>
          </label>
        </div>

        {data.referral_needed && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rujuk ke</label>
            <select
              value={data.referral_to}
              onChange={(e) => updateField('referral_to', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Pilih...</option>
              <option value="puskesmas">Puskesmas</option>
              <option value="rs">Rumah Sakit</option>
              <option value="dokter_spesialis">Dokter Spesialis</option>
            </select>
          </div>
        )}
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Tambahan</label>
        <textarea
          value={data.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Catatan lainnya..."
          rows={3}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>
    </div>
  );
}

// Helper to create initial form data
export function createInitialRemajaDewasaVisitData(): RemajaDewasaVisitData {
  return {
    weight: undefined,
    height: undefined,
    waist_circumference: undefined,
    systolic: undefined,
    diastolic: undefined,
    blood_sugar: undefined,
    cholesterol: undefined,
    uric_acid: undefined,
    physical_activity: '',
    vegetable_fruit_portions: undefined,
    smoking_status: '',
    cigarettes_per_day: undefined,
    complaints: '',
    examination: '',
    counseling: KONSELING_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      checked: false,
    })),
    referral_needed: false,
    referral_to: '',
    notes: '',
  };
}
