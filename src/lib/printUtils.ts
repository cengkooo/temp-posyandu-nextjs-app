/**
 * Utility functions for printing
 */

export interface PrintConfig {
  title: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'Letter';
}

/**
 * Generate HTML for printing a table
 */
export const generatePrintHTML = (
  headers: string[],
  rows: string[][],
  config: PrintConfig
): string => {
  const { title, subtitle, orientation = 'landscape', pageSize = 'A4' } = config;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            @page { 
              size: ${pageSize} ${orientation};
              margin: 1.5cm; 
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            text-align: center;
            color: #0d9488;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #0d9488;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
        
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          <p>Total Data: ${rows.length}</p>
        </div>
      </body>
    </html>
  `;
};

/**
 * Open print window with HTML content
 */
export const printHTML = (html: string): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup diblokir. Mohon izinkan popup untuk mencetak.');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};
