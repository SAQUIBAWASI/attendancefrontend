/* eslint-disable no-restricted-globals */

self.addEventListener("push", (event) => {
    let data = { title: "New Notification", body: "You have a new update!" };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: "New Notification", body: event.data.text() };
        }
    }

    const options = {
        body: data.body,
        icon: "/logo192.png", // Path to your logo
        badge: "/logo192.png",
        vibrate: [100, 50, 100],
        data: {
            url: data.url || "/"
        },
        actions: [
            { action: "open", title: "View Details" },
            { action: "close", title: "Dismiss" }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "close") return;

    const urlToOpen = event.notification.data.url || "/";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window open and focus it
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url === urlToOpen && "focus" in client) {
                    return client.focus();
                }
            }
            // If no window is open, open a new one
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
