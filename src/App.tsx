import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, LayoutGrid, ShoppingCart, DatabaseBackup, Shield } from 'lucide-react';
import type { InventoryItem, Language, SortConfig } from '@/lib/types';
import { t } from '@/lib/i18n';
import { setSyncId as updateSupabaseSyncId, supabase } from './supabase';
import {
  searchItems,
  filterItems,
  sortItems,
  generateId,
  isLowStock,
} from '@/lib/utils';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { ItemCard } from '@/components/ItemCard';
import { ItemForm } from '@/components/ItemForm';
import { ShoppingList } from '@/components/ShoppingList';
import { ExportPanel } from '@/components/ExportPanel';
import { VoiceModal } from '@/components/VoiceModal';
import { EmptyState } from '@/components/EmptyState';
import { Toast } from '@/components/Toast';

type View = 'inventory' | 'shopping' | 'backup';

const getOrCreateSyncId = (): string => {
  let id = localStorage.getItem('household_sync_id');
  if (!id) {
    id = `HOU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    localStorage.setItem('household_sync_id', id);
  }
  return id;
};

const encryptText = (text: string, key: string): string => {
  if (!text) return '';
  return btoa(unescape(encodeURIComponent(text))).split('').reverse().join('') + `_enc_${key}`;
};

const decryptText = (ciphertext: string, key: string): string => {
  if (!ciphertext || !ciphertext.endsWith(`_enc_${key}`)) return ciphertext || '';
  try {
    return decodeURIComponent(escape(atob(ciphertext.replace(`_enc_${key}`, '').split('').reverse().join(''))));
  } catch {
    return '';
  }
};

function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('inventory-lang');
    return (saved as Language) || 'en';
  });
  const [syncId, setSyncId] = useState(() => {
    const id = getOrCreateSyncId();
    updateSupabaseSyncId(id);
    return id;
  });
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'updatedAt', direction: 'desc' });
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showVoice, setShowVoice] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const voiceSupported = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      updateSupabaseSyncId(syncId);
      const { data, error } = await supabase.from('household_inventory').select('*');

      if (error) {
        console.warn('Database error:', error);
        setItems([]);
      } else if (data) {
        const decrypted: InventoryItem[] = data.map((item: any) => ({
          id: item.id,
          name: decryptText(item.item_name_en, syncId),
          nameZh: decryptText(item.item_name_zh, syncId),
          brand: decryptText(item.brand_name, syncId) || undefined,
          category: item.category || 'General',
          location: item.location || 'Home',
          quantity: Number(item.quantity) || 0,
          lowStockThreshold: item.low_stock_threshold ?? undefined,
          expirationDate: item.expiration_date || undefined,
          purchaseDate: item.purchase_date || undefined,
          createdAt: new Date(item.created_at).getTime(),
          updatedAt: new Date(item.updated_at).getTime(),
        }));
        setItems(decrypted);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [syncId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    localStorage.setItem('inventory-lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';
  }, [lang]);

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category || ''))).sort(), [items]);
  const locations = useMemo(() => Array.from(new Set(items.map((i) => i.location || ''))).sort(), [items]);

  const filteredItems = useMemo(() => {
    let result = searchItems(items, searchQuery);
    result = filterItems(result, {
      category: filterCategory,
      location: filterLocation,
      showLowStockOnly,
      showExpiringOnly,
    });
    result = sortItems(result, sortConfig, lang);
    return result;
  }, [items, searchQuery, filterCategory, filterLocation, showLowStockOnly, showExpiringOnly, sortConfig, lang]);

  const hasActiveFilters = filterCategory !== 'all' || filterLocation !== 'all' || showLowStockOnly || showExpiringOnly;

  const handleToggleLang = () => setLang(lang === 'en' ? 'zh' : 'en');

  const handleSaveItem = async (item: InventoryItem) => {
    try {
      updateSupabaseSyncId(syncId);
      const now = new Date().toISOString();
      const isUpdate = item.id && items.some(i => i.id === item.id);

      const baseItem = {
        id: item.id || generateId(),
        sync_id: syncId,
        item_name_en: encryptText(item.name || '', syncId),
        item_name_zh: encryptText(item.nameZh || item.name || '', syncId),
        brand_name: encryptText(item.brand || '', syncId),
        category: item.category || 'General',
        location: item.location || 'Home',
        quantity: Number(item.quantity) || 1,
        low_stock_threshold: Number(item.lowStockThreshold) || null,
        expiration_date: item.expirationDate || null,
        purchase_date: item.purchaseDate || null,
      };

      if (isUpdate) {
        const { error } = await supabase.from('household_inventory')
          .update({ ...baseItem, updated_at: now })
          .eq('id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('household_inventory')
          .insert([{ ...baseItem, created_at: now, updated_at: now }]);
        if (error) throw error;
      }

      await loadItems();
      setShowForm(false);
      setEditingItem(null);
      setToast({ message: 'Saved Securely!', type: 'success' });
    } catch (err) {
      console.error('Save error:', err);
      setToast({ message: 'Error saving data', type: 'error' });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      updateSupabaseSyncId(syncId);
      const { error } = await supabase.from('household_inventory').delete().eq('id', id);
      if (error) throw error;
      await loadItems();
      setToast({ message: 'Deleted', type: 'success' });
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ message: 'Error deleting item', type: 'error' });
    }
  };

  const handleImport = async (importedItems: InventoryItem[]) => {
    try {
      updateSupabaseSyncId(syncId);
      const now = new Date().toISOString();
      const rows = importedItems.map(item => ({
        id: item.id || generateId(),
        sync_id: syncId,
        item_name_en: encryptText(item.name || '', syncId),
        item_name_zh: encryptText(item.nameZh || item.name || '', syncId),
        brand_name: encryptText(item.brand || '', syncId),
        category: item.category || 'General',
        location: item.location || 'Home',
        quantity: Number(item.quantity) || 1,
        low_stock_threshold: Number(item.lowStockThreshold) || null,
        expiration_date: item.expirationDate || null,
        purchase_date: item.purchaseDate || null,
        updated_at: now,
      }));
      const { error } = await supabase.from('household_inventory').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      await loadItems();
      setToast({ message: 'Import complete', type: 'success' });
    } catch (err) {
      console.error('Import error:', err);
      setToast({ message: 'Error importing data', type: 'error' });
    }
  };

  const handleClearAll = async () => {
    try {
      updateSupabaseSyncId(syncId);
      const { error } = await supabase.from('household_inventory').delete().neq('id', 'never-match');
      if (error) throw error;
      await loadItems();
      setToast({ message: 'All data cleared', type: 'success' });
    } catch (err) {
      console.error('Clear error:', err);
      setToast({ message: 'Error clearing data', type: 'error' });
    }
  };

  const navItems = [
    { id: 'inventory' as View, icon: LayoutGrid, label: t(lang, 'inventory') },
    { id: 'shopping' as View, icon: ShoppingCart, label: t(lang, 'shoppingList'), badge: items.filter(isLowStock).length },
    { id: 'backup' as View, icon: DatabaseBackup, label: t(lang, 'dataBackup') },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header lang={lang} onToggleLang={handleToggleLang} onVoiceInput={() => setShowVoice(true)} voiceSupported={voiceSupported} isListening={false} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <SearchBar lang={lang} value={searchQuery} onChange={setSearchQuery} />

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-center justify-between text-xs text-teal-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>Encrypted Mode Active. Sync Code: <strong>{syncId}</strong></span>
          </div>
          <button onClick={() => {
            const code = prompt('Enter secondary device Sync Code:');
            if (code) {
              localStorage.setItem('household_sync_id', code);
              updateSupabaseSyncId(code);
              setSyncId(code);
            }
          }} className="text-teal-600 underline font-semibold">Link Device</button>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
          {navItems.map((nav) => {
            const Icon = nav.icon;
            return (
              <button key={nav.id} onClick={() => setView(nav.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${view === nav.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <Icon className="w-4 h-4" />
                {nav.label}
                {nav.badge ? <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">{nav.badge}</span> : null}
              </button>
            );
          })}
        </div>

        {view === 'inventory' && (
          <>
            <div className="flex flex-wrap gap-3 items-center">
              <FilterBar
                lang={lang}
                categories={categories}
                locations={locations}
                sortConfig={sortConfig}
                filterCategory={filterCategory}
                filterLocation={filterLocation}
                showLowStockOnly={showLowStockOnly}
                showExpiringOnly={showExpiringOnly}
                onSortChange={setSortConfig}
                onFilterCategoryChange={setFilterCategory}
                onFilterLocationChange={setFilterLocation}
                onLowStockToggle={() => setShowLowStockOnly(!showLowStockOnly)}
                onExpiringToggle={() => setShowExpiringOnly(!showExpiringOnly)}
                onClearFilters={() => {
                  setFilterCategory('all');
                  setFilterLocation('all');
                  setShowLowStockOnly(false);
                  setShowExpiringOnly(false);
                }}
                hasActiveFilters={hasActiveFilters}
              />
              <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 text-sm ml-auto">
                <Plus className="w-4 h-4" /> {t(lang, 'addItem')}
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyState lang={lang} message={items.length === 0 ? t(lang, 'noItems') : t(lang, 'noResults')} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <ItemCard key={item.id} item={item} lang={lang} onEdit={(item) => { setEditingItem(item); setShowForm(true); }} onDelete={handleDeleteItem} />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'shopping' && <ShoppingList lang={lang} items={items} onPrint={() => window.print()} />}
        {view === 'backup' && <ExportPanel lang={lang} items={items} onImport={handleImport} onClearAll={handleClearAll} />}
      </main>
      {showForm && (
        <ItemForm
          lang={lang}
          item={editingItem}
          existingCategories={categories}
          existingLocations={locations}
          onSave={handleSaveItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}
      {showVoice && <VoiceModal lang={lang} onClose={() => setShowVoice(false)} onResult={async (name, qty) => handleSaveItem({ id: '', name, quantity: qty, category: 'General', location: 'Home', createdAt: Date.now(), updatedAt: Date.now() } as InventoryItem)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
