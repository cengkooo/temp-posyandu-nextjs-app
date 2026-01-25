'use client';

import React, { useMemo } from 'react';
import NumberInputWithControls from '../NumberInputWithControls';
import BloodPressureInput from '../BloodPressureInput';
import ChecklistInput, { ChecklistItem } from '../ChecklistInput';
import StatusIndicatorBadge from '../StatusIndicatorBadge';

const FALL_RISK_ITEMS = [
  { id: 'fall_history', label: 'Riwayat jatuh dalam 1 tahun terakhir' },
  { id: 'balance_issue', label: 'Gangguan keseimbangan' },
  { id: 'walking_aid', label: 'Menggunakan alat bantu jalan' },
  { id: 'dizziness', label: 'Pusing saat berdiri' },
  { id: 'vision_problem', label: 'Gangguan penglihatan' },
];

const KONSELING_ITEMS = [
  { id: 'gizi_lansia', label: 'Gizi Seimbang Lansia' },
  { id: 'aktivitas_fisik', label: 'Aktivitas Fisik (Senam, Jalan Santai)' },
  { id: 'pencegahan_jatuh', label: 'Pencegahan Jatuh' },
  { id: 'manajemen_kronis', label: 'Manajemen Penyakit Kronis' },
  { id: 'kesehatan_mental', label: 'Kesehatan Mental' },
];

export interface LansiaVisitData {
  // Vital Signs
  weight?: number;
  height?: number;
  knee_height?: number; // Alternative if can't stand
  systolic?: number;
  diastolic?: number;
  pulse_rate?: number;
  blood_sugar?: number;
  temperature?: number;

  // Functional Assessment
  eating_independence: 'mandiri' | 'bantuan' | 'tergantung' | '';
  dressing_independence: 'mandiri' | 'bantuan' | 'tergantung' | '';
  bathing_independence: 'mandiri' | 'bantuan' | 'tergantung' | '';
  toileting_independence: 'mandiri' | 'bantuan' | 'tergantung' | '';
  mobility_independence: 'mandiri' | 'bantuan' | 'tergantung' | '';
  
  mobility_type: 'normal' | 'alat_bantu' | 'kursi_roda' | '';
  mental_status: 'baik' | 'gangguan_ringan' | 'gangguan_berat' | '';

  // Screening
  fall_risk_items: ChecklistItem[];
  pain_scale?: number;

  // Notes & Treatment
  main_complaint: string;
  examination: string;
  medication_given: string;
  counseling: ChecklistItem[];

  // Follow-up
  referral_needed: boolean;
  referral_to: string;
  next_visit_date: string;
  notes: string;
}

interface LansiaVisitFormProps {
  data: LansiaVisitData;
  onChange: (data: LansiaVisitData) => void;
  disabled?: boolean;
  errors?: Record<string, string>;
}

type IndependenceLevel = 'mandiri' | 'bantuan' | 'tergantung' | '';

