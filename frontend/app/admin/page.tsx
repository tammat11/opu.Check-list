"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [message, setMessage] = useState("");
  const [notificationSent, setNotificationSent] = useState(false);

  const sendNotification = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      // Get all service worker clients
      const registration = await navigator.serviceWorker.ready;
      const clients = await (navigator.serviceWorker as any).matchAll({
        type: "window",
      });

      // Send notification to all clients
      clients.forEach((client: any) => {
        client.postMessage({
          type: "SEND_NOTIFICATION",
          payload: {
            title: "Cleaning Reminder",
            body: message,
            icon: "/icon.png",
          },
        });
      });

      setNotificationSent(true);
      setMessage("");
      setTimeout(() => setNotificationSent(false), 3000);
    } catch (error) {
      console.error("Failed to send notification:", error);
      alert("Failed to send notification");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <Link href="/">
            <button className="btn-secondary">← Back</button>
          </Link>
        </div>

        {/* Send Notifications */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Send Notification
          </h2>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message..."
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 mb-6 resize-none"
            rows={4}
          />

          <button
            onClick={sendNotification}
            className="btn-primary w-full mb-4"
          >
            Send to All Users
          </button>

          {notificationSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
              ✓ Notification sent successfully
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Active Users
            </h3>
            <p className="text-4xl font-bold text-blue-600">127</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Notifications Sent
            </h3>
            <p className="text-4xl font-bold text-green-600">1,245</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Checklists Completed
            </h3>
            <p className="text-4xl font-bold text-purple-600">856</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Avg Completion Rate
            </h3>
            <p className="text-4xl font-bold text-orange-600">82%</p>
          </div>
        </div>
      </div>
    </main>
  );
}
