"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppHero,
  CheckIcon,
  ClipboardIcon,
  PreviewNavbar,
  StatCard,
} from "../components/AppChrome";
import { API_BASE, canAccessWork, fetchCurrentUser, logout as logoutUser } from "../lib/auth";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export default function ChecklistPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    fetchCurrentUser()
      .then((currentUser) => {
        if (!currentUser) {
          router.push("/auth/login");
          return;
        }

        if (!canAccessWork(currentUser.role)) {
          router.push("/app/dashboard");
          return;
        }

        setAuthReady(true);
        router.push("/app/work");
      });
  }, [router]);

  useEffect(() => {
    if (!authReady) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetch(`${API_BASE}/checklists/personal`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          return logoutUser().then(() => {
            router.push("/auth/login");
            return null;
          });
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setItems(
          (data.items || []).map((item: { id: number; title: string; completed: boolean }) => ({
            id: String(item.id),
            title: item.title,
            completed: item.completed,
          }))
        );
      })
      .catch(() => {});
  }, [authReady, router]);

  const toggleItem = async (id: string) => {
    const token = localStorage.getItem("token");
    const target = items.find((item) => item.id === id);
    if (!token || !target) return;

    const nextCompleted = !target.completed;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: nextCompleted } : item
      )
    );

    await fetch(`${API_BASE}/checklists/personal/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed: nextCompleted }),
    });
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_BASE}/checklists/personal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newItem.trim() }),
    });
    const created = await res.json();

    setItems((prev) => [
      ...prev,
      { id: String(created.id), title: created.title, completed: created.completed },
    ]);
    setNewItem("");
  };

  const clearCompleted = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const completedIds = items.filter((item) => item.completed).map((item) => item.id);
    await Promise.all(
      completedIds.map((id) =>
        fetch(`${API_BASE}/checklists/personal/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
    setItems((prev) => prev.filter((item) => !item.completed));
  };

  const completedCount = items.filter((item) => item.completed).length;
  const progress = Math.round((completedCount / items.length) * 100) || 0;

  if (!authReady) {
    return (
      <main className="min-h-screen bg-[#f5f7f2] flex items-center justify-center">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-dark/35">Проверка доступа...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2]">
      <PreviewNavbar active="checklist" />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <AppHero
          eyebrow="Личный список"
          title="Чек-лист"
          subtitle="Точки контроля и быстрые отметки"
          sideLabel={`${completedCount}/${items.length}`}
        />

        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard label="Прогресс" value={`${progress}%`} sub="выполнено" />
          <StatCard label="Готово" value={`${completedCount}`} sub="пунктов" />
          <StatCard label="Осталось" value={`${items.length - completedCount}`} sub="в работе" />
        </div>

        <div className="mt-4 rounded-[28px] border border-black/5 bg-white p-5 shadow-premium">
          <div className="flex items-center gap-2 text-brand-green">
            <ClipboardIcon cls="w-4 h-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">
              Пункты смены
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex w-full items-center gap-4 rounded-[20px] border px-4 py-4 text-left transition ${
                  item.completed
                    ? "border-brand-green/20 bg-brand-green/8"
                    : "border-black/6 bg-[#fbfcf8] hover:border-brand-dark/15"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-[14px] border-2 transition ${
                    item.completed
                      ? "border-brand-green bg-brand-green text-white shadow-button"
                      : "border-brand-dark/15 bg-white text-brand-dark/25"
                  }`}
                >
                  {item.completed ? <CheckIcon cls="w-4 h-4" /> : null}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-base font-semibold transition ${
                      item.completed
                        ? "text-brand-dark/35 line-through"
                        : "text-brand-dark"
                    }`}
                  >
                    {item.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={addItem}
          className="mt-4 rounded-[28px] border border-black/5 bg-white p-5 shadow-premium"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">
            Добавить пункт
          </p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Добавить новую задачу..."
              className="min-h-[52px] flex-1 rounded-[18px] border border-black/8 bg-[#fbfcf8] px-4 text-base outline-none transition focus:border-brand-green"
            />
            <button
              type="submit"
              className="min-h-[52px] rounded-[18px] bg-brand-dark px-6 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-brand-green hover:text-brand-dark"
            >
              Добавить
            </button>
          </div>
        </form>

        {completedCount > 0 ? (
          <button
            onClick={clearCompleted}
            className="mt-4 min-h-[52px] w-full rounded-[22px] border border-black/8 bg-white text-sm font-black uppercase tracking-[0.16em] text-brand-dark shadow-premium transition hover:border-brand-dark"
          >
            Очистить выполненные
          </button>
        ) : null}
      </div>
    </main>
  );
}
