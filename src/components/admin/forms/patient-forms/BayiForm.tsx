'use client';

import React, { useState, useMemo } from 'react';
import { User, Ruler, Baby, Syringe, FileText } from 'lucide-react';
import TabNavigation, { Tab } from '../TabNavigation';
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

// Immunization items for babies
const IMMUNIZATION_ITEMS = [
  { id: 'hb0', label: 'Hepatitis B (HB0)' },
  { id: 'bcg', label: 'BCG' },
  { id: 'polio1', label: 'Polio 1' },
  { id: 'polio2', label: 'Polio 2' },
  { id: 'polio3', label: 'Polio 3' },
  { id: 'polio4', label: 'Polio 4' },
  { id: 'dpt_hib_1', label: 'DPT-HB-Hib 1' },
  { id: 'dpt_hib_2', label: 'DPT-HB-Hib 2' },
  { id: 'dpt_hib_3', label: 'DPT-HB-Hib 3' },
  { id: 'ipv', label: 'IPV' },
  { id: 'campak_mr', label: 'Campak/MR' },
];

export interface BayiFormData {
  // Data Bayi
  full_name: string;
  nik: string;
  date_of_birth: string;
  gender: 'L' | 'P' | '';
  address: string;
  phone: string;
  parent_name: string;

  // Antropometri
  weight?: number;
  height?: number; // Panjang badan
  head_circumference?: number;
  measurement_date: string;

  // ASI & MP-ASI
  asi_exclusive: 'ya' | 'tidak' | 'berlangsung' | '';
  asi_duration_months?: number;
  mpasi_started: boolean;
  mpasi_age_months?: number;
  mpasi_types: string;

  // Imunisasi
  immunizations: ChecklistItem[];
  vitamin_a_given: boolean;
  vitamin_a_date: string;

  // Riwayat Kesehatan
  ispa_history: boolean;
  ispa_last_date: string;
  diare_history: boolean;
  diare_last_date: string;
  other_illness: string;
  special_notes: string;
}

interface BayiFormProps {
  data: BayiFormData;
  onChange: (data: BayiFormData) => void;
  errors?: Partial<Record<keyof BayiFormData, string>>;
  disabled?: boolean;
}

const tabs: Tab[] = [
  { id: 'data', label: 'Data Bayi', icon: <User className="w-4 h-4" /> },
  { id: 'antropometri', label: 'Antropometri', icon: <Ruler className="w-4 h-4" /> },
  { id: 'asi', label: 'ASI & MP-ASI', icon: <Baby className="w-4 h-4" /> },
  { id: 'imunisasi', label: 'Imunisasi', icon: <Syringe className="w-4 h-4" /> },
  { id: 'riwayat', label: 'Riwayat Kesehatan', icon: <FileText className="w-4 h-4" /> },
];

