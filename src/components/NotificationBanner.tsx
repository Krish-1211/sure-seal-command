import React, { useState, useEffect } from 'react';
import { BellOff, X } from 'lucide-react';
import { requestFirebaseToken, isFirebaseConfigured } from '@/lib/firebase';
import { apiFetch } from '@/lib/apiFetch';
import { toast } from 'sonner';

export const NotificationBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if browser supports notifications and firebase is ready
        if (!('Notification' in window) || !isFirebaseConfigured) return;

        // Check if already dismissed in this session or granted
        const isDismissed = sessionStorage.getItem('notification_banner_dismissed');

        if (Notification.permission !== 'granted' && !isDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleTurnOn = async () => {
        try {
            const token = await requestFirebaseToken();
            if (token) {
                const res = await apiFetch('/api/fcm-token', {
                    method: 'POST',
                    body: JSON.stringify({ fcmToken: token })
                });

                if (res.ok) {
                    setIsVisible(false);
                    toast.success("Push notifications enabled!");
                }
            } else {
                toast.error("Process aborted. Please allow notifications if prompted.");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to enable notifications.");
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('notification_banner_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="bg-[#1a1c1e] text-white py-3 px-5 flex items-center justify-between text-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
                <BellOff className="h-4 w-4 text-gray-400" />
                <p className="font-body text-gray-300">
                    Push notifications are currently off.{" "}
                    <button
                        onClick={handleTurnOn}
                        className="text-blue-500 font-bold hover:underline ml-1"
                    >
                        Turn on
                    </button>
                </p>
            </div>
            <button
                onClick={handleDismiss}
                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4 text-gray-400" />
            </button>
        </div>
    );
};
