import { Pencil, Trash2, MapPin, Tag, Package, AlertTriangle, CalendarClock, CalendarX } from 'lucide-react';
import type { InventoryItem, Language } from '@/lib/types';
import { t } from '@/lib/i18n';
import { isExpired, isExpiringSoon, isLowStock, getStockStatus, getExpirationStatus } from '@/lib/utils';

interface ItemCardProps {
  lang: Language;
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ lang, item, onEdit, onDelete }: ItemCardProps) {
  const expired = isExpired(item);
  const expiringSoon = isExpiringSoon(item);
  const lowStock = isLowStock(item);
  const stockStatus = getStockStatus(item, lang);
  const expStatus = getExpirationStatus(item, lang);

  const stockBadgeClass = {
    green: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  }[stockStatus.color] || 'bg-slate-50 text-slate-600 ring-1 ring-slate-200';

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all overflow-hidden">
      {/* Image or placeholder */}
      <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stockBadgeClass}`}>
            {stockStatus.label}
          </span>
          {expired && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white shadow-sm">
              <CalendarX className="w-3 h-3" />
              {t(lang, 'expired')}
            </span>
          )}
          {!expired && expiringSoon && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500 text-white shadow-sm">
              <CalendarClock className="w-3 h-3" />
              {t(lang, 'expiringSoon')}
            </span>
          )}
        </div>

        {/* Quantity badge */}
        <div className="absolute top-2 right-2 bg-slate-900/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-sm font-bold min-w-[2.5rem] text-center">
          {item.quantity}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-2 line-clamp-2">{item.name}</h3>

        <div className="space-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{item.category}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          {item.brand && (
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{item.brand}</span>
            </div>
          )}
        </div>

        {expStatus.label && (
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              expired ? 'text-red-600' : 'text-amber-600'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {expStatus.label}
          </div>
        )}

        {lowStock && !expired && (
          <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-600">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t(lang, 'lowStock')}: {item.lowStockThreshold ?? 0}
          </div>
        )}

        {/* Custom fields preview */}
        {item.customFields && Object.keys(item.customFields).length > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1">
            {Object.entries(item.customFields).slice(0, 3).map(([k, v]) => (
              <span key={k} className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                {k}: {String(v)}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600 text-xs font-medium transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            {t(lang, 'editItem')}
          </button>
          <button
            onClick={() => {
              if (confirm(t(lang, 'confirmDelete'))) onDelete(item.id);
            }}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 text-xs font-medium transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
