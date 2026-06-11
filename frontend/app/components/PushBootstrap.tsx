"use client";

import { useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function syncPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");

  if (Notification.permission !== "granted" || !VAPID_PUBLIC_KEY) {
    return;
  }

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  await fetch(`${API_BASE}/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: Number(localStorage.getItem("opu-user-id") || "1"),
      subscription,
    }),
  });
}

export default function PushBootstrap() {
  useEffect(() => {
    const sync = () => {
      void syncPushSubscription().catch((error) => {
        console.error("Push subscription sync failed:", error);
      });
    };

    sync();
    window.addEventListener("opu-push-sync", sync);

    return () => {
      window.removeEventListener("opu-push-sync", sync);
    };
  }, []);

  return null;
}
