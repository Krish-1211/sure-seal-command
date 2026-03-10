import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface SureSealDB extends DBSchema {
    customers: { key: string; value: any; };
    products: { key: string; value: any; };
    pricing_levels: { key: string; value: any; };
    orders_offline: { key: string; value: any; };
    check_ins_offline: { key: string; value: any; };
    sync_metadata: { key: string; value: { id: string; last_sync: number }; };
}

let dbPromise: Promise<IDBPDatabase<SureSealDB>> | null = null;

export function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<SureSealDB>('sure_seal_sfa', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('customers')) db.createObjectStore('customers', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('products')) db.createObjectStore('products', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('pricing_levels')) db.createObjectStore('pricing_levels', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('orders_offline')) db.createObjectStore('orders_offline', { keyPath: 'offline_id' });
                if (!db.objectStoreNames.contains('check_ins_offline')) db.createObjectStore('check_ins_offline', { keyPath: 'offline_id' });
                if (!db.objectStoreNames.contains('sync_metadata')) db.createObjectStore('sync_metadata', { keyPath: 'id' });
            },
        });
    }
    return dbPromise;
}
