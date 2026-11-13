/**
 * Encrypted IndexedDB Storage Service
 * PRD §13.8 (Client-side data model)
 */

export type GiftState =
  | 'DRAFT'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMING'
  | 'READY'
  | 'CLAIMING'
  | 'CLAIMED'
  | 'TAKEN_BACK'
  | 'EXPIRED'
  | 'UNDERFUNDED';

export interface GiftRecord {
  id: string;
  version: number;
  state: GiftState;
  amountZat: number;
  claimFeeZat: number;
  receivedZat?: number;
  depositAddress: string;
  messagePlain?: string;
  messageEnc?: string;
  birthdayHeight: number;
  passcodeProtected: boolean;
  wrappedSecretHex?: string;
  fundTxid?: string;
  claimTxid?: string;
  refundTxid?: string;
  refundAddress?: string;
  confirmations: number;
  createdAt: number;
  remindAt?: number;
  secretHex: string;
  shareableLink?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fiat: 'NGN' | 'USD';
  customServer?: string;
  rememberedAddress?: string;
}

const DB_NAME = 'tip_db';
const DB_VERSION = 1;
const STORE_GIFTS = 'gifts';
const STORE_SETTINGS = 'settings';

export class StorageService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
        return reject(new Error('IndexedDB not available'));
      }

      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_GIFTS)) {
            const store = db.createObjectStore(STORE_GIFTS, { keyPath: 'id' });
            store.createIndex('state', 'state', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
            db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });

    return this.dbPromise;
  }

  static async saveGift(gift: GiftRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_GIFTS, 'readwrite');
      const store = tx.objectStore(STORE_GIFTS);
      const req = store.put(gift);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async getGift(id: string): Promise<GiftRecord | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_GIFTS, 'readonly');
      const store = tx.objectStore(STORE_GIFTS);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  static async getAllGifts(): Promise<GiftRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_GIFTS, 'readonly');
      const store = tx.objectStore(STORE_GIFTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result as GiftRecord[]) || [];
        // LATCH: organize by Time (newest first)
        list.sort((a, b) => b.createdAt - a.createdAt);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  }

  static async deleteGift(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_GIFTS, 'readwrite');
      const store = tx.objectStore(STORE_GIFTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async getSettings(): Promise<AppSettings> {
    const defaults: AppSettings = {
      theme: 'dark',
      language: 'en',
      fiat: 'NGN',
    };
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SETTINGS, 'readonly');
        const store = tx.objectStore(STORE_SETTINGS);
        const req = store.get('app_settings');
        req.onsuccess = () => {
          resolve(req.result ? { ...defaults, ...req.result.value } : defaults);
        };
        req.onerror = () => resolve(defaults);
      });
    } catch {
      return defaults;
    }
  }

  static async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SETTINGS, 'readwrite');
        const store = tx.objectStore(STORE_SETTINGS);
        const req = store.put({ key: 'app_settings', value: updated });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignore storage errors on restricted environments
    }
  }
}

