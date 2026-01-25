'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputWithControlsProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function NumberInputWithControls({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 0.1,
  unit,
  label,
  placeholder = '0',
  error,
  disabled = false,
  required = false,
}: NumberInputWithControlsProps) {
  const handleIncrement = () => {
    const newValue = (value ?? 0) + step;
    if (newValue <= max) {
      onChange(Math.round(newValue * 100) / 100);
    }
  };

  const handleDecrement = () => {
    const newValue = (value ?? 0) - step;
    if (newValue >= min) {
      onChange(Math.round(newValue * 100) / 100);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(undefined);
      return;
    }
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue) && parsedValue >= min && parsedValue <= max) {
      onChange(parsedValue);
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
          {/* Decrement button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || (value !== undefined && value <= min)}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>

          {/* Input */}
          <input
            type="number"
            value={value ?? ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            step={step}
            min={min}
            max={max}
            className="w-20 text-center py-2 border-0 focus:outline-none focus:ring-0 
                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                       [&::-webkit-inner-spin-button]:appearance-none"
          />

          {/* Increment button */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || (value !== undefined && value >= max)}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border-l border-gray-200 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Unit label */}
        {unit && (
          <span className="text-sm text-gray-500 font-medium">{unit}</span>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
