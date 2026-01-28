'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }>;
  };
  title: string;
  labels: string[];
  className?: string;
}

export default function DonutChart({
  data,
  title,
  labels,
  className = '',
}: DonutChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
      <h2 className="text-lg font-bold text-gray-900 mb-6">{title}</h2>
      <div className="h-64 flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-6 space-y-2">
        {labels.map((label, index) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: data.datasets[0].backgroundColor[index],
                }}
              ></div>
              <span className="text-gray-700">{label}</span>
            </div>
            <span className="font-semibold text-gray-900">
              {data.datasets[0].data[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
