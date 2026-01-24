import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: number;
  trend?: 'up' | 'down';
  trendValue?: string;
  bgColor: string;
  iconColor: string;
  label?: string;
}

export default function StatCard({
  icon: Icon,
  title,
  value,
  trend,
  trendValue,
  bgColor,
  iconColor,
  label,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {trendValue && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-teal-600' : 'text-red-600'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{trendValue}</span>
          </div>
        )}
        {label && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              label.includes('follow up')
                ? 'bg-orange-100 text-orange-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {label}
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 mb-1" suppressHydrationWarning>
          {value.toLocaleString('id-ID')}
        </div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );
}
