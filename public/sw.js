// SHS Technician Tracker — service worker for web push reminders.
// Receives `push` events (estimate follow-up reminders) and shows a
// notification even when the app is closed. Tapping it focuses/opens
// the app. Kept dependency-free so it can run in the SW scope.

self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch (e) {
        // Fall back to plain text if the payload isn't JSON.
        payload = { body: event.data ? event.data.text() : '' };
    }

    const title = payload.title || 'SHS';
    const options = {
        body: payload.body || 'Follow-up calls due.',
        icon: '/logo.png',
        badge: '/logo.png',
        // Coalesce repeated reminders so a tech doesn't stack duplicates.
        tag: payload.tag || 'shs-reminder',
        renotify: true,
        data: { url: payload.url || '/' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus an existing tab if one is open.
                for (const client of clientList) {
                    if ('focus' in client) {
                        client.navigate(targetUrl);
                        return client.focus();
                    }
                }
                // Otherwise open a new window.
                if (self.clients.openWindow) {
                    return self.clients.openWindow(targetUrl);
                }
            })
    );
});
