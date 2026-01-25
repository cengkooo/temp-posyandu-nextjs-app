'use client';

import React, { useMemo } from 'react';
import NumberInputWithControls from '../NumberInputWithControls';
import ChecklistInput, { ChecklistItem } from '../ChecklistInput';
import StatusIndicatorBadge from '../StatusIndicatorBadge';
import {
  calculateAgeInMonths,
  formatAge,
  calculateBBU,
  calculateTBU,
  calculateBBTB,
} from '@/lib/nutritionCalculator';

const VITAMIN_TINDAKAN_ITEMS = [
  { id: 'vitamin_a', label: 'Vitamin A' },
  { id: 'obat_cacing', label: 'Obat Cacing' },
  { id: 'pmt', label: 'PMT (Pemberian Makanan Tambahan)' },
  { id: 'konseling_gizi', label: 'Konseling Gizi' },
  { id: 'rujuk', label: 'Rujuk ke Puskesmas/RS' },
];

export interface BayiBalitaVisitData {
  // Antropometri
  weight?: number;
  height?: number;
  head_circumference?: number;
  arm_circumference?: number;

  // Additional
  complaints: string;
  physical_exam: string;
  actions: ChecklistItem[];
  notes: string;
}

interface BayiBalitaVisitFormProps {
  data: BayiBalitaVisitData;
  onChange: (data: BayiBalitaVisitData) => void;
  patientDateOfBirth?: string;
  patientGender?: 'L' | 'P';
  isBayi?: boolean; // true for 0-11 months, false for 1-5 years
  disabled?: boolean;
  errors?: Record<string, string>;
}

export default function BayiBalitaVisitForm({
  data,
  onChange,
  patientDateOfBirth,
  patientGender,
  isBayi = true,
  disabled = false,
  errors = {},
}: BayiBalitaVisitFormProps) {
  const ageInMonths = useMemo(() => {
    if (!patientDateOfBirth) return null;
    return calculateAgeInMonths(patientDateOfBirth);
  }, [patientDateOfBirth]);

  const ageDisplay = useMemo(() => {
    if (!patientDateOfBirth) return '-';
    return formatAge(patientDateOfBirth);
  }, [patientDateOfBirth]);

  // Calculate nutritional indicators
  const nutritionalStatus = useMemo(() => {
    if (!data.weight || !data.height || !ageInMonths || !patientGender) return null;

    const bbu = calculateBBU(data.weight, ageInMonths, patientGender);
    const tbu = calculateTBU(data.height, ageInMonths, patientGender);
    const bbtb = calculateBBTB(data.weight, data.height, patientGender);

    return { bbu, tbu, bbtb };
  }, [data.weight, data.height, ageInMonths, patientGender]);

  const updateField = <K extends keyof BayiBalitaVisitData>(field: K, value: BayiBalitaVisitData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Patient Info Summary */}
      {patientDateOfBirth && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-blue-700 font-medium">Umur: {ageDisplay}</span>
            {patientGender && (
              <span className="text-blue-600">
                {patientGender === 'L' ? 'Laki-laki' : 'Perempuan'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Anthropometry Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          Pengukuran Antropometri
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumberInputWithControls
            label="Berat Badan"
            value={data.weight}
            onChange={(v) => updateField('weight', v)}
            min={0.5}
            max={isBayi ? 20 : 50}
            step={0.1}
            unit="kg"
            disabled={disabled}
            error={errors.weight}
            required
          />

          <NumberInputWithControls
            label={isBayi ? 'Panjang Badan' : 'Tinggi Badan'}
            value={data.height}
            onChange={(v) => updateField('height', v)}
            min={30}
            max={isBayi ? 100 : 150}
            step={0.5}
            unit="cm"
            disabled={disabled}
            error={errors.height}
            required
          />

          {isBayi && (
            <NumberInputWithControls
              label="Lingkar Kepala"
              value={data.head_circumference}
              onChange={(v) => updateField('head_circumference', v)}
              min={20}
              max={60}
              step={0.5}
              unit="cm"
              disabled={disabled}
              error={errors.head_circumference}
            />
          )}

          <NumberInputWithControls
            label="Lingkar Lengan (LILA)"
            value={data.arm_circumference}
            onChange={(v) => updateField('arm_circumference', v)}
            min={5}
            max={40}
            step={0.5}
            unit="cm"
            disabled={disabled}
            error={errors.arm_circumference}
          />
        </div>
      </div>

      {/* Auto-calculated Indicators */}
      {nutritionalStatus && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Status Gizi (Auto-calculated)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <span className="text-sm text-gray-600">BB/U</span>
              <StatusIndicatorBadge
                status={nutritionalStatus.bbu.type}
                label={nutritionalStatus.bbu.label}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <span className="text-sm text-gray-600">{isBayi ? 'PB/U' : 'TB/U'}</span>
              <StatusIndicatorBadge
                status={nutritionalStatus.tbu.type}
                label={nutritionalStatus.tbu.label}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
              <span className="text-sm text-gray-600">{isBayi ? 'BB/PB' : 'BB/TB'}</span>
              <StatusIndicatorBadge
                status={nutritionalStatus.bbtb.type}
                label={nutritionalStatus.bbtb.label}
                size="sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Complaints & Physical Exam */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Keluhan</label>
          <textarea
            value={data.complaints}
            onChange={(e) => updateField('complaints', e.target.value)}
            placeholder="Keluhan yang disampaikan orang tua..."
            rows={3}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pemeriksaan Fisik
          </label>
          <textarea
            value={data.physical_exam}
            onChange={(e) => updateField('physical_exam', e.target.value)}
            placeholder="Hasil pemeriksaan fisik..."
            rows={3}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>
      </div>

      {/* Tindakan / Vitamin */}
      <ChecklistInput
        label="Tindakan / Vitamin yang Diberikan"
        items={data.actions}
        onChange={(items) => updateField('actions', items)}
        showDates={false}
        columns={2}
        disabled={disabled}
      />

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catatan Tambahan
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Catatan pemeriksaan lainnya..."
          rows={3}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>
    </div>
  );
}

// Helper to create initial form data
export function createInitialBayiBalitaVisitData(): BayiBalitaVisitData {
  return {
    weight: undefined,
    height: undefined,
    head_circumference: undefined,
    arm_circumference: undefined,
    complaints: '',
    physical_exam: '',
    actions: VITAMIN_TINDAKAN_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      checked: false,
    })),
    notes: '',
  };
}
