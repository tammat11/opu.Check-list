"use client";

import { useState } from "react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "1", title: "Vacuum floors", completed: false },
    { id: "2", title: "Dust surfaces", completed: false },
    { id: "3", title: "Clean kitchen", completed: false },
    { id: "4", title: "Tidy bedrooms", completed: false },
  ]);

  const [newItem, setNewItem] = useState("");

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      setItems([
        ...items,
        { id: Date.now().toString(), title: newItem, completed: false },
      ]);
      setNewItem("");
    }
  };

  const completedCount = items.filter((item) => item.completed).length;
  const progress = Math.round((completedCount / items.length) * 100) || 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Checklist</h1>
          <Link href="/">
            <button className="btn-secondary">← Back</button>
          </Link>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="text-lg font-semibold text-gray-900">Progress</p>
            <p className="text-2xl font-bold text-blue-600">{progress}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-600 mt-3">
            {completedCount} of {items.length} tasks completed
          </p>
        </div>

        {/* Checklist Items */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className="w-8 h-8 cursor-pointer accent-green-600"
              />
              <span
                className={`ml-4 text-xl font-medium transition-all ${
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

        {/* Add New Item */}
        <form onSubmit={addItem} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add a new cleaning task..."
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
            <button type="submit" className="btn-primary">
              Add
            </button>
          </div>
        </form>

        {/* Clear Completed */}
        {completedCount > 0 && (
          <button
            onClick={() => setItems(items.filter((item) => !item.completed))}
            className="btn-secondary w-full"
          >
            Clear Completed Tasks
          </button>
        )}
      </div>
    </main>
  );
}
