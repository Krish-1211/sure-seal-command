import { getDB } from './db';
import { apiFetch } from './apiFetch';

export async function syncMasterData() {
    if (!navigator.onLine) return;

    try {
        const [customersRes, productsRes, pricingRes] = await Promise.all([
            apiFetch('/api/customers?limit=1000'), // Get all for sync
            apiFetch('/api/products'), // Products is not paginated on server currently, but let's be safe
            apiFetch('/api/pricing-levels')
        ]);

        if (customersRes.ok && productsRes.ok && pricingRes.ok) {
            const customersData = await customersRes.json();
            const productsData = await productsRes.json();
            const pricing = await pricingRes.json();

            // Handle both array and paginated object formats
            const customers = Array.isArray(customersData) ? customersData : (customersData.data || []);
            const products = Array.isArray(productsData) ? productsData : (productsData.data || []);

            const db = await getDB();

            const txC = db.transaction('customers', 'readwrite');
            await txC.objectStore('customers').clear();
            customers.forEach((c: any) => txC.store.put(c));
            await txC.done;

            const txP = db.transaction('products', 'readwrite');
            await txP.objectStore('products').clear();
            products.forEach((p: any) => txP.store.put(p));
            await txP.done;

            const txPl = db.transaction('pricing_levels', 'readwrite');
            await txPl.objectStore('pricing_levels').clear();
            pricing.forEach((pl: any) => txPl.store.put(pl));
            await txPl.done;

            await db.put('sync_metadata', { id: 'master', last_sync: Date.now() });
        }
    } catch (err) {
        console.error("Failed to sync master data:", err);
    }
}

export async function uploadOfflineData() {
    if (!navigator.onLine) return;

    try {
        const db = await getDB();

        // 1. Upload Check-ins
        const checkIns = await db.getAll('check_ins_offline');
        for (const checkIn of checkIns) {
            const formData = new FormData();
            formData.append('customerId', checkIn.customerId);
            formData.append('customerName', checkIn.customerName);
            if (checkIn.notes) formData.append('notes', checkIn.notes);
            if (checkIn.photoBlob) formData.append('photo', checkIn.photoBlob, 'photo.jpg');

            try {
                const res = await apiFetch('/api/check-ins', { method: 'POST', body: formData });
                if (res.ok) {
                    await db.delete('check_ins_offline', checkIn.offline_id);
                }
            } catch (err) {
                console.error('Failed to upload check-in', checkIn.offline_id, err);
            }
        }

        // 2. Upload Orders
        const orders = await db.getAll('orders_offline');
        for (const order of orders) {
            try {
                // Remove offline_id flag before sending
                const { offline_id, ...orderData } = order;
                const res = await apiFetch('/api/orders', {
                    method: 'POST',
                    body: JSON.stringify(orderData)
                });
                if (res.ok) {
                    await db.delete('orders_offline', offline_id);
                }
            } catch (err) {
                console.error('Failed to upload order', order.offline_id, err);
            }
        }
    } catch (err) {
        console.error("Failed during offline data upload:", err);
    }
}
