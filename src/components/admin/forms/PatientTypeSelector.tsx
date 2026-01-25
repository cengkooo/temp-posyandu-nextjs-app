'use client';

import React from 'react';
import { Baby, User, HeartPulse, UserCheck, UserCog } from 'lucide-react';

export type PatientTypeValue = 'bayi' | 'balita' | 'ibu_hamil' | 'remaja_dewasa' | 'lansia';

interface PatientType {
  value: PatientTypeValue;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const patientTypes: PatientType[] = [
  {
    value: 'bayi',
    label: 'Bayi',
    description: '0-11 bulan',
    icon: <Baby className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
  },
  {
    value: 'balita',
    label: 'Balita',
    description: '1-5 tahun',
    icon: <User className="w-8 h-8" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-500',
  },
  {
    value: 'ibu_hamil',
    label: 'Ibu Hamil',
    description: 'Kehamilan',
    icon: <HeartPulse className="w-8 h-8" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-500',
  },
  {
    value: 'remaja_dewasa',
    label: 'Remaja & Dewasa',
    description: '15-45 tahun',
    icon: <UserCheck className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
  },
  {
    value: 'lansia',
    label: 'Lansia',
    description: '≥60 tahun',
    icon: <UserCog className="w-8 h-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
  },
];

interface PatientTypeSelectorProps {
  value: PatientTypeValue | null;
  onChange: (value: PatientTypeValue) => void;
  disabled?: boolean;
}

export default function PatientTypeSelector({
  value,
  onChange,
  disabled = false,
}: PatientTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Pilih Tipe Pasien</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pilih kategori pasien untuk melanjutkan registrasi
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {patientTypes.map((type) => {
          const isSelected = value === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center justify-center p-6 rounded-xl border-2 
                transition-all duration-200 cursor-pointer
                ${isSelected
                  ? `${type.borderColor} ${type.bgColor} shadow-lg scale-[1.02]`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full ${type.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={`mb-3 ${isSelected ? type.color : 'text-gray-400'}`}>
                {type.icon}
              </div>

              {/* Label */}
              <span className={`font-semibold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                {type.label}
              </span>

              {/* Description */}
              <span className={`text-xs mt-1 ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                {type.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
