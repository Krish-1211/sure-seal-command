import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = Boolean(firebaseConfig.projectId);

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Initialize conditionally to avoid errors in environments without browser APIs
export const messaging = app && typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestFirebaseToken = async () => {
    if (!messaging) return null;

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const swUrl = `/firebase-messaging-sw.js?apiKey=${firebaseConfig.apiKey}&projectId=${firebaseConfig.projectId}&messagingSenderId=${firebaseConfig.messagingSenderId}&appId=${firebaseConfig.appId}`;
            const registration = await navigator.serviceWorker.register(swUrl);

            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration
            });
            return token;
        }
    } catch (error) {
        console.error("Firebase token error", error);
    }
    return null;
};

import { onMessage } from 'firebase/messaging';
import { toast } from 'sonner';

export const onForegroundMessage = () => {
    if (!messaging) return;

    return onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        if (payload.notification) {
            toast.message(payload.notification.title, {
                description: payload.notification.body,
                duration: 5000,
            });
        }
    });
};
