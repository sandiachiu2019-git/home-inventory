import { Search, X } from 'lucide-react';
import type { Language } from '@/lib/types';
import { t } from '@/lib/i18n';

interface SearchBarProps {
  lang: Language;
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ lang, value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t(lang, 'search')}
        className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
