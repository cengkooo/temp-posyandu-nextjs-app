/**
 * Nutrition Calculator Utilities
 * Berdasarkan standar WHO untuk perhitungan status gizi
 */

// Calculate age in months from date of birth
export function calculateAgeInMonths(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  let months = (today.getFullYear() - dob.getFullYear()) * 12;
  months += today.getMonth() - dob.getMonth();
  
  // Adjust if current day is less than birth day
  if (today.getDate() < dob.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

// Calculate age in years from date of birth
export function calculateAgeInYears(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  let years = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    years--;
  }
  
  return Math.max(0, years);
}

// Format age display
export function formatAge(dateOfBirth: string | Date): string {
  const months = calculateAgeInMonths(dateOfBirth);
  
  if (months < 12) {
    return `${months} bulan`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} tahun`;
  }
  
  return `${years} tahun ${remainingMonths} bulan`;
}

// Nutritional status types
export type NutritionalStatus = 'gizi_baik' | 'gizi_kurang' | 'gizi_buruk' | 'stunting' | 'wasting' | 'normal';

export interface NutritionalIndicator {
  status: NutritionalStatus;
  zScore: number;
  label: string;
  type: 'good' | 'warning' | 'danger';
}

/**
 * Simplified WHO Z-Score calculation for BB/U (Weight for Age)
 * Note: This is a simplified version. Real implementation should use WHO growth charts data tables
 */
export function calculateBBU(
  weight: number,
  ageMonths: number,
  gender: 'L' | 'P'
): NutritionalIndicator {
  // Simplified median weight by age (should use WHO tables in production)
  const getMedianWeight = (months: number, g: 'L' | 'P'): { median: number; sd: number } => {
    // Approximation based on WHO growth standards
    const baseWeight = g === 'L' ? 3.3 : 3.2;
    const monthlyGain = months <= 3 ? 0.9 : months <= 6 ? 0.6 : months <= 12 ? 0.4 : 0.2;
    const median = baseWeight + (months * monthlyGain);
    const sd = median * 0.12; // Approximately 12% standard deviation
    return { median, sd };
  };

  const { median, sd } = getMedianWeight(ageMonths, gender);
  const zScore = (weight - median) / sd;

  if (zScore < -3) {
    return { status: 'gizi_buruk', zScore, label: 'Gizi Buruk', type: 'danger' };
  } else if (zScore < -2) {
    return { status: 'gizi_kurang', zScore, label: 'Gizi Kurang', type: 'warning' };
  } else if (zScore <= 2) {
    return { status: 'gizi_baik', zScore, label: 'Gizi Baik', type: 'good' };
  } else {
    return { status: 'gizi_baik', zScore, label: 'Gizi Baik', type: 'good' };
  }
}

/**
 * Simplified WHO Z-Score calculation for TB/U or PB/U (Length/Height for Age)
 */
export function calculateTBU(
  height: number,
  ageMonths: number,
  gender: 'L' | 'P'
): NutritionalIndicator {
  // Simplified median height by age
  const getMedianHeight = (months: number, g: 'L' | 'P'): { median: number; sd: number } => {
    const baseHeight = g === 'L' ? 49.9 : 49.1;
    const monthlyGain = months <= 12 ? 2.5 : 1.0;
    const median = baseHeight + (months * monthlyGain);
    const sd = median * 0.04;
    return { median, sd };
  };

  const { median, sd } = getMedianHeight(ageMonths, gender);
  const zScore = (height - median) / sd;

  if (zScore < -3) {
    return { status: 'stunting', zScore, label: 'Stunting Berat', type: 'danger' };
  } else if (zScore < -2) {
    return { status: 'stunting', zScore, label: 'Stunting', type: 'warning' };
  } else if (zScore <= 2) {
    return { status: 'normal', zScore, label: 'Normal', type: 'good' };
  } else {
    return { status: 'normal', zScore, label: 'Normal', type: 'good' };
  }
}

/**
 * Simplified WHO Z-Score calculation for BB/TB (Weight for Length/Height)
 */
export function calculateBBTB(
  weight: number,
  height: number,
  gender: 'L' | 'P'
): NutritionalIndicator {
  // Simplified calculation using BMI-like ratio
  const ratio = weight / (height / 100);
  const expectedRatio = gender === 'L' ? 0.15 : 0.14; // kg per cm
  const sd = expectedRatio * 0.15;
  const zScore = (ratio - expectedRatio) / sd;

  if (zScore < -3) {
    return { status: 'wasting', zScore, label: 'Wasting Berat', type: 'danger' };
  } else if (zScore < -2) {
    return { status: 'wasting', zScore, label: 'Wasting', type: 'warning' };
  } else if (zScore <= 2) {
    return { status: 'normal', zScore, label: 'Normal', type: 'good' };
  } else {
    return { status: 'gizi_baik', zScore, label: 'Gizi Lebih', type: 'warning' };
  }
}

/**
 * Calculate BMI (Body Mass Index) for adults
 */
export function calculateIMT(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

export type IMTStatus = 'underweight' | 'normal' | 'overweight' | 'obesitas';

export interface IMTResult {
  value: number;
  status: IMTStatus;
  label: string;
  type: 'good' | 'warning' | 'danger' | 'info';
}

export function getIMTStatus(imt: number): IMTResult {
  if (imt < 18.5) {
    return { value: imt, status: 'underweight', label: 'Berat Badan Kurang', type: 'info' };
  } else if (imt < 25) {
    return { value: imt, status: 'normal', label: 'Normal', type: 'good' };
  } else if (imt < 30) {
    return { value: imt, status: 'overweight', label: 'Berat Badan Lebih', type: 'warning' };
  } else {
    return { value: imt, status: 'obesitas', label: 'Obesitas', type: 'danger' };
  }
}

/**
 * Calculate LILA (Lingkar Lengan Atas) status for pregnant women
 * KEK = Kurang Energi Kronis (Chronic Energy Deficiency)
 */
export type LILAStatus = 'normal' | 'risiko_kek';

export function getLILAStatus(lila: number): { status: LILAStatus; label: string; type: 'good' | 'warning' } {
  if (lila >= 23.5) {
    return { status: 'normal', label: 'Normal', type: 'good' };
  } else {
    return { status: 'risiko_kek', label: 'Risiko KEK', type: 'warning' };
  }
}

/**
 * Calculate Blood Pressure status
 */
export type BPStatus = 'normal' | 'prehipertensi' | 'hipertensi_1' | 'hipertensi_2';

export function getBloodPressureStatus(
  systolic: number,
  diastolic: number
): { status: BPStatus; label: string; type: 'good' | 'warning' | 'danger' } {
  if (systolic >= 160 || diastolic >= 100) {
    return { status: 'hipertensi_2', label: 'Hipertensi Stadium 2', type: 'danger' };
  } else if (systolic >= 140 || diastolic >= 90) {
    return { status: 'hipertensi_1', label: 'Hipertensi Stadium 1', type: 'warning' };
  } else if (systolic >= 120 || diastolic >= 80) {
    return { status: 'prehipertensi', label: 'Prehipertensi', type: 'warning' };
  } else {
    return { status: 'normal', label: 'Normal', type: 'good' };
  }
}

/**
 * Calculate waist circumference risk (metabolic risk)
 */
export function getWaistCircumferenceRisk(
  circumference: number,
  gender: 'L' | 'P'
): { isRisk: boolean; label: string; type: 'good' | 'warning' } {
  const threshold = gender === 'L' ? 90 : 80;
  
  if (circumference >= threshold) {
    return { isRisk: true, label: 'Risiko Metabolik', type: 'warning' };
  } else {
    return { isRisk: false, label: 'Normal', type: 'good' };
  }
}

/**
 * Calculate pregnancy trimester from weeks
 */
export function getPregnancyTrimester(weeks: number): 1 | 2 | 3 {
  if (weeks <= 12) return 1;
  if (weeks <= 27) return 2;
  return 3;
}

/**
 * Calculate HPL (Hari Perkiraan Lahir) from HPHT (Hari Pertama Haid Terakhir)
 * Using Naegele's rule: HPHT + 7 days - 3 months + 1 year
 */
export function calculateHPL(hpht: string | Date): Date {
  const date = typeof hpht === 'string' ? new Date(hpht) : hpht;
  
  // Add 7 days
  date.setDate(date.getDate() + 7);
  // Subtract 3 months
  date.setMonth(date.getMonth() - 3);
  // Add 1 year
  date.setFullYear(date.getFullYear() + 1);
  
  return date;
}

/**
 * Calculate pregnancy weeks from HPHT
 */
export function calculatePregnancyWeeks(hpht: string | Date): number {
  const hphtDate = typeof hpht === 'string' ? new Date(hpht) : hpht;
  const today = new Date();
  const diffTime = today.getTime() - hphtDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}
