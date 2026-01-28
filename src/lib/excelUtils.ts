import * as XLSX from 'xlsx';
import { 
  parseNIKFromExcel, 
  parseGenderFromString, 
  getPatientTypeFromLabel, 
  calculateDateOfBirth 
} from './patientUtils';

export interface ImportedPatientData {
  full_name: string;
  nik: string;
  date_of_birth: string;
  gender: 'L' | 'P';
  patient_type: string;
  parent_name: string | null;
  phone: string | null;
  address: string | null;
}

export interface ImportResult {
  validData: ImportedPatientData[];
  invalidRows: number[];
}

/**
 * Parse Excel file and validate patient data
 */
export const parsePatientExcel = (data: unknown): ImportResult => {
  const workbook = XLSX.read(data, { type: 'binary' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  const validData: ImportedPatientData[] = [];
  const invalidRows: number[] = [];

  for (let i = 0; i < (jsonData as Record<string, unknown>[]).length; i++) {
    const row = (jsonData as Record<string, unknown>[])[i];

    // Parse NIK with scientific notation handling
    const nikString = parseNIKFromExcel(row['NIK']);

    // Normalize gender
    const gender = parseGenderFromString(String(row['J/K'] || ''));

    // Validate required fields
    if (row['Nama Lengkap'] && nikString && row['Tipe'] && row['Umur'] && gender) {
      validData.push({
        full_name: String(row['Nama Lengkap']).trim(),
        nik: nikString,
        date_of_birth: calculateDateOfBirth(String(row['Umur'])),
        gender: gender as 'L' | 'P',
        patient_type: getPatientTypeFromLabel(String(row['Tipe'])),
        parent_name: row['Orang Tua'] && row['Orang Tua'] !== '-' ? String(row['Orang Tua']).trim() : null,
        phone: row['Telepon'] && row['Telepon'] !== '-' ? String(row['Telepon']).trim() : null,
        address: null,
      });
    } else {
      invalidRows.push(i + 2); // +2 because Excel rows start at 1 and has header
    }
  }

  return { validData, invalidRows };
};

/**
 * Export data to Excel file
 */
export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1'
): void => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
};
