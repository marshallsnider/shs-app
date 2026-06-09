'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

// Web push opt-in for estimate follow-up reminders.
// Registers the service worker, then shows an explicit "Turn on reminders"
// button so the technician opts in with a clear tap. Calling
// Notification.requestPermission() directly inside the button's click
// handler satisfies the iOS PWA user-gesture requirement reliably (the old
// invisible "ask on first tap anywhere" approach was easy to miss/misfire).
// On grant we create the PushManager subscription and POST it to the server.
// Works on Android Chrome and installed iOS PWAs via standard Web Push + VAPID.

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

type Status = 'unsupported' | 'default' | 'granted' | 'denied' | 'working';

export function PushNotifications({ technicianId }: { technicianId: string }) {
    const [status, setStatus] = useState<Status>('default');

    // Register the SW on mount and reflect the current permission state.
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let cancelled = false;
        (async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
                if (!cancelled) setStatus('unsupported');
                return;
            }
            try {
                await navigator.serviceWorker.register('/sw.js');
                if (cancelled) return;

                if (Notification.permission === 'granted') {
                    setStatus('granted');
                    // Keep the server subscription fresh on each load.
                    await subscribeAndSync(technicianId);
                } else if (Notification.permission === 'denied') {
                    setStatus('denied');
                } else {
                    setStatus('default');
                }
            } catch (err) {
                console.warn('[push] setup failed:', err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [technicianId]);

    // Triggered by the button tap — a real user gesture, which iOS requires.
    const enable = async () => {
        try {
            setStatus('working');
            const result = await Notification.requestPermission();
            if (result === 'granted') {
                await subscribeAndSync(technicianId);
                setStatus('granted');
            } else {
                setStatus(result === 'denied' ? 'denied' : 'default');
            }
        } catch (err) {
            console.warn('[push] permission request failed:', err);
            setStatus('default');
        }
    };

    if (status === 'unsupported' || status === 'granted') {
        // Nothing to show: either unsupported, or already on.
        return null;
    }

    if (status === 'denied') {
        return (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                <BellOff className="h-4 w-4 shrink-0" />
                <span>Reminders are blocked. Turn notifications on for this app in your phone&apos;s Settings.</span>
            </div>
        );
    }

    return (
        <button
            onClick={enable}
            disabled={status === 'working'}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/15 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99] disabled:opacity-60"
        >
            {status === 'working' ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Turning on…
                </>
            ) : (
                <>
                    <Bell className="h-4 w-4" />
                    Turn on follow-up reminders
                </>
            )}
        </button>
    );
}
