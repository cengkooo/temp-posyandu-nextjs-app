'use client';

import React, { useMemo } from 'react';

interface BloodPressureInputProps {
  systolic: number | undefined;
  diastolic: number | undefined;
  onSystolicChange: (value: number | undefined) => void;
  onDiastolicChange: (value: number | undefined) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  showIndicator?: boolean;
}

type BPStatus = 'normal' | 'prehipertensi' | 'hipertensi_1' | 'hipertensi_2';

const bpStatusConfig: Record<BPStatus, { label: string; color: string; bgColor: string }> = {
  normal: { label: 'Normal', color: 'text-green-700', bgColor: 'bg-green-100' },
  prehipertensi: { label: 'Prehipertensi', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  hipertensi_1: { label: 'Hipertensi St.1', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  hipertensi_2: { label: 'Hipertensi St.2', color: 'text-red-700', bgColor: 'bg-red-100' },
};

function getBloodPressureStatus(systolic?: number, diastolic?: number): BPStatus | null {
  if (systolic === undefined || diastolic === undefined) return null;
  
  if (systolic >= 160 || diastolic >= 100) return 'hipertensi_2';
  if (systolic >= 140 || diastolic >= 90) return 'hipertensi_1';
  if (systolic >= 120 || diastolic >= 80) return 'prehipertensi';
  return 'normal';
}

export default function BloodPressureInput({
  systolic,
  diastolic,
  onSystolicChange,
  onDiastolicChange,
  label = 'Tekanan Darah',
  error,
  disabled = false,
  required = false,
  showIndicator = true,
}: BloodPressureInputProps) {
  const status = useMemo(() => getBloodPressureStatus(systolic, diastolic), [systolic, diastolic]);

  const handleInputChange = (
    value: string,
    onChange: (v: number | undefined) => void
  ) => {
    if (value === '') {
      onChange(undefined);
      return;
    }
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 300) {
      onChange(parsed);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="flex items-center gap-2">
        <div className={`
          flex items-center border rounded-lg overflow-hidden
          ${error ? 'border-red-500' : 'border-gray-200'}
          ${disabled ? 'opacity-50 bg-gray-50' : 'bg-white'}
        `}>
          {/* Systolic */}
          <input
            type="number"
            value={systolic ?? ''}
            onChange={(e) => handleInputChange(e.target.value, onSystolicChange)}
            placeholder="120"
            disabled={disabled}
            min={0}
            max={300}
            className="w-16 text-center py-2 border-0 focus:outline-none focus:ring-0 
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                       [&::-webkit-inner-spin-button]:appearance-none"
          />

          {/* Separator */}
          <span className="text-gray-400 font-bold px-1">/</span>

          {/* Diastolic */}
          <input
            type="number"
            value={diastolic ?? ''}
            onChange={(e) => handleInputChange(e.target.value, onDiastolicChange)}
            placeholder="80"
            disabled={disabled}
            min={0}
            max={200}
            className="w-16 text-center py-2 border-0 focus:outline-none focus:ring-0 
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                       [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Unit */}
        <span className="text-sm text-gray-500 font-medium">mmHg</span>

        {/* Status indicator */}
        {showIndicator && status && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${bpStatusConfig[status].bgColor} ${bpStatusConfig[status].color}`}>
            {bpStatusConfig[status].label}
          </span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
