'use client';

import { useEffect } from 'react';

// Registers the service worker, asks the logged-in technician for
// notification permission ONCE (no nagging on later loads), then creates
// a Web Push subscription and syncs it to the server keyed by endpoint.
// Works on Android Chrome and installed iOS PWAs via the standard
// Web Push + VAPID flow. Rendered on the dashboard (post-login) with the
// logged-in technician's id.

const ASKED_FLAG = 'shs_push_asked';

// VAPID public key is exposed to the browser. Next.js only inlines env
// vars prefixed with NEXT_PUBLIC_ into the client bundle, so this is the
// correct name for this (Next.js, not Vite) app.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function subscribeAndSync(technicianId: string) {
    if (!VAPID_PUBLIC_KEY) {
        console.warn('[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set; skipping subscribe.');
        return;
    }

    const registration = await navigator.serviceWorker.ready;

    // Reuse the existing subscription if present; otherwise create one.
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
    }

    // Store/replace on the server, keyed by endpoint (upsert).
    await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId, subscription }),
    });
}

export function PushNotifications({ technicianId }: { technicianId: string }) {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
            return; // Browser doesn't support web push.
        }

        let cancelled = false;

        // Asks for permission once, then subscribes. iOS PWAs require
        // requestPermission() to run inside a user gesture, so this is wired
        // to a one-time tap listener rather than fired on mount.
        const askOnce = async () => {
            if (cancelled) return;
            if (localStorage.getItem(ASKED_FLAG)) return;
            localStorage.setItem(ASKED_FLAG, '1');
            try {
                const result = await Notification.requestPermission();
                if (!cancelled && result === 'granted') {
                    await subscribeAndSync(technicianId);
                }
            } catch (err) {
                console.warn('[push] permission request failed:', err);
            }
        };

        const onFirstGesture = () => {
            window.removeEventListener('pointerdown', onFirstGesture);
            askOnce();
        };

        (async () => {
            try {
                // Always register the SW on load.
                await navigator.serviceWorker.register('/sw.js');
                if (cancelled) return;

                if (Notification.permission === 'granted') {
                    // Already allowed — keep the server subscription fresh (no gesture needed).
                    await subscribeAndSync(technicianId);
                    return;
                }

                if (Notification.permission === 'denied') {
                    return; // Respect the user's choice; don't nag.
                }

                // permission === 'default': ask exactly once, on the next tap.
                if (localStorage.getItem(ASKED_FLAG)) return;
                window.addEventListener('pointerdown', onFirstGesture, { once: true });
            } catch (err) {
                console.warn('[push] setup failed:', err);
            }
        })();

        return () => {
            cancelled = true;
            window.removeEventListener('pointerdown', onFirstGesture);
        };
    }, [technicianId]);

    return null;
}