export default function LansiaVisitForm({
  data,
  onChange,
  disabled = false,
  errors = {},
}: LansiaVisitFormProps) {
  // Calculate ADL score
  const adlScore = useMemo(() => {
    const levels: IndependenceLevel[] = [
      data.eating_independence,
      data.dressing_independence,
      data.bathing_independence,
      data.toileting_independence,
      data.mobility_independence,
    ];
    
    const validLevels = levels.filter((l) => l !== '');
    if (validLevels.length === 0) return null;
    
    const mandiriCount = validLevels.filter((l) => l === 'mandiri').length;
    const tergantungCount = validLevels.filter((l) => l === 'tergantung').length;
    
    if (mandiriCount === validLevels.length) {
      return { status: 'Mandiri', type: 'good' as const };
    } else if (tergantungCount === validLevels.length) {
      return { status: 'Tergantung Total', type: 'danger' as const };
    } else {
      return { status: 'Sebagian Mandiri', type: 'warning' as const };
    }
  }, [
    data.eating_independence,
    data.dressing_independence,
    data.bathing_independence,
    data.toileting_independence,
    data.mobility_independence,
  ]);

  // Calculate fall risk score
  const fallRiskScore = useMemo(() => {
    const checkedCount = data.fall_risk_items.filter((item) => item.checked).length;
    if (checkedCount === 0) return { label: 'Risiko Rendah', type: 'good' as const };
    if (checkedCount <= 2) return { label: 'Risiko Sedang', type: 'warning' as const };
    return { label: 'Risiko Tinggi', type: 'danger' as const };
  }, [data.fall_risk_items]);

  const updateField = <K extends keyof LansiaVisitData>(field: K, value: LansiaVisitData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const renderIndependenceRadio = (
    label: string,
    field: 'eating_independence' | 'dressing_independence' | 'bathing_independence' | 'toileting_independence' | 'mobility_independence'
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-3">
        {[
          { value: 'mandiri', label: 'Mandiri', color: 'text-green-600' },
          { value: 'bantuan', label: 'Bantuan', color: 'text-yellow-600' },
          { value: 'tergantung', label: 'Tergantung', color: 'text-red-600' },
        ].map((option) => (
          <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={data[field] === option.value}
              onChange={() => updateField(field, option.value as IndependenceLevel)}
              disabled={disabled}
              className="w-4 h-4 text-teal-600 focus:ring-teal-500"
            />
            <span className={`text-xs ${option.color}`}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Vital Signs Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          Tanda Vital
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInputWithControls
            label="Berat Badan"
            value={data.weight}
            onChange={(v) => updateField('weight', v)}
            min={20}
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
          />

          <NumberInputWithControls
            label="Tinggi Lutut"
            value={data.knee_height}
            onChange={(v) => updateField('knee_height', v)}
            min={30}
            max={70}
            step={0.5}
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

          <NumberInputWithControls
            label="Denyut Nadi"
            value={data.pulse_rate}
            onChange={(v) => updateField('pulse_rate', v)}
            min={40}
            max={200}
            step={1}
            unit="x/menit"
            disabled={disabled}
          />

          <NumberInputWithControls
            label="Gula Darah"
            value={data.blood_sugar}
            onChange={(v) => updateField('blood_sugar', v)}
            min={50}
            max={600}
            step={1}
            unit="mg/dL"
            disabled={disabled}
          />

          <NumberInputWithControls
            label="Suhu Tubuh"
            value={data.temperature}
            onChange={(v) => updateField('temperature', v)}
            min={35}
            max={42}
            step={0.1}
            unit="°C"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Functional Assessment Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          Penilaian Fungsional (ADL)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {renderIndependenceRadio('Makan', 'eating_independence')}
          {renderIndependenceRadio('Berpakaian', 'dressing_independence')}
          {renderIndependenceRadio('Mandi', 'bathing_independence')}
          {renderIndependenceRadio('Toileting', 'toileting_independence')}
          {renderIndependenceRadio('Mobilitas', 'mobility_independence')}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Mobilitas</label>
            <select
              value={data.mobility_type}
              onChange={(e) => updateField('mobility_type', e.target.value as LansiaVisitData['mobility_type'])}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="">Pilih...</option>
              <option value="normal">Normal</option>
              <option value="alat_bantu">Alat Bantu</option>
              <option value="kursi_roda">Kursi Roda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Mental</label>
            <select
              value={data.mental_status}
              onChange={(e) => updateField('mental_status', e.target.value as LansiaVisitData['mental_status'])}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            >
              <option value="">Pilih...</option>
              <option value="baik">Baik</option>
              <option value="gangguan_ringan">Gangguan Ringan</option>
              <option value="gangguan_berat">Gangguan Berat</option>
            </select>
          </div>
        </div>

        {/* ADL Score Indicator */}
        {adlScore && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status Kemandirian:</span>
              <StatusIndicatorBadge
                status={adlScore.type}
                label={adlScore.status}
                size="sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Screening Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          Screening
        </h3>

        <div className="space-y-4">
          <ChecklistInput
            label="Faktor Risiko Jatuh"
            items={data.fall_risk_items}
            onChange={(items) => updateField('fall_risk_items', items)}
            showDates={false}
            columns={2}
            disabled={disabled}
          />

          {/* Fall Risk Score */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Skor Risiko Jatuh:</span>
              <StatusIndicatorBadge
                status={fallRiskScore.type}
                label={fallRiskScore.label}
                size="sm"
              />
            </div>
          </div>

          <NumberInputWithControls
            label="Skala Nyeri"
            value={data.pain_scale}
            onChange={(v) => updateField('pain_scale', v)}
            min={0}
            max={10}
            step={1}
            unit="(0-10)"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Complaints & Treatment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Keluhan Utama</label>
          <textarea
            value={data.main_complaint}
            onChange={(e) => updateField('main_complaint', e.target.value)}
            placeholder="Keluhan utama lansia..."
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Obat yang Diberikan</label>
        <textarea
          value={data.medication_given}
          onChange={(e) => updateField('medication_given', e.target.value)}
          placeholder="Nama obat & dosis..."
          rows={2}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      <ChecklistInput
        label="Konseling yang Diberikan"
        items={data.counseling}
        onChange={(items) => updateField('counseling', items)}
        showDates={false}
        columns={2}
        disabled={disabled}
      />

      {/* Follow-up */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          Tindak Lanjut
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
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

            {data.referral_needed && (
              <select
                value={data.referral_to}
                onChange={(e) => updateField('referral_to', e.target.value)}
                disabled={disabled}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              >
                <option value="">Rujuk ke...</option>
                <option value="puskesmas">Puskesmas</option>
                <option value="rs">Rumah Sakit</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jadwal Kontrol Berikutnya
            </label>
            <input
              type="date"
              value={data.next_visit_date}
              onChange={(e) => updateField('next_visit_date', e.target.value)}
              disabled={disabled}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
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
export function createInitialLansiaVisitData(): LansiaVisitData {
  return {
    weight: undefined,
    height: undefined,
    knee_height: undefined,
    systolic: undefined,
    diastolic: undefined,
    pulse_rate: undefined,
    blood_sugar: undefined,
    temperature: undefined,
    eating_independence: '',
    dressing_independence: '',
    bathing_independence: '',
    toileting_independence: '',
    mobility_independence: '',
    mobility_type: '',
    mental_status: '',
    fall_risk_items: FALL_RISK_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      checked: false,
    })),
    pain_scale: undefined,
    main_complaint: '',
    examination: '',
    medication_given: '',
    counseling: KONSELING_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      checked: false,
    })),
    referral_needed: false,
    referral_to: '',
    next_visit_date: '',
    notes: '',
  };
}
