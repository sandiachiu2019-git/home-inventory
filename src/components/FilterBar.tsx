import { SlidersHorizontal, X } from 'lucide-react';
import type { Language, SortConfig, SortField } from '@/lib/types';
import { t } from '@/lib/i18n';

interface FilterBarProps {
  lang: Language;
  categories: string[];
  locations: string[];
  sortConfig: SortConfig;
  filterCategory: string;
  filterLocation: string;
  showLowStockOnly: boolean;
  showExpiringOnly: boolean;
  onSortChange: (config: SortConfig) => void;
  onFilterCategoryChange: (value: string) => void;
  onFilterLocationChange: (value: string) => void;
  onLowStockToggle: () => void;
  onExpiringToggle: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterBar({
  lang,
  categories,
  locations,
  sortConfig,
  filterCategory,
  filterLocation,
  showLowStockOnly,
  showExpiringOnly,
  onSortChange,
  onFilterCategoryChange,
  onFilterLocationChange,
  onLowStockToggle,
  onExpiringToggle,
  onClearFilters,
  hasActiveFilters,
}: FilterBarProps) {
  const sortFields: { value: SortField; label: string }[] = [
    { value: 'name', label: t(lang, 'name') },
    { value: 'category', label: t(lang, 'category') },
    { value: 'location', label: t(lang, 'location') },
    { value: 'quantity', label: t(lang, 'quantity') },
    { value: 'expirationDate', label: t(lang, 'expirationDateLabel') },
    { value: 'updatedAt', label: t(lang, 'lastUpdated') },
  ];

  const selectClass =
    'px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all cursor-pointer';

  const toggleClass = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
      active
        ? 'bg-teal-600 text-white border-teal-600'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
        <SlidersHorizontal className="w-4 h-4" />
        {t(lang, 'filterBy')}:
      </div>

      <select
        value={filterCategory}
        onChange={(e) => onFilterCategoryChange(e.target.value)}
        className={selectClass}
      >
        <option value="all">{t(lang, 'allCategories')}</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filterLocation}
        onChange={(e) => onFilterLocationChange(e.target.value)}
        className={selectClass}
      >
        <option value="all">{t(lang, 'allLocations')}</option>
        {locations.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      <button onClick={onLowStockToggle} className={toggleClass(showLowStockOnly)}>
        {t(lang, 'showLowStockOnly')}
      </button>

      <button onClick={onExpiringToggle} className={toggleClass(showExpiringOnly)}>
        {t(lang, 'showExpiringOnly')}
      </button>

      <div className="h-5 w-px bg-slate-200 mx-1" />

      <select
        value={sortConfig.field}
        onChange={(e) => onSortChange({ ...sortConfig, field: e.target.value as SortField })}
        className={selectClass}
      >
        {sortFields.map((f) => (
          <option key={f.value} value={f.value}>
            {t(lang, 'sortBy')}: {f.label}
          </option>
        ))}
      </select>

      <button
        onClick={() =>
          onSortChange({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })
        }
        className={selectClass}
      >
        {sortConfig.direction === 'asc' ? t(lang, 'ascending') : t(lang, 'descending')}
      </button>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <X className="w-4 h-4" />
          {t(lang, 'clearFilters')}
        </button>
      )}
    </div>
  );
}
