/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, differenceInMonths } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface PatientData {
  full_name: string;
  date_of_birth: string;
  gender: 'L' | 'P';
  parent_name?: string;
  address?: string;
  blood_type?: string;
}

interface GrowthData {
  date: string;
  age_months: number;
  weight: number;
  height: number;
  head_circumference?: number;
  status_bbu?: string;
  status_tbu?: string;
  status_bbtb?: string;
}

interface ImmunizationData {
  name: string;
  date: string | null;
  status: 'completed' | 'pending' | 'overdue';
}

interface VisitData {
  date: string;
  weight: number;
  height: number;
  notes?: string;
}

// KMS PDF Generation
export function generateKMSPDF(
  patient: PatientData,
  growthData: GrowthData[],
  immunizations: ImmunizationData[],
  _visits: VisitData[]
): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const tealColor: [number, number, number] = [20, 184, 166];
  const grayColor: [number, number, number] = [107, 114, 128];
  
  // Header
  doc.setFillColor(...tealColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('KARTU MENUJU SEHAT (KMS)', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Posyandu Melati Sehat', pageWidth / 2, 28, { align: 'center' });
  doc.text(`Dicetak: ${format(new Date(), 'dd MMMM yyyy', { locale: idLocale })}`, pageWidth / 2, 35, { align: 'center' });
  
  // Patient Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 48, pageWidth - 30, 35, 3, 3, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.full_name, 20, 58);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  
  const birthDate = new Date(patient.date_of_birth);
  const ageMonths = differenceInMonths(new Date(), birthDate);
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  const ageText = years > 0 ? `${years} tahun ${months} bulan` : `${months} bulan`;
  
  doc.text(`Tanggal Lahir: ${format(birthDate, 'dd MMMM yyyy', { locale: idLocale })}`, 20, 66);
  doc.text(`Usia: ${ageText}`, 20, 72);
  doc.text(`Jenis Kelamin: ${patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}`, 20, 78);
  
  if (patient.parent_name) {
    doc.text(`Nama Orang Tua: ${patient.parent_name}`, 110, 66);
  }
  if (patient.blood_type) {
    doc.text(`Golongan Darah: ${patient.blood_type}`, 110, 72);
  }
  
  let yPos = 92;
  
  // Latest Measurements
  if (growthData.length > 0) {
    const latest = growthData[0];
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Pengukuran Terakhir', 15, yPos);
    yPos += 8;
    
    // Measurement boxes
    const boxWidth = (pageWidth - 40) / 4;
    const measurements = [
      { label: 'Berat Badan', value: `${latest.weight} kg`, status: latest.status_bbu || '' },
      { label: 'Tinggi Badan', value: `${latest.height} cm`, status: latest.status_tbu || '' },
      { label: 'Lingkar Kepala', value: latest.head_circumference ? `${latest.head_circumference} cm` : '-', status: '' },
      { label: 'Status Gizi', value: latest.status_bbtb || '-', status: '' },
    ];
    
    measurements.forEach((m, i) => {
      const x = 15 + (i * boxWidth) + (i * 3);
      doc.setFillColor(240, 253, 250);
      doc.roundedRect(x, yPos, boxWidth, 22, 2, 2, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(...grayColor);
      doc.text(m.label, x + 5, yPos + 7);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(m.value, x + 5, yPos + 16);
    });
    
    yPos += 30;
  }
  
  // Growth History Table
  if (growthData.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Riwayat Pertumbuhan', 15, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Tanggal', 'Usia', 'BB (kg)', 'TB (cm)', 'LK (cm)', 'Status BB/U', 'Status TB/U']],
      body: growthData.slice(0, 10).map(g => [
        format(new Date(g.date), 'dd/MM/yyyy'),
        `${g.age_months} bln`,
        g.weight.toString(),
        g.height.toString(),
        g.head_circumference?.toString() || '-',
        g.status_bbu || '-',
        g.status_tbu || '-',
      ]),
      theme: 'grid',
      headStyles: { fillColor: tealColor, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 15, right: 15 },
    });
    
    yPos = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }
  
  // Immunization Status
  if (immunizations.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Status Imunisasi', 15, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Jenis Vaksin', 'Tanggal', 'Status']],
      body: immunizations.map(imm => [
        imm.name,
        imm.date ? format(new Date(imm.date), 'dd/MM/yyyy') : '-',
        imm.status === 'completed' ? '✓ Lengkap' : imm.status === 'overdue' ? '✗ Terlambat' : 'Belum',
      ]),
      theme: 'grid',
      headStyles: { fillColor: tealColor, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === 'body') {
          const text = data.cell.text[0];
          if (text.includes('Lengkap')) {
            data.cell.styles.textColor = [16, 185, 129];
          } else if (text.includes('Terlambat')) {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      },
    });
  }
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Dokumen ini digenerate otomatis dari Sistem Posyandu Digital', pageWidth / 2, footerY, { align: 'center' });
  
  // Save
  doc.save(`KMS_${patient.full_name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}

// Buku KIA PDF Generation for Ibu Hamil
interface PregnancyData {
  hpht: string;
  hpl: string;
  gravida: number;
  para: number;
  abortus: number;
  initial_weight: number;
  initial_height: number;
  blood_type: string;
  rhesus: string;
}

interface ANCVisit {
  date: string;
  visit_number: string;
  pregnancy_weeks: number;
  weight: number;
  blood_pressure: string;
  lila: number;
  fundal_height: number | null;
  fetal_heart_rate: number | null;
  ttd_given: number;
  notes: string;
}

interface TTImmunization {
  name: string;
  date: string | null;
  status: 'completed' | 'pending';
}

export function generateBukuKIAPDF(
  patient: PatientData,
  pregnancy: PregnancyData,
  ancVisits: ANCVisit[],
  ttImmunizations: TTImmunization[]
): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colors
  const pinkColor: [number, number, number] = [236, 72, 153];
  const grayColor: [number, number, number] = [107, 114, 128];
  
  // Header
  doc.setFillColor(...pinkColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('BUKU KIA DIGITAL', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Kesehatan Ibu dan Anak', pageWidth / 2, 28, { align: 'center' });
  doc.text(`Dicetak: ${format(new Date(), 'dd MMMM yyyy', { locale: idLocale })}`, pageWidth / 2, 35, { align: 'center' });
  
  // Patient Info Box
  doc.setFillColor(253, 242, 248);
  doc.roundedRect(15, 48, pageWidth - 30, 40, 3, 3, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(patient.full_name, 20, 58);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  
  // Calculate pregnancy weeks
  const hphtDate = new Date(pregnancy.hpht);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - hphtDate.getTime());
  const pregnancyWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  const trimester = pregnancyWeeks <= 12 ? 1 : pregnancyWeeks <= 27 ? 2 : 3;
  
  doc.text(`G${pregnancy.gravida}P${pregnancy.para}A${pregnancy.abortus}`, 20, 66);
  doc.text(`Usia Kehamilan: ${pregnancyWeeks} minggu (Trimester ${trimester})`, 20, 72);
  doc.text(`HPHT: ${format(hphtDate, 'dd MMMM yyyy', { locale: idLocale })}`, 20, 78);
  doc.text(`HPL: ${format(new Date(pregnancy.hpl), 'dd MMMM yyyy', { locale: idLocale })}`, 20, 84);
  
  doc.text(`Golongan Darah: ${pregnancy.blood_type}${pregnancy.rhesus}`, 110, 66);
  doc.text(`BB Awal: ${pregnancy.initial_weight} kg`, 110, 72);
  doc.text(`TB: ${pregnancy.initial_height} cm`, 110, 78);
  
  let yPos = 96;
  
  // ANC Progress
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Progress Kunjungan ANC', 15, yPos);
  yPos += 8;
  
  // Progress boxes for K1-K6
  const kunjunganProgress = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6'];
  const boxWidth = (pageWidth - 40) / 6;
  
  kunjunganProgress.forEach((k, i) => {
    const x = 15 + (i * boxWidth) + (i * 2);
    const isCompleted = ancVisits.some(v => v.visit_number === k);
    
    if (isCompleted) {
      doc.setFillColor(...pinkColor);
    } else {
      doc.setFillColor(229, 231, 235);
    }
    doc.roundedRect(x, yPos, boxWidth, 12, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(isCompleted ? 255 : 107, isCompleted ? 255 : 114, isCompleted ? 255 : 128);
    doc.text(k, x + boxWidth / 2, yPos + 8, { align: 'center' });
  });
  
  yPos += 20;
  
  // ANC Visits Table
  if (ancVisits.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Riwayat Kunjungan ANC', 15, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Kunjungan', 'Tanggal', 'UK', 'BB', 'TD', 'LILA', 'TFU', 'DJJ', 'TTD']],
      body: ancVisits.map(v => [
        v.visit_number,
        format(new Date(v.date), 'dd/MM/yy'),
        `${v.pregnancy_weeks} mg`,
        `${v.weight} kg`,
        v.blood_pressure,
        `${v.lila} cm`,
        v.fundal_height ? `${v.fundal_height} cm` : '-',
        v.fetal_heart_rate ? `${v.fetal_heart_rate}` : '-',
        `${v.ttd_given}`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: pinkColor, fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 1.5 },
      margin: { left: 15, right: 15 },
    });
    
    yPos = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }
  
  // TT Immunization Status
  if (ttImmunizations.length > 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Status Imunisasi TT', 15, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Imunisasi', 'Tanggal', 'Status']],
      body: ttImmunizations.map(imm => [
        imm.name,
        imm.date ? format(new Date(imm.date), 'dd/MM/yyyy') : '-',
        imm.status === 'completed' ? '✓ Lengkap' : 'Belum',
      ]),
      theme: 'grid',
      headStyles: { fillColor: pinkColor, fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === 'body') {
          const text = data.cell.text[0];
          if (text.includes('Lengkap')) {
            data.cell.styles.textColor = [16, 185, 129];
          }
        }
      },
    });
  }
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Dokumen ini digenerate otomatis dari Sistem Posyandu Digital', pageWidth / 2, footerY, { align: 'center' });
  
  // Save
  doc.save(`BukuKIA_${patient.full_name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}
