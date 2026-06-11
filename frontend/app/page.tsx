"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  useEffect(() => {
    // Check push notification support
    if ("serviceWorker" in navigator && "Notification" in window) {
      setNotificationSupported(true);
      setNotificationEnabled(Notification.permission === "granted");
    }

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("Service worker registration failed:", err);
      });
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Your browser does not support notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationEnabled(true);
      new Notification("Notifications Enabled! ✓", {
        body: "You will now receive cleaning reminders",
        icon: "/icon.png",
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            OPU Checklist
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Make cleaning easier with simple checklists
          </p>
        </div>

        {/* Notification Status */}
        {notificationSupported && (
          <div className="bg-white rounded-lg p-8 mb-8 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Notifications
              </h2>
              <div
                className={`text-lg font-semibold ${
                  notificationEnabled ? "text-green-600" : "text-orange-600"
                }`}
              >
                {notificationEnabled ? "✓ Enabled" : "⚠️ Disabled"}
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              {notificationEnabled
                ? "You will receive cleaning reminders even when you close the browser"
                : "Enable notifications to get cleaning reminders"}
            </p>
            {!notificationEnabled && (
              <button
                onClick={requestNotificationPermission}
                className="btn-primary w-full"
              >
                Enable Notifications
              </button>
            )}
            {notificationEnabled && (
              <div className="text-center">
                <p className="text-green-600 font-semibold text-lg">
                  ✓ Уведомления активны
                </p>
              </div>
            )}
          </div>
        )}

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Link href="/checklist">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer">
              <h3 className="text-3xl font-bold text-blue-600 mb-4">📋</h3>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                My Checklists
              </h2>
              <p className="text-gray-600">
                View and manage your cleaning checklists
              </p>
            </div>
          </Link>

          <Link href="/admin">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer">
              <h3 className="text-3xl font-bold text-purple-600 mb-4">⚙️</h3>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin</h2>
              <p className="text-gray-600">Manage users and send notifications</p>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            How it works:
          </h3>
          <ul className="space-y-3 text-lg text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-4">1.</span>
              <span>Create your cleaning checklist with tasks</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-4">2.</span>
              <span>Enable notifications to get reminders</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-4">3.</span>
              <span>Check off tasks as you complete them</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-4">4.</span>
              <span>Track your cleaning progress</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
