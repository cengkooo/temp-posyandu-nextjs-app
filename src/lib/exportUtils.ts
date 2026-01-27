import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import type { Statistics, BreakdownRow } from '@/types'

// Export to Excel
export function exportToExcel(
  data: {
    statistics?: Statistics
    breakdown?: BreakdownRow[]
    visitTrends?: any[]
  },
  filename: string,
  reportType: string
) {
  const workbook = XLSX.utils.book_new()

  // Summary Sheet
  if (data.statistics) {
    const summaryData: (string | number)[][] = [
      ['Laporan Posyandu - ' + reportType],
      ['Tanggal Generate:', format(new Date(), 'dd/MM/yyyy HH:mm')],
      [],
      ['Statistik Utama'],
      ['Total Kunjungan', data.statistics.totalVisits, `Trend: ${data.statistics.totalVisitsTrend}%`],
      ['Pasien Baru', data.statistics.newPatients, `Trend: ${data.statistics.newPatientsTrend}%`],
      ['Cakupan Imunisasi', `${data.statistics.immunizationCoverage}%`, `Trend: ${data.statistics.immunizationCoverageTrend}%`],
      ['Total Balita Dipantau', data.statistics.totalBalita, `Trend: ${data.statistics.totalBalitaTrend}%`],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    
    // Set column widths
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 20 }
    ]

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan')
  }

  // Breakdown Sheet
  if (data.breakdown && data.breakdown.length > 0) {
    const breakdownData: (string | number)[][] = [
      ['Detail Breakdown per Kategori'],
      [],
      ['Kategori', 'Jumlah Pasien', 'Kunjungan', 'Rata-rata/Bulan', 'Trend (%)']
    ]

    data.breakdown.forEach(row => {
      breakdownData.push([
        row.category,
        row.patientCount,
        row.visitCount,
        row.averagePerMonth,
        row.trend
      ])
    })

    const breakdownSheet = XLSX.utils.aoa_to_sheet(breakdownData)
    
    // Set column widths
    breakdownSheet['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 12 }
    ]

    XLSX.utils.book_append_sheet(workbook, breakdownSheet, 'Detail Breakdown')
  }

  // Visit Trends Sheet
  if (data.visitTrends && data.visitTrends.length > 0) {
    const trendsData: (string | number)[][] = [
      ['Trend Kunjungan per Bulan'],
      [],
      ['Bulan', 'Balita', 'Ibu Hamil', 'Lansia', 'Total']
    ]

    data.visitTrends.forEach(row => {
      const total = row.balita + row.ibu_hamil + row.lansia
      trendsData.push([
        row.month,
        row.balita,
        row.ibu_hamil,
        row.lansia,
        total
      ])
    })

    const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData)
    
    // Set column widths
    trendsSheet['!cols'] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 }
    ]

    XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Trend Kunjungan')
  }

  // Write file
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// Export to PDF
export function exportToPDF(
  data: {
    statistics?: Statistics
    breakdown?: BreakdownRow[]
    dateRange?: { start: string, end: string }
  },
  filename: string,
  reportType: string
) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Laporan Posyandu Melati Sehat', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Tipe Laporan: ${reportType}`, 105, 30, { align: 'center' })

  if (data.dateRange) {
    doc.text(
      `Periode: ${format(new Date(data.dateRange.start), 'dd/MM/yyyy')} - ${format(new Date(data.dateRange.end), 'dd/MM/yyyy')}`,
      105,
      37,
      { align: 'center' }
    )
  }

  doc.text(`Tanggal Generate: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 44, { align: 'center' })

  let yPosition = 55

  // Statistics Summary
  if (data.statistics) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Ringkasan Statistik', 14, yPosition)
    yPosition += 10

    const statsData = [
      ['Total Kunjungan', data.statistics.totalVisits.toString(), `${data.statistics.totalVisitsTrend > 0 ? '+' : ''}${data.statistics.totalVisitsTrend}%`],
      ['Pasien Baru', data.statistics.newPatients.toString(), `${data.statistics.newPatientsTrend > 0 ? '+' : ''}${data.statistics.newPatientsTrend}%`],
      ['Cakupan Imunisasi', `${data.statistics.immunizationCoverage}%`, `${data.statistics.immunizationCoverageTrend > 0 ? '+' : ''}${data.statistics.immunizationCoverageTrend}%`],
      ['Total Balita Dipantau', data.statistics.totalBalita.toString(), `${data.statistics.totalBalitaTrend > 0 ? '+' : ''}${data.statistics.totalBalitaTrend}%`],
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [['Indikator', 'Nilai', 'Trend']],
      body: statsData,
      theme: 'grid',
      headStyles: { fillColor: [20, 184, 166], textColor: 255 },
      styles: { fontSize: 10 }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // Breakdown Table
  if (data.breakdown && data.breakdown.length > 0) {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Detail Breakdown per Kategori', 14, yPosition)
    yPosition += 10

    const breakdownData = data.breakdown.map(row => [
      row.category,
      row.patientCount.toString(),
      row.visitCount.toString(),
      row.averagePerMonth.toString(),
      `${row.trend > 0 ? '+' : ''}${row.trend}%`
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Kategori', 'Jumlah Pasien', 'Kunjungan', 'Rata-rata/Bulan', 'Trend']],
      body: breakdownData,
      theme: 'grid',
      headStyles: { fillColor: [20, 184, 166], textColor: 255 },
      styles: { fontSize: 10 }
    })
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  // Save
  doc.save(`${filename}.pdf`)
}

// Generate printable HTML
export function generatePrintableReport(
  data: {
    statistics?: Statistics
    breakdown?: BreakdownRow[]
    dateRange?: { start: string, end: string }
  },
  reportType: string
) {
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Please allow popups to print the report')
    return
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Posyandu</title>
      <style>
        @media print {
          @page {
            margin: 2cm;
          }
          body {
            font-family: Arial, sans-serif;
          }
          .no-print {
            display: none;
          }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          color: #14b8a6;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #14b8a6;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 30px;
          margin-bottom: 10px;
          color: #333;
        }
        .trend-positive {
          color: #10b981;
        }
        .trend-negative {
          color: #ef4444;
        }
        .print-button {
          margin: 20px 0;
          padding: 10px 20px;
          background-color: #14b8a6;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ Cetak Laporan</button>
      
      <div class="header">
        <h1>Laporan Posyandu Melati Sehat</h1>
        <p><strong>Tipe Laporan:</strong> ${reportType}</p>
        ${data.dateRange ? `<p><strong>Periode:</strong> ${format(new Date(data.dateRange.start), 'dd MMMM yyyy')} - ${format(new Date(data.dateRange.end), 'dd MMMM yyyy')}</p>` : ''}
        <p><strong>Tanggal Generate:</strong> ${format(new Date(), 'dd MMMM yyyy HH:mm')}</p>
      </div>

      ${data.statistics ? `
        <div class="section-title">Ringkasan Statistik</div>
        <table>
          <thead>
            <tr>
              <th>Indikator</th>
              <th>Nilai</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Kunjungan</td>
              <td>${data.statistics.totalVisits}</td>
              <td class="${data.statistics.totalVisitsTrend >= 0 ? 'trend-positive' : 'trend-negative'}">
                ${data.statistics.totalVisitsTrend > 0 ? '+' : ''}${data.statistics.totalVisitsTrend}%
              </td>
            </tr>
            <tr>
              <td>Pasien Baru</td>
              <td>${data.statistics.newPatients}</td>
              <td class="${data.statistics.newPatientsTrend >= 0 ? 'trend-positive' : 'trend-negative'}">
                ${data.statistics.newPatientsTrend > 0 ? '+' : ''}${data.statistics.newPatientsTrend}%
              </td>
            </tr>
            <tr>
              <td>Cakupan Imunisasi</td>
              <td>${data.statistics.immunizationCoverage}%</td>
              <td class="${data.statistics.immunizationCoverageTrend >= 0 ? 'trend-positive' : 'trend-negative'}">
                ${data.statistics.immunizationCoverageTrend > 0 ? '+' : ''}${data.statistics.immunizationCoverageTrend}%
              </td>
            </tr>
            <tr>
              <td>Total Balita Dipantau</td>
              <td>${data.statistics.totalBalita}</td>
              <td class="${data.statistics.totalBalitaTrend >= 0 ? 'trend-positive' : 'trend-negative'}">
                ${data.statistics.totalBalitaTrend > 0 ? '+' : ''}${data.statistics.totalBalitaTrend}%
              </td>
            </tr>
          </tbody>
        </table>
      ` : ''}

      ${data.breakdown && data.breakdown.length > 0 ? `
        <div class="section-title">Detail Breakdown per Kategori</div>
        <table>
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Jumlah Pasien</th>
              <th>Kunjungan</th>
              <th>Rata-rata/Bulan</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            ${data.breakdown.map(row => `
              <tr>
                <td>${row.category}</td>
                <td>${row.patientCount}</td>
                <td>${row.visitCount}</td>
                <td>${row.averagePerMonth}</td>
                <td class="${row.trend >= 0 ? 'trend-positive' : 'trend-negative'}">
                  ${row.trend > 0 ? '+' : ''}${row.trend}%
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
