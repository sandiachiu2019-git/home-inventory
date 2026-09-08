import { Package, Layers, MapPin, AlertTriangle, CalendarX, TrendingDown } from 'lucide-react';
import type { InventoryItem, Language } from '@/lib/types';
import { t } from '@/lib/i18n';
import { isExpired, isExpiringSoon, isLowStock } from '@/lib/utils';

interface StatsBarProps {
  lang: Language;
  items: InventoryItem[];
}

export function StatsBar({ lang, items }: StatsBarProps) {
  const categories = new Set(items.map((i) => i.category));
  const locations = new Set(items.map((i) => i.location));
  const lowStockCount = items.filter((i) => isLowStock(i)).length;
  const expiredCount = items.filter((i) => isExpired(i)).length;

  const stats = [
    {
      icon: Package,
      label: t(lang, 'totalItems'),
      value: items.length,
      color: 'teal',
      bg: 'bg-teal-50',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      icon: Layers,
      label: t(lang, 'uniqueCategories'),
      value: categories.size,
      color: 'blue',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: MapPin,
      label: t(lang, 'uniqueLocations'),
      value: locations.size,
      color: 'cyan',
      bg: 'bg-cyan-50',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
    },
    {
      icon: TrendingDown,
      label: t(lang, 'lowStockItems'),
      value: lowStockCount,
      color: 'amber',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      icon: CalendarX,
      label: t(lang, 'expiredItems'),
      value: expiredCount,
      color: 'red',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-xl p-3.5 border border-slate-100 transition-all hover:shadow-md hover:shadow-slate-200/50`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-slate-800 leading-none">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1 truncate">{stat.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
