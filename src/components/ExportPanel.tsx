import { Download, Upload, Trash2, FileJson, FileSpreadsheet, DatabaseBackup, AlertTriangle } from 'lucide-react';
import { useRef } from 'react';
import type { InventoryItem, Language } from '@/lib/types';
import { t } from '@/lib/i18n';
import { toCSV, downloadFile } from '@/lib/utils';

interface ExportPanelProps {
  lang: Language;
  items: InventoryItem[];
  onImport: (items: InventoryItem[]) => void;
  onClearAll: () => void;
}

export function ExportPanel({ lang, items, onImport, onClearAll }: ExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    const csv = toCSV(items);
    downloadFile(csv, `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(items, null, 2);
    downloadFile(json, `inventory-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        if (!confirm(t(lang, 'confirmImport'))) return;
        onImport(data);
      } catch {
        alert(t(lang, 'importError'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (confirm(t(lang, 'confirmClearAll'))) {
      onClearAll();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center">
            <DatabaseBackup className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">{t(lang, 'dataBackup')}</h2>
            <p className="text-xs text-slate-500">
              {items.length} {items.length === 1 ? t(lang, 'item') : t(lang, 'items')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportCSV}
            disabled={items.length === 0}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold">{t(lang, 'exportCsv')}</p>
              <p className="text-xs text-green-600/70 truncate">Universal CSV format</p>
            </div>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={items.length === 0}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileJson className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold">{t(lang, 'exportJson')}</p>
              <p className="text-xs text-blue-600/70 truncate">Full backup format</p>
            </div>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleImportClick}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all"
          >
            <Upload className="w-4 h-4" />
            {t(lang, 'importJson')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleClearAll}
            disabled={items.length === 0}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t(lang, 'clearAllData')}</span>
          </button>
        </div>

        {items.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              {t(lang, 'confirmImport')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
