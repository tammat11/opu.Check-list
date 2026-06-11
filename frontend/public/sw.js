// Service Worker for Web Push Notifications

self.addEventListener("install", () => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("Push event received");

  const options = {
    body: event.data?.text() || "New notification",
    icon: "/icon.png",
    badge: "/badge.png",
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  const title = "OPU Checklist";
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked");
  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow("/");
      })
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SEND_NOTIFICATION") {
    const { title, body, icon } = event.data.payload;
    self.registration.showNotification(title || "OPU Checklist", {
      body,
      icon: icon || "/icon.png",
    });
  }
});
