"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
  completed_at?: string;
}

interface Checklist {
  id: number;
  template_name: string;
  description: string;
  object_name: string;
  address: string;
  items: ChecklistItem[];
  progress: number;
  completed_count: number;
  total_count: number;
}

export default function WorkPage() {
  const router = useRouter();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(
    null
  );
  const [locationEnabled, setLocationEnabled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    loadChecklists();
    requestLocationPermission();
  }, [router]);

  const loadChecklists = async () => {
    try {
      // In production, get actual user ID from token
      const res = await axios.get(`${API_BASE}/checklists/active?userId=1`);
      setChecklists(res.data.checklists);
    } catch (error) {
      console.error("Load checklists error:", error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationEnabled(true);
          // Start periodic updates
          startLocationTracking();
        },
        () => {
          console.log("Location permission denied");
        }
      );
    }
  };

  const startLocationTracking = () => {
    if ("geolocation" in navigator) {
      setInterval(() => {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude, accuracy } = position.coords;
          // Send to backend (implement in production)
          console.log("Location:", latitude, longitude, accuracy);
        });
      }, 60000); // Every minute
    }
  };

  const toggleItem = async (checklistId: number, itemId: number, completed: boolean) => {
    try {
      await axios.post(
        `${API_BASE}/checklists/${checklistId}/items/${itemId}`,
        { completed: !completed }
      );

      // Update local state
      setChecklists((prev) =>
        prev.map((cl) => {
          if (cl.id === checklistId) {
            const updatedItems = cl.items.map((item) =>
              item.id === itemId ? { ...item, completed: !completed } : item
            );
            const newCompleted = updatedItems.filter((i) => i.completed).length;
            return {
              ...cl,
              items: updatedItems,
              progress: Math.round((newCompleted / updatedItems.length) * 100),
              completed_count: newCompleted,
            };
          }
          return cl;
        })
      );
    } catch (error) {
      console.error("Update item error:", error);
    }
  };

  const completeChecklist = async (checklistId: number) => {
    try {
      await axios.post(`${API_BASE}/checklists/${checklistId}/complete`);

      // Remove from list
      setChecklists((prev) => prev.filter((cl) => cl.id !== checklistId));
      setSelectedChecklistId(null);

      // Show success message
      alert("✓ Чек-лист завершен!");
    } catch (error) {
      console.error("Complete checklist error:", error);
      alert("Ошибка при завершении чек-листа");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Загрузка...</p>
      </main>
    );
  }

  const selectedChecklist = checklists.find((cl) => cl.id === selectedChecklistId);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Мои задания по уборке
          </h1>
          <div className="flex items-center gap-4">
            {locationEnabled && (
              <div className="flex items-center text-green-600">
                <span className="text-2xl mr-2">📍</span>
                <span className="text-sm font-semibold">Локация включена</span>
              </div>
            )}
            <Link href="/dashboard">
              <button className="btn-secondary">← Главная</button>
            </Link>
          </div>
        </div>

        {/* No checklists message */}
        {checklists.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Все задания выполнены!
            </h2>
            <p className="text-lg text-gray-600">
              Отличная работа! Новые задания появятся здесь.
            </p>
          </div>
        )}

        {/* Checklists Grid */}
        {checklists.length > 0 && !selectedChecklistId && (
          <div className="grid md:grid-cols-2 gap-6">
            {checklists.map((checklist) => (
              <div
                key={checklist.id}
                onClick={() => setSelectedChecklistId(checklist.id)}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {checklist.template_name}
                    </h3>
                    <p className="text-blue-600 font-semibold">
                      {checklist.object_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {checklist.progress}%
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {checklist.address}
                </p>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${checklist.progress}%` }}
                  ></div>
                </div>

                <p className="text-gray-700 font-semibold">
                  {checklist.completed_count} из {checklist.total_count} готово
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Selected Checklist Detail */}
        {selectedChecklist && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedChecklistId(null)}
              className="btn-secondary mb-6"
            >
              ← Назад
            </button>

            <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedChecklist.template_name}
                </h2>
                <p className="text-xl text-blue-600 font-semibold mb-2">
                  📍 {selectedChecklist.object_name}
                </p>
                <p className="text-gray-600">{selectedChecklist.address}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <p className="text-lg font-semibold text-gray-900">Прогресс</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedChecklist.progress}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ width: `${selectedChecklist.progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  {selectedChecklist.completed_count} из{" "}
                  {selectedChecklist.total_count} задач завершено
                </p>
              </div>

              {/* Items Checklist */}
              <div className="space-y-4 mb-8">
                {selectedChecklist.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-6 flex items-center border border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        toggleItem(selectedChecklist.id, item.id, item.completed)
                      }
                      className="w-8 h-8 cursor-pointer accent-green-600"
                    />
                    <span
                      className={`ml-4 text-lg font-medium transition-all ${
                        item.completed
                          ? "line-through text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Complete Button */}
              {selectedChecklist.progress === 100 && (
                <button
                  onClick={() => completeChecklist(selectedChecklist.id)}
                  className="btn-primary w-full text-lg py-4"
                >
                  ✓ Завершить уборку
                </button>
              )}

              {selectedChecklist.progress < 100 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    Заполните все задачи, чтобы завершить чек-лист
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
