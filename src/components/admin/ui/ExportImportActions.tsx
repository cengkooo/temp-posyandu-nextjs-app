import React, { useRef } from 'react';
import { Download, Upload, Printer } from 'lucide-react';
import Button from '@/components/admin/forms/Button';

interface ExportImportActionsProps {
  onExport: () => void;
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrint?: () => void;
  showImport?: boolean;
  showPrint?: boolean;
  acceptFileTypes?: string;
  exportLabel?: string;
  importLabel?: string;
  printLabel?: string;
}

const ExportImportActions: React.FC<ExportImportActionsProps> = ({
  onExport,
  onImport,
  onPrint,
  showImport = true,
  showPrint = true,
  acceptFileTypes = '.xlsx,.xls',
  exportLabel = 'Ekspor',
  importLabel = 'Impor',
  printLabel = 'Print',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        onClick={onExport}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        {exportLabel}
      </Button>

      {showImport && onImport && (
        <>
          <Button
            variant="secondary"
            onClick={handleImportClick}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {importLabel}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptFileTypes}
            onChange={onImport}
            className="hidden"
          />
        </>
      )}

      {showPrint && onPrint && (
        <Button
          variant="secondary"
          onClick={onPrint}
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          {printLabel}
        </Button>
      )}
    </div>
  );
};

export default ExportImportActions;
