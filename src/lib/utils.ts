import type { InventoryItem, Language, SortConfig } from './types';

export function generateId() {
  return crypto.randomUUID();
}

//export function generateId(): string {
//  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
//}

export function getDaysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpired(item: InventoryItem): boolean {
  const days = getDaysUntil(item.expirationDate);
  return days !== null && days < 0;
}

export function isExpiringSoon(item: InventoryItem): boolean {
  const days = getDaysUntil(item.expirationDate);
  return days !== null && days >= 0 && days <= 7;
}

export function isLowStock(item: InventoryItem): boolean {
  const threshold = item.lowStockThreshold ?? 0;
  return item.quantity <= threshold;
}

export function getStockStatus(item: InventoryItem, lang: Language): { label: string; color: string } {
  if (item.quantity === 0) {
    return { label: lang === 'en' ? 'Out of Stock' : '缺貨', color: 'red' };
  }
  if (isLowStock(item)) {
    return { label: lang === 'en' ? 'Low Stock' : '庫存不足', color: 'amber' };
  }
  return { label: lang === 'en' ? 'In Stock' : '庫存充足', color: 'green' };
}

export function getExpirationStatus(
  item: InventoryItem,
  lang: Language
): { label: string; color: string; days: number | null } {
  const days = getDaysUntil(item.expirationDate);
  if (days === null) return { label: '', color: '', days: null };
  if (days < 0) {
    return {
      label: lang === 'en' ? `Expired ${Math.abs(days)} days ago` : `已過期 ${Math.abs(days)} 天`,
      color: 'red',
      days,
    };
  }
  if (days <= 7) {
    return {
      label: lang === 'en' ? `${days} days left` : `剩餘 ${days} 天`,
      color: 'amber',
      days,
    };
  }
  return { label: '', color: '', days };
}

export function sortItems(items: InventoryItem[], config: SortConfig, lang: Language): InventoryItem[] {
  const sorted = [...items];
  const dir = config.direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    let cmp = 0;
    switch (config.field) {
      case 'name':
        cmp = a.name.localeCompare(b.name, lang === 'zh' ? 'zh-Hant' : 'en');
        break;
      case 'category':
        cmp = a.category.localeCompare(b.category, lang === 'zh' ? 'zh-Hant' : 'en');
        break;
      case 'location':
        cmp = a.location.localeCompare(b.location, lang === 'zh' ? 'zh-Hant' : 'en');
        break;
      case 'quantity':
        cmp = a.quantity - b.quantity;
        break;
      case 'expirationDate':
        cmp = (getDaysUntil(a.expirationDate) ?? Infinity) - (getDaysUntil(b.expirationDate) ?? Infinity);
        break;
      case 'updatedAt':
        cmp = a.updatedAt - b.updatedAt;
        break;
    }
    return cmp * dir;
  });

  return sorted;
}

export function searchItems(items: InventoryItem[], query: string): InventoryItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase().trim();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.brand?.toLowerCase().includes(q) ?? false) ||
      item.category.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q)
  );
}

export function filterItems(
  items: InventoryItem[],
  filters: { category: string; location: string; showLowStockOnly: boolean; showExpiringOnly: boolean }
): InventoryItem[] {
  return items.filter((item) => {
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.location && filters.location !== 'all' && item.location !== filters.location) return false;
    if (filters.showLowStockOnly && !isLowStock(item)) return false;
    if (filters.showExpiringOnly && !isExpiringSoon(item) && !isExpired(item)) return false;
    return true;
  });
}

export function toCSV(items: InventoryItem[]): string {
  const headers = [
    'Name',
    'Category',
    'Location',
    'Quantity',
    'Purchase Date',
    'Brand',
    'Image URL',
    'Expiration Date',
    'Low-Stock Threshold',
    'Custom Fields (JSON)',
    'Created At',
    'Updated At',
  ];

  const escapeCSV = (val: unknown): string => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map((item) =>
    [
      escapeCSV(item.name),
      escapeCSV(item.category),
      escapeCSV(item.location),
      escapeCSV(item.quantity),
      escapeCSV(item.purchaseDate || ''),
      escapeCSV(item.brand || ''),
      escapeCSV(item.imageUrl || ''),
      escapeCSV(item.expirationDate || ''),
      escapeCSV(item.lowStockThreshold ?? ''),
      escapeCSV(item.customFields ? JSON.stringify(item.customFields) : ''),
      escapeCSV(new Date(item.createdAt).toISOString()),
      escapeCSV(new Date(item.updatedAt).toISOString()),
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseVoiceInput(transcript: string, lang: Language): { name: string; quantity: number } | null {
  const text = transcript.trim();
  if (!text) return null;

  const qtyPatterns =
    lang === 'zh'
      ? [
          /數量\s*(\d+)/,
          /(\d+)\s*(個|件|箱|瓶|包|袋|盒|罐)/,
          /(\d+)\s*$/,
        ]
      : [
          /quantity\s*(\d+)/i,
          /(\d+)\s*(units?|items?|pcs?|pieces?|boxes?|bottles?|packs?|bags?)/i,
          /(\d+)\s*$/,
        ];

  let quantity = 1;
  let nameText = text;

  for (const pattern of qtyPatterns) {
    const match = text.match(pattern);
    if (match) {
      quantity = parseInt(match[1], 10);
      nameText = text.replace(match[0], '').trim();
      break;
    }
  }

  nameText = nameText.replace(/[，,.]+$/, '').trim();
  if (!nameText) return null;

  return { name: nameText, quantity };
}

export function formatDate(timestamp: number, lang: Language): string {
  const date = new Date(timestamp);
  const locale = lang === 'zh' ? 'zh-TW' : 'en-US';
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getRelativeTime(timestamp: number, lang: Language): string {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return lang === 'en' ? 'Today' : '今天';
  if (days === 1) return lang === 'en' ? 'Yesterday' : '昨天';
  if (days < 30) return lang === 'en' ? `${days} days ago` : `${days} 天前`;
  return formatDate(timestamp, lang);
}
