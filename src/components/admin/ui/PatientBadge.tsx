import React from 'react';

interface PatientTypeBadgeProps {
  type: string;
}

interface GenderBadgeProps {
  gender: string;
}

export const PatientTypeBadge: React.FC<PatientTypeBadgeProps> = ({ type }) => {
  const badges = {
    bayi: 'bg-blue-50 text-blue-600',
    balita: 'bg-cyan-50 text-cyan-600',
    ibu_hamil: 'bg-pink-50 text-pink-600',
    remaja_dewasa: 'bg-purple-50 text-purple-600',
    lansia: 'bg-orange-50 text-orange-600',
  };
  
  const labels = {
    bayi: 'Bayi',
    balita: 'Balita',
    ibu_hamil: 'Ibu Hamil',
    remaja_dewasa: 'Remaja/Dewasa',
    lansia: 'Lansia',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type as keyof typeof badges] || 'bg-gray-50 text-gray-600'}`}>
      {labels[type as keyof typeof labels] || type}
    </span>
  );
};

export const GenderBadge: React.FC<GenderBadgeProps> = ({ gender }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
    }`}>
      {gender}
    </span>
  );
};
