/**
 * Patient-related utility functions
 */

export const getPatientTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    bayi: 'Bayi',
    balita: 'Balita',
    ibu_hamil: 'Ibu Hamil',
    remaja_dewasa: 'Remaja/Dewasa',
    lansia: 'Lansia',
  };
  return labels[type] || type;
};

export const getPatientTypeFromLabel = (label: string): string => {
  const types: Record<string, string> = {
    'Bayi': 'bayi',
    'Balita': 'balita',
    'Ibu Hamil': 'ibu_hamil',
    'Bumil': 'ibu_hamil', // Alias
    'Remaja/Dewasa': 'remaja_dewasa',
    'Lansia': 'lansia',
  };
  return types[label] || 'balita';
};

export const calculateAge = (dateOfBirth: string): string => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // For children under 2 years, show months
  if (age < 2) {
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + monthDiff;
    return `${months} bulan`;
  }
  
  return `${age} tahun`;
};

export const calculateDateOfBirth = (ageString: string): string => {
  // Simple calculation - convert age to approximate date of birth
  const today = new Date();
  if (ageString.includes('bulan')) {
    const months = parseInt(ageString);
    today.setMonth(today.getMonth() - months);
  } else {
    const years = parseInt(ageString);
    today.setFullYear(today.getFullYear() - years);
  }
  return today.toISOString().split('T')[0];
};

export const formatGender = (gender: string): string => {
  return gender === 'L' ? 'Laki-laki' : 'Perempuan';
};

export const parseGenderFromString = (genderString: string): 'L' | 'P' | '' => {
  const genderRaw = String(genderString || '').trim();
  if (genderRaw.toLowerCase().startsWith('laki')) {
    return 'L';
  } else if (genderRaw.toLowerCase().startsWith('perempuan') || genderRaw.toLowerCase().startsWith('perempua')) {
    return 'P';
  }
  return '';
};

export const maskNIK = (nik: string | null): string => {
  if (!nik) return '-';
  return `***${nik.slice(-4)}`;
};

/**
 * Convert NIK from Excel to string, handling scientific notation
 */
export const parseNIKFromExcel = (nikValue: unknown): string => {
  if (!nikValue) return '';
  
  if (typeof nikValue === 'number') {
    // Handle scientific notation by converting to string with full precision
    return nikValue.toFixed(0);
  }
  
  return String(nikValue).trim();
};
