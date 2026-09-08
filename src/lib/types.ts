export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  purchaseDate?: string;
  brand?: string;
  imageUrl?: string;
  expirationDate?: string;
  lowStockThreshold?: number;
  customFields?: Record<string, string | number | boolean>;
  createdAt: number;
  updatedAt: number;
}

export type SortField = 'name' | 'category' | 'location' | 'quantity' | 'expirationDate' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  category: string;
  location: string;
  showLowStockOnly: boolean;
  showExpiringOnly: boolean;
}

export type Language = 'en' | 'zh';
