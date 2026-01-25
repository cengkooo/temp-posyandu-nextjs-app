'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  date?: string;
}

interface ChecklistInputProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  label?: string;
  showDates?: boolean;
  columns?: 1 | 2 | 3;
  disabled?: boolean;
}

export default function ChecklistInput({
  items,
  onChange,
  label,
  showDates = true,
  columns = 2,
  disabled = false,
}: ChecklistInputProps) {
  const handleCheckChange = (id: string, checked: boolean) => {
    const updatedItems = items.map((item) =>
      item.id === id
        ? { ...item, checked, date: checked && !item.date ? new Date().toISOString().split('T')[0] : item.date }
        : item
    );
    onChange(updatedItems);
  };

  const handleDateChange = (id: string, date: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, date } : item
    );
    onChange(updatedItems);
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className={`grid ${gridCols[columns]} gap-3`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-colors
              ${item.checked ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-200'}
              ${disabled ? 'opacity-50' : ''}
            `}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => handleCheckChange(item.id, e.target.checked)}
              disabled={disabled}
              className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />

            {/* Label and Date */}
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-medium ${item.checked ? 'text-teal-700' : 'text-gray-700'}`}>
                {item.label}
              </span>
              
              {showDates && item.checked && (
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <input
                    type="date"
                    value={item.date || ''}
                    onChange={(e) => handleDateChange(item.id, e.target.value)}
                    disabled={disabled}
                    className="text-xs border-0 bg-transparent text-gray-500 focus:outline-none focus:ring-0 p-0"
                  />
                </div>
              )}
            </div>

            {/* Status icon */}
            {item.checked && (
              <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
