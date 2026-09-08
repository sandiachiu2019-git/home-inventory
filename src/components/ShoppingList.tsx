import { ShoppingCart, AlertCircle, Printer } from 'lucide-react';
import type { InventoryItem, Language } from '@/lib/types';
import { t } from '@/lib/i18n';
import { isLowStock, getStockStatus } from '@/lib/utils';

interface ShoppingListProps {
  lang: Language;
  items: InventoryItem[];
  onPrint: () => void;
}

export function ShoppingList({ lang, items, onPrint }: ShoppingListProps) {
  const shoppingItems = items
    .filter((item) => isLowStock(item))
    .sort((a, b) => a.quantity - b.quantity);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">{t(lang, 'shoppingList')}</h2>
            <p className="text-xs text-slate-500">{t(lang, 'shoppingListTitle')}</p>
          </div>
        </div>
        {shoppingItems.length > 0 && (
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-amber-700 hover:bg-amber-50 text-sm font-medium border border-amber-200 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{t(lang, 'printList')}</span>
          </button>
        )}
      </div>

      <div className="p-4">
        {shoppingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <ShoppingCart className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm text-slate-500">{t(lang, 'shoppingListEmpty')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {shoppingItems.map((item) => {
              const status = getStockStatus(item, lang);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      item.quantity === 0
                        ? 'bg-red-100 text-red-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.quantity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.category} · {item.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>
                      {t(lang, 'lowStock')}: {item.lowStockThreshold ?? 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
