import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface SyncQueueItem {
    id: string;
    type: 'CREATE_ORDER' | 'CHECK_IN' | 'UPDATE_CUSTOMER' | 'LOCATION_HEARTBEAT';
    payload: any;
    status: 'pending' | 'syncing' | 'failed';
    attempts: number;
    priority: number; // 0 = high, 10 = low
    lastError?: string;
    timestamp: number;
}

export interface SureSealDB extends DBSchema {
    customers: { key: string; value: any; };
    products: { key: string; value: any; };
    pricing_levels: { key: string; value: any; };
    orders_offline: { key: string; value: any; };
    check_ins_offline: { key: string; value: any; };
    sync_metadata: { key: string; value: { id: string; last_sync: number }; };
    sync_queue: {
        key: string;
        value: SyncQueueItem;
        indexes: { 'by-status': string };
    };
}

let dbPromise: Promise<IDBPDatabase<SureSealDB>> | null = null;

export function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<SureSealDB>('sure_seal_sfa', 3, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    db.createObjectStore('customers', { keyPath: 'id' });
                    db.createObjectStore('products', { keyPath: 'id' });
                    db.createObjectStore('pricing_levels', { keyPath: 'id' });
                    db.createObjectStore('orders_offline', { keyPath: 'offline_id' });
                    db.createObjectStore('check_ins_offline', { keyPath: 'offline_id' });
                    db.createObjectStore('sync_metadata', { keyPath: 'id' });
                }
                
                if (oldVersion < 2) {
                    if (!db.objectStoreNames.contains('sync_queue')) {
                        const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
                        store.createIndex('by-status', 'status');
                    }
                }
                
                if (oldVersion < 3) {
                    // Update existing items from version 2 to version 3 if necessary
                    // In version 3 we added 'priority'
                }
            },
        });
    }
    return dbPromise;
}
