/**
 * Client-side stock adjustment history. The backend has no audit API yet;
 * entries are appended when admins save adjustments from Update Stock.
 */
export const STOCK_AUDIT_STORAGE_KEY = "baby-bliss-stock-audit-v1";

/** Fired on same-tab writes so `useSyncExternalStore` subscribers refresh. */
export const STOCK_AUDIT_CHANGE_EVENT = "baby-bliss-stock-audit-change";

export interface StockAuditEntry {
  id: string;
  at: string;
  productId: string;
  productName: string;
  variantId: string;
  sku: string;
  ageRange: string;
  ageLabel: string;
  add: number;
  remove: number;
  before: number;
  after: number;
  reason?: string;
  supplier?: string;
  invoice?: string;
  notes?: string;
  adminName?: string;
}

function readRaw(): StockAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STOCK_AUDIT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StockAuditEntry[]) : [];
  } catch {
    return [];
  }
}

export function getStockAuditLog(): StockAuditEntry[] {
  return readRaw().sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function appendStockAuditEntries(entries: Omit<StockAuditEntry, "id" | "at">[]) {
  if (typeof window === "undefined" || entries.length === 0) return;
  const prev = readRaw();
  const now = new Date().toISOString();
  const next: StockAuditEntry[] = [
    ...entries.map((e) => ({
      ...e,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      at: now,
    })),
    ...prev,
  ].slice(0, 500);
  localStorage.setItem(STOCK_AUDIT_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STOCK_AUDIT_CHANGE_EVENT));
}
