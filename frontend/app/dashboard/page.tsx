"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // In production, verify token with backend
    setUser({
      name: "Aibek",
      role: "cleaner",
      id: 1,
    });
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Загрузка...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Добро пожаловать, {user?.name}!
            </h1>
            <p className="text-gray-600 text-lg">Роль: {user?.role}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="btn-secondary"
          >
            Выход
          </button>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Link href="/checklist">
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer">
              <h3 className="text-3xl font-bold text-blue-600 mb-4">📋</h3>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Мои чек-листы
              </h2>
              <p className="text-gray-600">Смотреть и выполнять чек-листы</p>
            </div>
          </Link>

          {(user?.role === "curator" || user?.role === "partner") && (
            <Link href="/admin">
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer">
                <h3 className="text-3xl font-bold text-purple-600 mb-4">⚙️</h3>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Админ-панель
                </h2>
                <p className="text-gray-600">
                  Управлять пользователями и отправлять уведомления
                </p>
              </div>
            </Link>
          )}
        </div>

        {/* Browser Status */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Статус браузера
          </h3>
          <div className="flex items-center">
            <div className="text-4xl mr-4">✓</div>
            <div>
              <p className="text-lg font-semibold text-green-600">
                Браузер запомнен
              </p>
              <p className="text-gray-600">
                В следующий раз вы сможете войти быстрее
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
