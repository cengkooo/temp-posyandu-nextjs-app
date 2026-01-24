import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

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
    <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Icon on Left */}
        <div className={`p-4 ${bgColor} rounded-xl`}>
          <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={2.5} />
        </div>

        {/* Trend or Label on Right */}
        {trendValue && (
          <div
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg ${
              trend === 'up' 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-red-600 bg-red-50'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trendValue}</span>
          </div>
        )}
        {label && !trendValue && (
          <span
            className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
              label.includes('follow up')
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {label}
          </span>
        )}
      </div>

      {/* Value and Title */}
      <div className="mt-5">
        <div className="text-4xl font-bold text-gray-900 mb-1.5" suppressHydrationWarning>
          {value.toLocaleString('id-ID')}
        </div>
        <div className="text-sm font-medium text-gray-500">{title}</div>
      </div>
    </div>
  );
}
