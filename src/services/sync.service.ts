import { getDB, SyncQueueItem } from '@/lib/db';
import { apiFetch } from '@/lib/apiFetch';

export class SyncService {
    private static isProcessing = false;
    private static MAX_ATTEMPTS = 5;
    private static LOCK_ID = 'sync_queue_lock';

    /**
     * Call this on app start! 
     * Recovers items that were left in 'syncing' state (e.g., app crashed mid-sync).
     */
    static async initialize() {
        const db = await getDB();
        const syncingItems = await db.getAllFromIndex('sync_queue', 'by-status', 'syncing');
        
        if (syncingItems.length > 0) {
            console.log(`Recovered ${syncingItems.length} zombie sync items.`);
            for (const item of syncingItems) {
                item.status = 'pending';
                await db.put('sync_queue', item);
            }
        }

        // Start initial sync
        this.processQueue();
    }

    /**
     * Adds an action to the queue with priority.
     */
    static async addToQueue(type: SyncQueueItem['type'], payload: any, priority: number = 5) {
        const db = await getDB();
        const id = crypto.randomUUID();
        
        await db.add('sync_queue', {
            id,
            type,
            payload,
            status: 'pending',
            attempts: 0,
            priority, // Lower = higher priority (0-10)
            timestamp: Date.now()
        });

        this.processQueue();
        return id;
    }

    /**
     * The heart of the sync system.
     * Uses Web Locks API to ensure absolute cross-tab exclusivity.
     */
    static async processQueue() {
        if (!navigator.onLine || this.isProcessing) return;

        // Use Web Locks API if supported (modern browsers)
        if (navigator.locks) {
            return navigator.locks.request(this.LOCK_ID, { ifAvailable: true }, async (lock) => {
                if (!lock) return; // Another tab has the lock
                await this.runQueueInternal();
            });
        }
        
        // Fallback for older environments
        if (this.isProcessing) return;
        this.isProcessing = true;
        try {
            await this.runQueueInternal();
        } finally {
            this.isProcessing = false;
        }
    }

    private static async runQueueInternal() {
        const db = await getDB();
        
        // 1. Fetch pending
        const pending = await db.getAllFromIndex('sync_queue', 'by-status', 'pending');
        
        // 2. Priority + Chronological sorting
        pending.sort((a, b) => {
            if (a.priority !== b.priority) return (a.priority || 5) - (b.priority || 5);
            return a.timestamp - b.timestamp;
        });

        for (const item of pending) {
            if (!navigator.onLine) break;

            if (item.attempts >= this.MAX_ATTEMPTS) {
                item.status = 'failed';
                await db.put('sync_queue', item);
                continue;
            }

            // 3. Mark for syncing
            item.status = 'syncing';
            await db.put('sync_queue', item);

            try {
                // Exponential Backoff
                if (item.attempts > 0) {
                    const delay = Math.min(1000 * Math.pow(2, item.attempts), 30000);
                    await new Promise(r => setTimeout(r, delay));
                }

                const result = await this.executeAction(item);
                if (result.success) {
                    await db.delete('sync_queue', item.id);
                } else {
                    throw new Error(result.error);
                }
            } catch (err: any) {
                item.status = 'pending';
                item.attempts += 1;
                item.lastError = err.message || 'Unknown network error';
                await db.put('sync_queue', item);
                
                // If network failure, stop queue
                if (err.name === 'TypeError') break;
            }
        }
    }

    private static async executeAction(item: SyncQueueItem): Promise<{ success: boolean; error?: string }> {
        const endpoints: Record<string, string> = {
            'CREATE_ORDER': '/api/orders',
            'CHECK_IN': '/api/check-ins',
            'UPDATE_CUSTOMER': '/api/customers',
            'LOCATION_HEARTBEAT': '/api/location'
        };

        try {
            let body: any = item.payload;
            let headers: Record<string, string> = { 'Content-Type': 'application/json' };

            // 📸 Handle Multipart for Check-ins (Step 5)
            if (item.type === 'CHECK_IN') {
                const formData = new FormData();
                formData.append('customerId', item.payload.customerId || '');
                formData.append('customerName', item.payload.customerName);
                if (item.payload.notes) formData.append('notes', item.payload.notes);
                if (item.payload.photoBlob) {
                    formData.append('photo', item.payload.photoBlob, 'photo.jpg');
                }
                
                body = formData;
                headers = {}; // Browser sets boundary
            } else {
                body = JSON.stringify(item.payload);
            }
            
            const res = await apiFetch(endpoints[item.type], {
                method: item.type.startsWith('UPDATE') ? 'PUT' : 'POST',
                headers,
                body
            });

            if (res.ok) return { success: true };
            
            let errorDetail = "";
            try {
                const errorJson = await res.json();
                errorDetail = errorJson.message || errorJson.error || JSON.stringify(errorJson);
            } catch {
                errorDetail = await res.text();
            }
            
            return { success: false, error: errorDetail || `Server returned ${res.status}` };
        } catch (err: any) {
            throw err;
        }
    }

    static async getPendingCount() {
        const db = await getDB();
        return await db.countFromIndex('sync_queue', 'by-status', 'pending');
    }

    static async getFailedCount() {
        const db = await getDB();
        return await db.countFromIndex('sync_queue', 'by-status', 'failed');
    }
}