export default function BayiForm({ data, onChange, errors = {}, disabled = false }: BayiFormProps) {
  const [activeTab, setActiveTab] = useState('data');

  // Calculate age in months
  const ageInMonths = useMemo(() => {
    if (!data.date_of_birth) return null;
    return calculateAgeInMonths(data.date_of_birth);
  }, [data.date_of_birth]);

  const ageDisplay = useMemo(() => {
    if (!data.date_of_birth) return '-';
    return formatAge(data.date_of_birth);
  }, [data.date_of_birth]);

  // Calculate nutritional indicators
  const nutritionalStatus = useMemo(() => {
    if (!data.weight || !data.height || !ageInMonths || !data.gender) return null;

    const bbu = calculateBBU(data.weight, ageInMonths, data.gender as 'L' | 'P');
    const tbu = calculateTBU(data.height, ageInMonths, data.gender as 'L' | 'P');
    const bbtb = calculateBBTB(data.weight, data.height, data.gender as 'L' | 'P');

    return { bbu, tbu, bbtb };
  }, [data.weight, data.height, ageInMonths, data.gender]);

  const updateField = <K extends keyof BayiFormData>(field: K, value: BayiFormData[K]) => {
    onChange({ ...data, [field]: value });
  };

  const renderDataBayi = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            placeholder="Masukkan nama lengkap bayi"
            disabled={disabled}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.full_name ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>}
        </div>

        {/* NIK */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NIK (Opsional)
          </label>
          <input
            type="text"
            value={data.nik}
            onChange={(e) => updateField('nik', e.target.value)}
            placeholder="16 digit NIK"
            maxLength={16}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="mt-1 text-xs text-gray-500">Data NIK akan dienkripsi</p>
        </div>

        {/* Tanggal Lahir */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Lahir <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.date_of_birth}
            onChange={(e) => updateField('date_of_birth', e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.date_of_birth ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.date_of_birth && <p className="mt-1 text-sm text-red-500">{errors.date_of_birth}</p>}
        </div>

        {/* Umur (Auto-calculated) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Umur</label>
          <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            {ageDisplay}
            {ageInMonths !== null && ageInMonths > 11 && (
              <span className="ml-2 text-xs text-orange-500">(Lebih dari 11 bulan)</span>
            )}
          </div>
        </div>

        {/* Jenis Kelamin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Kelamin <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={data.gender === 'L'}
                onChange={() => updateField('gender', 'L')}
                disabled={disabled}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Laki-laki</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={data.gender === 'P'}
                onChange={() => updateField('gender', 'P')}
                disabled={disabled}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Perempuan</span>
            </label>
          </div>
          {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
        </div>

        {/* Nama Orang Tua */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Orang Tua/Wali <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.parent_name}
            onChange={(e) => updateField('parent_name', e.target.value)}
            placeholder="Nama orang tua atau wali"
            disabled={disabled}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              errors.parent_name ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.parent_name && <p className="mt-1 text-sm text-red-500">{errors.parent_name}</p>}
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="08xxxxxxxxxx"
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Alamat */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
          <textarea
            value={data.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Masukkan alamat lengkap"
            rows={3}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
    </div>
  );

  const renderAntropometri = () => (
    <div className="space-y-6">
      {/* Measurement date */}
      <div className="max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Pengukuran</label>
        <input
          type="date"
          value={data.measurement_date}
          onChange={(e) => updateField('measurement_date', e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Berat Badan */}
        <NumberInputWithControls
          label="Berat Badan"
          value={data.weight}
          onChange={(v) => updateField('weight', v)}
          min={0.5}
          max={30}
          step={0.1}
          unit="kg"
          placeholder="0.0"
          disabled={disabled}
          error={errors.weight}
        />

        {/* Panjang Badan */}
        <NumberInputWithControls
          label="Panjang Badan"
          value={data.height}
          onChange={(v) => updateField('height', v)}
          min={30}
          max={100}
          step={0.5}
          unit="cm"
          placeholder="0.0"
          disabled={disabled}
          error={errors.height}
        />

        {/* Lingkar Kepala */}
        <NumberInputWithControls
          label="Lingkar Kepala"
          value={data.head_circumference}
          onChange={(v) => updateField('head_circumference', v)}
          min={20}
          max={60}
          step={0.5}
          unit="cm"
          placeholder="0.0"
          disabled={disabled}
          error={errors.head_circumference}
        />
      </div>

      {/* Auto-calculated indicators */}
      {nutritionalStatus && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Status Gizi (Auto-calculated)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">BB/U</span>
              <StatusIndicatorBadge
                status={nutritionalStatus.bbu.type}
                label={nutritionalStatus.bbu.label}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">PB/U</span>
              <StatusIndicatorBadge
                status={nutritionalStatus.tbu.type}
                label={nutritionalStatus.tbu.label}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600">BB/PB</span>
              <StatusIndicatorBadge
                status={nutritionalStatus.bbtb.type}
                label={nutritionalStatus.bbtb.label}
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderASIMPASI = () => (
    <div className="space-y-6">
      {/* ASI Eksklusif */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">ASI Eksklusif</label>
        <div className="flex flex-wrap gap-4">
          {[
            { value: 'ya', label: 'Ya' },
            { value: 'tidak', label: 'Tidak' },
            { value: 'berlangsung', label: 'Sedang Berlangsung' },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={data.asi_exclusive === option.value}
                onChange={() => updateField('asi_exclusive', option.value as 'ya' | 'tidak' | 'berlangsung')}
                disabled={disabled}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Durasi ASI */}
      {data.asi_exclusive && data.asi_exclusive !== 'berlangsung' && (
        <div className="max-w-xs">
          <NumberInputWithControls
            label="Durasi ASI Eksklusif"
            value={data.asi_duration_months}
            onChange={(v) => updateField('asi_duration_months', v)}
            min={0}
            max={24}
            step={1}
            unit="bulan"
            disabled={disabled}
          />
        </div>
      )}

      <hr className="border-gray-200" />

      {/* MP-ASI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Pemberian MP-ASI</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={data.mpasi_started === true}
              onChange={() => updateField('mpasi_started', true)}
              disabled={disabled}
              className="w-4 h-4 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">Sudah Dimulai</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={data.mpasi_started === false}
              onChange={() => updateField('mpasi_started', false)}
              disabled={disabled}
              className="w-4 h-4 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">Belum</span>
          </label>
        </div>
      </div>

      {data.mpasi_started && (
        <>
          <div className="max-w-xs">
            <NumberInputWithControls
              label="Usia Mulai MP-ASI"
              value={data.mpasi_age_months}
              onChange={(v) => updateField('mpasi_age_months', v)}
              min={0}
              max={12}
              step={1}
              unit="bulan"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis MP-ASI</label>
            <textarea
              value={data.mpasi_types}
              onChange={(e) => updateField('mpasi_types', e.target.value)}
              placeholder="Contoh: Bubur tim, pisang lumat, dll"
              rows={3}
              disabled={disabled}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderImunisasi = () => (
    <div className="space-y-6">
      {/* Immunization checklist */}
      <ChecklistInput
        label="Status Imunisasi"
        items={data.immunizations}
        onChange={(items) => updateField('immunizations', items)}
        showDates={true}
        columns={2}
        disabled={disabled}
      />

      <hr className="border-gray-200" />

      {/* Vitamin A */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Vitamin A</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.vitamin_a_given}
              onChange={(e) => updateField('vitamin_a_given', e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">Sudah diberikan</span>
          </label>

          {data.vitamin_a_given && (
            <input
              type="date"
              value={data.vitamin_a_date}
              onChange={(e) => updateField('vitamin_a_date', e.target.value)}
              disabled={disabled}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderRiwayatKesehatan = () => (
    <div className="space-y-6">
      {/* ISPA */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.ispa_history}
              onChange={(e) => updateField('ispa_history', e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">Riwayat ISPA</span>
          </label>
        </div>
        {data.ispa_history && (
          <div className="ml-7">
            <label className="block text-xs text-gray-500 mb-1">Tanggal terakhir</label>
            <input
              type="date"
              value={data.ispa_last_date}
              onChange={(e) => updateField('ispa_last_date', e.target.value)}
              disabled={disabled}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      {/* Diare */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.diare_history}
              onChange={(e) => updateField('diare_history', e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm font-medium text-gray-700">Riwayat Diare</span>
          </label>
        </div>
        {data.diare_history && (
          <div className="ml-7">
            <label className="block text-xs text-gray-500 mb-1">Tanggal terakhir</label>
            <input
              type="date"
              value={data.diare_last_date}
              onChange={(e) => updateField('diare_last_date', e.target.value)}
              disabled={disabled}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      {/* Penyakit Lain */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Penyakit Lain</label>
        <textarea
          value={data.other_illness}
          onChange={(e) => updateField('other_illness', e.target.value)}
          placeholder="Riwayat penyakit lain yang pernah dialami..."
          rows={3}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Catatan Khusus */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Khusus</label>
        <textarea
          value={data.special_notes}
          onChange={(e) => updateField('special_notes', e.target.value)}
          placeholder="Catatan penting lainnya..."
          rows={3}
          disabled={disabled}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'data':
        return renderDataBayi();
      case 'antropometri':
        return renderAntropometri();
      case 'asi':
        return renderASIMPASI();
      case 'imunisasi':
        return renderImunisasi();
      case 'riwayat':
        return renderRiwayatKesehatan();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <TabNavigation tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <div className="py-4">{renderTabContent()}</div>
    </div>
  );
}

// Helper to create initial form data
export function createInitialBayiFormData(): BayiFormData {
  return {
    full_name: '',
    nik: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
    parent_name: '',
    weight: undefined,
    height: undefined,
    head_circumference: undefined,
    measurement_date: new Date().toISOString().split('T')[0],
    asi_exclusive: '',
    asi_duration_months: undefined,
    mpasi_started: false,
    mpasi_age_months: undefined,
    mpasi_types: '',
    immunizations: IMMUNIZATION_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      checked: false,
      date: undefined,
    })),
    vitamin_a_given: false,
    vitamin_a_date: '',
    ispa_history: false,
    ispa_last_date: '',
    diare_history: false,
    diare_last_date: '',
    other_illness: '',
    special_notes: '',
  };
}
