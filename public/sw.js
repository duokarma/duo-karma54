// Duo Karma Admin - Service Worker for Mobile & Desktop Push Notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push notifications
self.addEventListener("push", (event) => {
  let data = {
    title: "🔔 New Duo Karma Notification",
    body: "You have a new activity in your admin panel.",
    url: "/admin",
    icon: "/logo.jpeg",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/logo.jpeg",
    badge: "/favicon.svg",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/admin",
    },
    actions: [
      { action: "open", title: "View Booking" },
      { action: "close", title: "Dismiss" },
    ],
    tag: "duo-karma-booking",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle user clicking the notification on mobile or desktop
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const relativePath = event.notification.data?.url || "/admin";
  const absoluteUrl = new URL(relativePath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          if ("navigate" in client) {
            client.navigate(absoluteUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(absoluteUrl);
      }
    })
  );
});
