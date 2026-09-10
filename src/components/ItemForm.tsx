import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Plus, Trash2, Package } from 'lucide-react';
import type { InventoryItem, Language } from '@/lib/types';
import { t } from '@/lib/i18n';
import { generateId } from '@/lib/utils';
import { translate } from '@/lib/translate'; // Import your new translator utility

interface ItemFormProps {
  lang: Language;
  item: InventoryItem | null;
  existingCategories: string[];
  existingLocations: string[];
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}

export function ItemForm({ lang, item, existingCategories, existingLocations, onSave, onClose }: ItemFormProps) {
  // 1. Decoupled name states matching your schema columns
  const [nameEn, setNameEn] = useState(item?.item_name_en ?? '');
  const [nameZh, setNameZh] = useState(item?.item_name_zh ?? '');
  
  const [category, setCategory] = useState(item?.category ?? '');
  const [location, setLocation] = useState(item?.location ?? '');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() ?? '1');
  const [purchaseDate, setPurchaseDate] = useState(item?.purchaseDate ?? '');
  const [brand, setBrand] = useState(item?.brand ?? '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? '');
  const [expirationDate, setExpirationDate] = useState(item?.expirationDate ?? '');
  const [lowStockThreshold, setLowStockThreshold] = useState(item?.lowStockThreshold?.toString() ?? '');
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>(
    item?.customFields
      ? Object.entries(item.customFields).map(([k, v]) => ({ key: k, value: String(v) }))
      : []
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Track state-specific validation blocks
  const [errors, setErrors] = useState<{ nameEn?: boolean; nameZh?: boolean; category?: boolean; location?: boolean; quantity?: boolean }>({});

  // 2. Track whether the form is running a fresh creation action
  const isCreateMode = !item;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // 3. Dynamic Realtime Translators with "Create-Only" guard rails
  const handleEnglishChange = async (value: string) => {
    setNameEn(value);
    if (errors.nameEn) setErrors((prev) => ({ ...prev, nameEn: false }));

    if (isCreateMode && value.trim()) {
      const translated = await translate(value, 'en');
      if (translated) setNameZh(translated);
    }
  };

  const handleChineseChange = async (value: string) => {
    setNameZh(value);
    if (errors.nameZh) setErrors((prev) => ({ ...prev, nameZh: false }));

    if (isCreateMode && value.trim()) {
      const translated = await translate(value, 'zh');
      if (translated) setNameEn(translated);
    }
  };

  const handleSave = () => {
    const newErrors: typeof errors = {};
    if (!nameEn.trim()) newErrors.nameEn = true;
    if (!nameZh.trim()) newErrors.nameZh = true;
    if (!category.trim()) newErrors.category = true;
    if (!location.trim()) newErrors.location = true;
    if (!quantity.trim() || isNaN(Number(quantity))) newErrors.quantity = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const customFieldsObj: Record<string, string | number | boolean> = {};
    for (const cf of customFields) {
      if (cf.key.trim()) {
        customFieldsObj[cf.key.trim()] = cf.value;
      }
    }

    const now = Date.now();
    const savedItem: any = {
      id: item?.id ?? generateId(),
      // Ensure exact keys are assigned to pass securely to the Supabase layer
      item_name_en: nameEn.trim(),
      item_name_zh: nameZh.trim(),
      category: category.trim(),
      location: location.trim(),
      quantity: parseInt(quantity, 10) || 0,
      purchaseDate: purchaseDate || undefined,
      brand: brand.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      expirationDate: expirationDate || undefined,
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold, 10) : undefined,
      customFields: Object.keys(customFieldsObj).length > 0 ? customFieldsObj : undefined,
      createdAt: item?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(savedItem);
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all ${
      hasError ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-teal-400'
    }`;

  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-teal-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {item ? t(lang, 'editItem') : t(lang, 'addItem')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {t(lang, 'required')}
            </p>

            {/* 4. English Name Field Row */}
            <div>
              <label className={labelClass}>English Name *</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => handleEnglishChange(e.target.value)}
                className={inputClass(errors.nameEn)}
                placeholder="e.g. Apple"
                autoFocus
              />
            </div>

            {/* 5. Chinese Name Field Row */}
            <div>
              <label className={labelClass}>中文名稱 (Chinese Name) *</label>
              <input
                type="text"
                value={nameZh}
                onChange={(e) => handleChineseChange(e.target.value)}
                className={inputClass(errors.nameZh)}
                placeholder="例如：蘋果"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t(lang, 'category')} *</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.category) setErrors({ ...errors, category: false });
                  }}
                  className={inputClass(errors.category)}
                  placeholder={t(lang, 'enterNewCategory')}
                  list="category-list"
                />
                <datalist id="category-list">
                  {existingCategories?.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className={labelClass}>{t(lang, 'location')} *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) setErrors({ ...errors, location: false });
                  }}
                  className={inputClass(errors.location)}
                  placeholder={t(lang, 'enterNewLocation')}
                  list="location-list"
                />
                <datalist id="location-list">
                  {existingLocations?.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t(lang, 'quantity')} *</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  if (errors.quantity) setErrors({ ...errors, quantity: false });
                }}
                className={inputClass(errors.quantity)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Advanced attributes section remains entirely intact */}
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors w-full"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {t(lang, 'advancedAttributes')}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {t(lang, 'optional')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{t(lang, 'purchaseDate')}</label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className={inputClass()}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t(lang, 'brand')}</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className={inputClass()}
                      placeholder={t(lang, 'brand')}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t(lang, 'expirationDate')}</label>
                    <input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className={inputClass()}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>{t(lang, 'lowStockThreshold')}</label>
                    <input
                      type="number"
                      min="0"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      className={inputClass()}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>{t(lang, 'imageUrl')}</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className={inputClass()}
                    placeholder="https://..."
                  />
                </div>

                {/* Custom fields */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass}>{t(lang, 'customFields')}</label>
                    <button
                      onClick={() => setCustomFields([...customFields, { key: '', value: '' }])}
                      className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      {t(lang, 'addCustomField')}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{t(lang, 'customFieldHint')}</p>
                  {customFields.map((field, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => {
                          const updated = [...customFields];
                          updated[idx].key = e.target.value;
                          setCustomFields(updated);
                        }}
                        className={`${inputClass()} flex-1`}
                        placeholder={t(lang, 'fieldName')}
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const updated = [...customFields];
                          updated[idx].value = e.target.value;
                          setCustomFields(updated);
                        }}
                        className={`${inputClass()} flex-1`}
                        placeholder={t(lang, 'fieldValue')}
                      />
                      <button
                        onClick={() => setCustomFields(customFields.filter((_, i) => i !== idx))}
                        className="p-2.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-all"
          >
            {t(lang, 'cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 font-medium transition-all shadow-lg shadow-teal-600/20"
          >
            {item ? t(lang, 'update') : t(lang, 'add')}
          </button>
        </div>
      </div>
    </div>
  );
}
