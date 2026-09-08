import { Package } from 'lucide-react';
import type { Language } from '@/lib/types';
import { t } from '@/lib/i18n';

interface EmptyStateProps {
  lang: Language;
  message: string;
}

export function EmptyState({ lang, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-sm text-slate-500 max-w-xs">{message}</p>
    </div>
  );
}
