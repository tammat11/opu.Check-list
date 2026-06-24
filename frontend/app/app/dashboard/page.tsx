"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, canAccessAdminPanel, fetchCurrentUser, logout as logoutUser } from "../../lib/auth";
import {
  AppHero,
  BellIcon,
  ChartIcon,
  CheckIcon,
  ClipboardIcon,
  PreviewNavbar,
  StatCard,
  UsersIcon,
} from "../../components/AppChrome";

const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });

const MAP_PINS = [
  { lat: 43.2550, lng: 76.9126, label: "ул. Абая 12",        color: "#7EC850" },
  { lat: 43.2415, lng: 76.9554, label: "пр. Достык 89",      color: "#FF6B6B" },
  { lat: 43.2680, lng: 76.8930, label: "ул. Толе би 55",     color: "#7EC850" },
  { lat: 43.2174, lng: 76.8690, label: "пр. Аль-Фараби 17",  color: "#F59E0B" },
  { lat: 43.2760, lng: 76.9310, label: "ул. Байзакова 280",  color: "#7EC850" },
];

// ─── Demo curator data ────────────────────────────────────────────────────────
const apiAssetUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE.replace(/\/api$/, "")}${url}`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type WorkerStatus = "done" | "ok" | "behind";
type ObjectStatus = "done" | "ok" | "behind";

interface WorkerTask {
  title: string;
  zone: string;
  done: boolean;
  photoUrl?: string | null;
  completedAt?: string | null;
}

const ZONES = ["Санузлы", "Зал / Офис", "Коридоры", "Кухня"];
const ZONE_COLORS_TASK: Record<string, string> = {
  "Санузлы":    "bg-blue-100 text-blue-700",
  "Зал / Офис": "bg-emerald-100 text-emerald-700",
  "Коридоры":   "bg-orange-100 text-orange-700",
  "Кухня":      "bg-violet-100 text-violet-700",
};

interface Worker {
  id: number;
  userId?: number;
  checklistId?: number;
  name: string;
  plan: number;
  fact: number;
  lastSeen: string;
  status: WorkerStatus;
  checklistStatus?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  photoUrls?: string[];
  location?: {
    lat: number;
    lng: number;
    accuracy?: number | null;
    createdAt?: string | null;
  } | null;
  tasks: WorkerTask[];
}

interface CuratorObject {
  id: number;
  name: string;
  district: string;
  plan: number;
  fact: number;
  status: ObjectStatus;
  lat: number;
  lng: number;
  workers: Worker[];
}

const CURATOR_OBJECTS: CuratorObject[] = [
  {
    id: 1, name: "ул. Абая 12", district: "Алмалинский р-н",
    plan: 6, fact: 6, status: "done", lat: 43.2550, lng: 76.9126,
    workers: [
      { id: 1, name: "Алия М.",   plan: 6, fact: 6, lastSeen: "10 мин назад", status: "done",
        tasks: [
          { title: "Помыть унитазы", zone: "Санузлы", done: true },
          { title: "Протереть раковины", zone: "Санузлы", done: true },
          { title: "Помыть полы", zone: "Санузлы", done: true },
          { title: "Заменить мыло", zone: "Санузлы", done: true },
          { title: "Протереть зеркала", zone: "Санузлы", done: true },
          { title: "Очистить корзины", zone: "Санузлы", done: true },
        ]},
      { id: 2, name: "Бекзат Н.", plan: 6, fact: 6, lastSeen: "5 мин назад", status: "done",
        tasks: [
          { title: "Помыть унитазы", zone: "Санузлы", done: true },
          { title: "Протереть раковины", zone: "Санузлы", done: true },
          { title: "Помыть полы", zone: "Санузлы", done: true },
          { title: "Заменить мыло", zone: "Санузлы", done: true },
          { title: "Протереть зеркала", zone: "Санузлы", done: true },
          { title: "Очистить корзины", zone: "Санузлы", done: true },
        ]},
    ],
  },
  {
    id: 2, name: "пр. Достык 89", district: "Медеуский р-н",
    plan: 5, fact: 2, status: "behind", lat: 43.2415, lng: 76.9554,
    workers: [
      { id: 3, name: "Гульнара С.", plan: 5, fact: 1, lastSeen: "38 мин назад", status: "behind",
        tasks: [
          { title: "Пропылесосить / подмести", zone: "Зал / Офис", done: true },
          { title: "Протереть столы и стулья", zone: "Зал / Офис", done: false },
          { title: "Вынести мусор", zone: "Зал / Офис", done: false },
          { title: "Протереть подоконники", zone: "Зал / Офис", done: false },
          { title: "Помыть полы", zone: "Зал / Офис", done: false },
        ]},
      { id: 4, name: "Дамир К.", plan: 5, fact: 4, lastSeen: "7 мин назад", status: "ok",
        tasks: [
          { title: "Пропылесосить / подмести", zone: "Зал / Офис", done: true },
          { title: "Протереть столы и стулья", zone: "Зал / Офис", done: true },
          { title: "Вынести мусор", zone: "Зал / Офис", done: true },
          { title: "Протереть подоконники", zone: "Зал / Офис", done: true },
          { title: "Помыть полы", zone: "Зал / Офис", done: false },
        ]},
      { id: 5, name: "Ерлан Т.", plan: 5, fact: 1, lastSeen: "51 мин назад", status: "behind",
        tasks: [
          { title: "Пропылесосить / подмести", zone: "Зал / Офис", done: true },
          { title: "Протереть столы и стулья", zone: "Зал / Офис", done: false },
          { title: "Вынести мусор", zone: "Зал / Офис", done: false },
          { title: "Протереть подоконники", zone: "Зал / Офис", done: false },
          { title: "Помыть полы", zone: "Зал / Офис", done: false },
        ]},
    ],
  },
  {
    id: 3, name: "ул. Толе би 55", district: "Бостандыкский р-н",
    plan: 8, fact: 6, status: "ok", lat: 43.2680, lng: 76.8930,
    workers: [
      { id: 6, name: "Жанар А.", plan: 8, fact: 6, lastSeen: "12 мин назад", status: "ok",
        tasks: [
          { title: "Подмести коридор", zone: "Коридоры", done: true },
          { title: "Протереть перила", zone: "Коридоры", done: true },
          { title: "Вымыть пол", zone: "Коридоры", done: true },
          { title: "Убрать обувь и вещи", zone: "Коридоры", done: true },
          { title: "Помыть раковину", zone: "Кухня", done: true },
          { title: "Протереть столешницы", zone: "Кухня", done: true },
          { title: "Вынести мусор", zone: "Кухня", done: false },
          { title: "Протереть микроволновку", zone: "Кухня", done: false },
        ]},
    ],
  },
  {
    id: 4, name: "пр. Аль-Фараби 17", district: "Бостандыкский р-н",
    plan: 8, fact: 4, status: "behind", lat: 43.2174, lng: 76.8690,
    workers: [
      { id: 7, name: "Зарина Е.", plan: 8, fact: 4, lastSeen: "22 мин назад", status: "behind",
        tasks: [
          { title: "Подмести коридор", zone: "Коридоры", done: true },
          { title: "Протереть перила", zone: "Коридоры", done: true },
          { title: "Вымыть пол", zone: "Коридоры", done: true },
          { title: "Убрать обувь и вещи", zone: "Коридоры", done: true },
          { title: "Помыть раковину", zone: "Кухня", done: false },
          { title: "Протереть столешницы", zone: "Кухня", done: false },
          { title: "Вынести мусор", zone: "Кухня", done: false },
          { title: "Протереть микроволновку", zone: "Кухня", done: false },
        ]},
      { id: 8, name: "Иван П.", plan: 8, fact: 5, lastSeen: "9 мин назад", status: "ok",
        tasks: [
          { title: "Подмести коридор", zone: "Коридоры", done: true },
          { title: "Протереть перила", zone: "Коридоры", done: true },
          { title: "Вымыть пол", zone: "Коридоры", done: true },
          { title: "Убрать обувь и вещи", zone: "Коридоры", done: true },
          { title: "Помыть раковину", zone: "Кухня", done: true },
          { title: "Протереть столешницы", zone: "Кухня", done: false },
          { title: "Вынести мусор", zone: "Кухня", done: false },
          { title: "Протереть микроволновку", zone: "Кухня", done: false },
        ]},
    ],
  },
  {
    id: 5, name: "ул. Байзакова 280", district: "Алматинский р-н",
    plan: 8, fact: 8, status: "done", lat: 43.2760, lng: 76.9310,
    workers: [
      { id: 9,  name: "Карина Б.", plan: 8, fact: 8, lastSeen: "3 мин назад", status: "done",
        tasks: [
          { title: "Подмести коридор", zone: "Коридоры", done: true },
          { title: "Протереть перила", zone: "Коридоры", done: true },
          { title: "Вымыть пол", zone: "Коридоры", done: true },
          { title: "Убрать обувь и вещи", zone: "Коридоры", done: true },
          { title: "Помыть раковину", zone: "Кухня", done: true },
          { title: "Протереть столешницы", zone: "Кухня", done: true },
          { title: "Вынести мусор", zone: "Кухня", done: true },
          { title: "Протереть микроволновку", zone: "Кухня", done: true },
        ]},
      { id: 10, name: "Лера Ю.",   plan: 8, fact: 7, lastSeen: "6 мин назад", status: "ok",
        tasks: [
          { title: "Подмести коридор", zone: "Коридоры", done: true },
          { title: "Протереть перила", zone: "Коридоры", done: true },
          { title: "Вымыть пол", zone: "Коридоры", done: true },
          { title: "Убрать обувь и вещи", zone: "Коридоры", done: true },
          { title: "Помыть раковину", zone: "Кухня", done: true },
          { title: "Протереть столешницы", zone: "Кухня", done: true },
          { title: "Вынести мусор", zone: "Кухня", done: false },
          { title: "Протереть микроволновку", zone: "Кухня", done: false },
        ]},
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ObjectStatus, { dot: string; badge: string; label: string }> = {
  done:   { dot: "bg-brand-green",  badge: "bg-brand-green/12 text-brand-green",  label: "Завершено" },
  ok:     { dot: "bg-amber-400",    badge: "bg-amber-50 text-amber-600",           label: "В процессе" },
  behind: { dot: "bg-red-500",      badge: "bg-red-50 text-red-500",               label: "Отстаёт" },
};

const WORKER_STATUS_CONFIG: Record<WorkerStatus, { bar: string; text: string }> = {
  done:   { bar: "bg-brand-green", text: "text-brand-green" },
  ok:     { bar: "bg-amber-400",   text: "text-amber-600"   },
  behind: { bar: "bg-red-400",     text: "text-red-500"     },
};

function ObjectsTable({ objects }: { objects: CuratorObject[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [openWorkerId, setOpenWorkerId] = useState<number | null>(null);

  return (
    <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_72px_72px_90px_28px] gap-x-3 px-4 py-2 bg-[#f8f9f6] border-b border-black/5">
        <span className="text-[9px] font-black uppercase tracking-widest text-brand-dark/35">Объект</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-brand-dark/35 text-center">План</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-brand-dark/35 text-center">Факт</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-brand-dark/35 text-center">Статус</span>
        <span />
      </div>

      {objects.map((obj, idx) => {
        const cfg = STATUS_CONFIG[obj.status];
        const pct = obj.plan ? Math.round((obj.fact / obj.plan) * 100) : 0;
        const behindCount = obj.workers.filter(w => w.status === "behind").length;
        const isOpen = openId === obj.id;

        return (
          <div key={obj.id} className={idx < objects.length - 1 || isOpen ? "border-b border-black/5" : ""}>
            {/* Main row */}
            <button
              onClick={() => setOpenId(isOpen ? null : obj.id)}
              className={`w-full grid grid-cols-[1fr_72px_72px_90px_28px] gap-x-3 items-center px-4 py-3 text-left transition-colors ${
                isOpen ? "bg-[#fafaf8]" :
                obj.status === "behind" ? "hover:bg-red-50/50" : "hover:bg-[#fafaf8]"
              }`}
            >
              {/* Name */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <p className="font-black text-sm text-brand-dark truncate">{obj.name}</p>
                </div>
                <p className="text-[10px] text-brand-dark/35 font-semibold mt-0.5 pl-3.5 truncate">
                  {obj.workers.length} чел.{behindCount > 0 ? ` · ${behindCount} отстаёт` : ""}
                </p>
              </div>

              {/* Plan */}
              <div className="text-center">
                <p className="text-sm font-black text-brand-dark/50">{obj.plan}</p>
                <p className="text-[9px] text-brand-dark/25 font-semibold">задач</p>
              </div>

              {/* Fact + bar */}
              <div className="text-center">
                <p className={`text-sm font-black ${
                  obj.status === "done" ? "text-brand-green" :
                  obj.status === "behind" ? "text-red-500" : "text-amber-500"
                }`}>{obj.fact}</p>
                <div className="mt-1 h-1 bg-black/6 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    obj.status === "done" ? "bg-brand-green" :
                    obj.status === "behind" ? "bg-red-400" : "bg-amber-400"
                  }`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Status badge */}
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Chevron */}
              <svg className={`w-3.5 h-3.5 text-brand-dark/25 transition-transform mx-auto ${isOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded workers */}
            {isOpen && (
              <div className="bg-[#f5f7f2] px-4 py-2.5 space-y-px">
                {/* Worker sub-header */}
                <div className="grid grid-cols-[1fr_60px_60px_80px] gap-x-3 px-2 pb-1.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-dark/25">Сотрудник</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-dark/25 text-center">План</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-dark/25 text-center">Факт</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-dark/25 text-center">Активность</span>
                </div>
                {obj.workers.map(w => {
                  const wc = WORKER_STATUS_CONFIG[w.status];
                  const wpct = w.plan ? Math.round((w.fact / w.plan) * 100) : 0;
                  const isWorkerOpen = openWorkerId === w.id;
                  const pendingCount = w.tasks.filter(t => !t.done).length;
                  return (
                    <div key={w.id} className="rounded-[12px] overflow-hidden">
                      <button
                        onClick={() => setOpenWorkerId(isWorkerOpen ? null : w.id)}
                        className={`w-full grid grid-cols-[1fr_60px_60px_80px_20px] gap-x-2 items-center px-2 py-2 transition-colors ${
                          isWorkerOpen ? "bg-brand-dark/5" : "bg-white hover:bg-[#f5f7f2]"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                            w.status === "behind" ? "bg-red-100 text-red-400" :
                            w.status === "done"   ? "bg-brand-green/15 text-brand-green" :
                                                    "bg-brand-dark/8 text-brand-dark/40"
                          }`}>{w.name.slice(0, 1)}</div>
                          <p className="text-xs font-black text-brand-dark truncate">{w.name}</p>
                          {pendingCount > 0 && (
                            <span className="text-[9px] font-black text-red-400 flex-shrink-0">−{pendingCount}</span>
                          )}
                        </div>
                        <p className="text-xs font-black text-brand-dark/40 text-center">{w.plan}</p>
                        <div className="text-center">
                          <p className={`text-xs font-black ${wc.text}`}>{w.fact}</p>
                          <div className="mt-0.5 h-0.5 bg-black/6 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${wc.bar}`} style={{ width: `${wpct}%` }} />
                          </div>
                        </div>
                        <p className="text-[10px] text-brand-dark/30 font-semibold text-center truncate">{w.lastSeen}</p>
                        <svg className={`w-3 h-3 text-brand-dark/20 mx-auto transition-transform ${isWorkerOpen ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isWorkerOpen && (() => {
                        const byZone = w.tasks.reduce<Record<string, typeof w.tasks>>((acc, t) => {
                          (acc[t.zone] = acc[t.zone] ?? []).push(t);
                          return acc;
                        }, {});
                        const zoneOrder = [
                          ...ZONES.filter(z => byZone[z]),
                          ...Object.keys(byZone).filter(z => !ZONES.includes(z)),
                        ];
                        return (
                          <div className="bg-white border-t border-black/4 px-3 py-2 space-y-3">
                            <div className="rounded-[14px] border border-black/5 bg-[#fbfcf8] p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark/35">Отчёт смены</p>
                                  <p className="mt-1 text-xs font-black text-brand-dark">
                                    {w.checklistStatus || "pending"} · чек-лист #{w.checklistId ?? w.id}
                                  </p>
                                </div>
                                <div className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${
                                  w.status === "done" ? "bg-brand-green/12 text-brand-green" :
                                  w.status === "behind" ? "bg-red-50 text-red-500" :
                                  "bg-amber-50 text-amber-600"
                                }`}>
                                  {w.fact}/{w.plan}
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="rounded-[12px] bg-white px-3 py-2">
                                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-dark/30">Старт</p>
                                  <p className="mt-0.5 text-[11px] font-bold text-brand-dark/65">{formatDateTime(w.startedAt)}</p>
                                </div>
                                <div className="rounded-[12px] bg-white px-3 py-2">
                                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-dark/30">Финиш</p>
                                  <p className="mt-0.5 text-[11px] font-bold text-brand-dark/65">{formatDateTime(w.completedAt)}</p>
                                </div>
                              </div>

                              {w.location && (
                                <div className="mt-2 rounded-[12px] bg-white px-3 py-2">
                                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-dark/30">GPS</p>
                                  <p className="mt-0.5 text-[11px] font-bold text-brand-dark/65">
                                    {w.location.lat.toFixed(5)}, {w.location.lng.toFixed(5)}
                                    {w.location.accuracy ? ` · ±${Math.round(w.location.accuracy)} м` : ""}
                                  </p>
                                </div>
                              )}

                              {w.notes && (
                                <div className="mt-2 rounded-[12px] bg-white px-3 py-2">
                                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-dark/30">Заметки</p>
                                  <p className="mt-0.5 whitespace-pre-wrap text-[11px] font-semibold text-brand-dark/50">{w.notes}</p>
                                </div>
                              )}

                              {w.photoUrls && w.photoUrls.length > 0 && (
                                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                                  {w.photoUrls.map((url, photoIndex) => (
                                    <a
                                      key={`${url}-${photoIndex}`}
                                      href={apiAssetUrl(url)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-black/5 bg-white"
                                    >
                                      <img src={apiAssetUrl(url)} alt="" className="h-full w-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            {zoneOrder.map(zone => (
                              <div key={zone}>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1.5 ${ZONE_COLORS_TASK[zone] || "bg-slate-100 text-slate-600"}`}>
                                  {zone}
                                </div>
                                <div className="space-y-1 pl-2">
                                  {byZone[zone]?.map((t, ti) => (
                                    <div key={ti} className={`flex items-center gap-2 px-2 py-1 rounded-[8px] ${t.done ? "opacity-40" : "bg-red-50"}`}>
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${t.done ? "bg-brand-green/20" : "bg-red-100"}`}>
                                        {t.done
                                          ? <svg className="w-2.5 h-2.5 text-brand-green" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                          : <svg className="w-2.5 h-2.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                                        }
                                      </div>
                                      <span className={`text-[11px] font-semibold flex-1 ${t.done ? "text-brand-dark/40" : "text-red-500"}`}>{t.title}</span>
                                      {t.photoUrl && (
                                        <a
                                          href={apiAssetUrl(t.photoUrl)}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(event) => event.stopPropagation()}
                                          className="text-[9px] font-black text-brand-green bg-brand-green/10 px-1.5 py-0.5 rounded-full"
                                        >
                                          фото
                                        </a>
                                      )}
                                      {!t.done && <span className="text-[9px] font-black text-red-400 bg-red-100 px-1.5 py-0.5 rounded-full">не сделано</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; id: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [curatorObjects, setCuratorObjects] = useState<CuratorObject[]>(CURATOR_OBJECTS);
  const [mapPins, setMapPins] = useState(MAP_PINS);
  const [cleanerStats, setCleanerStats] = useState([
    { label: "Смена", value: "4", sub: "активные зоны" },
    { label: "Статус", value: "82%", sub: "средний темп" },
    { label: "Браузер", value: "OK", sub: "устройство запомнено" },
  ]);

  const logout = async () => {
    await logoutUser();
    router.push("/auth/login");
  };

  useEffect(() => {
    fetchCurrentUser()
      .then((currentUser) => {
        if (!currentUser) {
          router.push("/auth/login");
          return;
        }
        if (currentUser.role === "cleaner") {
          router.push("/app/work");
          return;
        }
        setUser({ id: currentUser.id, name: currentUser.name, role: currentUser.role });
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const endpoint =
      user.role === "admin" || user.role === "curator" || user.role === "partner"
        ? `${API_BASE}/dashboard/curator-detailed`
        : `${API_BASE}/dashboard/cleaner`;

    fetch(endpoint, { headers })
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
        if (user.role === "admin" || user.role === "curator" || user.role === "partner") {
          if (Array.isArray(data.objects) && data.objects.length > 0) {
            setCuratorObjects(data.objects);
          }
          if (Array.isArray(data.mapPins) && data.mapPins.length > 0) {
            setMapPins(data.mapPins);
          }
        } else if (Array.isArray(data.stats)) {
          setCleanerStats(data.stats);
        }
      })
      .catch(() => {});
  }, [router, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7f2] flex items-center justify-center">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-dark/35">Загрузка...</p>
      </main>
    );
  }

  const isCurator = user?.role === "admin" || user?.role === "curator" || user?.role === "partner";

  // ── Curator dashboard ──────────────────────────────────────────────────────
  if (isCurator) {
    const totalPlan   = curatorObjects.reduce((s, o) => s + o.plan, 0);
    const totalFact   = curatorObjects.reduce((s, o) => s + o.fact, 0);
    const behindObjs  = curatorObjects.filter(o => o.status === "behind").length;
    const doneObjs    = curatorObjects.filter(o => o.status === "done").length;
    const totalWorkers = curatorObjects.reduce((s, o) => s + o.workers.length, 0);
    const behindWorkers = curatorObjects.flatMap(o => o.workers).filter(w => w.status === "behind").length;
    const overallPct  = Math.round((totalFact / totalPlan) * 100);

    return (
      <main className="min-h-screen bg-[#f5f7f2]">
        <PreviewNavbar active="dashboard" />

        <div className="max-w-2xl mx-auto px-4 pb-16 pt-4 space-y-4">

          {/* Header card */}
          <div className="rounded-[28px] bg-brand-dark px-5 py-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-52 h-52 rounded-full bg-white/3 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1">Куратор · Сегодня</p>
            <h1 className="text-3xl font-black text-white">Привет, {user?.name}</h1>

            {/* Overall progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Общий прогресс</span>
                <span className="text-[10px] font-black text-white/60">{totalFact} / {totalPlan} задач</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-green transition-all"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] font-black text-brand-green">{overallPct}%</p>
            </div>

            {/* Quick stats */}
            <div className="mt-3 flex gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-white/70 bg-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                {curatorObjects.length} объектов
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-white/70 bg-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                {doneObjs} завершено
              </span>
              {behindObjs > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-red-300 bg-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {behindObjs} отстаёт
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-white/70 bg-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {totalWorkers} сотрудников
              </span>
            </div>
          </div>

          {/* Behind alert */}
          {behindWorkers > 0 && (
            <div className="rounded-[20px] bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-red-600">{behindWorkers} сотрудников отстают от плана</p>
                <p className="text-[11px] text-red-400 font-semibold mt-0.5">Раскройте объект чтобы увидеть кто именно</p>
              </div>
            </div>
          )}

          {/* Objects table */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/35 mb-2 px-1">Мои объекты</p>
            <ObjectsTable objects={curatorObjects} />
          </div>

          {/* Map */}
          <div className="rounded-[28px] border border-black/5 bg-white shadow-premium overflow-hidden">
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/35">Объекты на карте</p>
                <p className="text-base font-black text-brand-dark mt-0.5">Актуальные адреса · {curatorObjects.length}</p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-red-50 text-[11px] font-black text-red-500">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {behindObjs} в красном
              </span>
            </div>
            <MapView pins={mapPins} center={[51.1282, 71.4304]} zoom={12} className="h-[240px] w-full" />
          </div>

          {/* Admin link + logout */}
          <div className={`grid gap-3 ${canAccessAdminPanel(user?.role) ? "grid-cols-2" : "grid-cols-1"}`}>
            {canAccessAdminPanel(user?.role) ? (
              <Link href="/app/admin"
                className="flex items-center gap-3 rounded-[20px] border border-black/5 bg-white px-4 py-4 shadow-premium hover:-translate-y-0.5 transition-all">
                <div className="w-9 h-9 rounded-[12px] bg-brand-dark flex items-center justify-center flex-shrink-0">
                  <UsersIcon cls="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-brand-dark">Админка</p>
                  <p className="text-[10px] text-brand-dark/40 font-semibold">Чек-листы, адреса</p>
                </div>
              </Link>
            ) : null}
            <button
              onClick={logout}
              className="flex items-center gap-3 rounded-[20px] border border-black/5 bg-white px-4 py-4 shadow-premium hover:border-red-200 transition-all text-left">
              <div className="w-9 h-9 rounded-[12px] bg-black/6 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-dark/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-brand-dark">Выйти</p>
                <p className="text-[10px] text-brand-dark/40 font-semibold">Из аккаунта</p>
              </div>
            </button>
          </div>

        </div>
      </main>
    );
  }

  // ── Cleaner dashboard ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#f5f7f2]">
      <PreviewNavbar active="dashboard" />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <AppHero
          eyebrow="Рабочий обзор"
          title={`Привет, ${user?.name}`}
          subtitle={`Роль: ${user?.role}`}
          sideLabel="Онлайн"
        />

        <div className="mt-4 grid grid-cols-3 gap-3">
          {cleanerStats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} sub={stat.sub} />
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Link href="/checklist"
            className="group rounded-[28px] border border-black/5 bg-white p-5 shadow-premium transition hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-brand-green text-brand-dark shadow-button">
              <ClipboardIcon cls="w-5 h-5" />
            </div>
            <h2 className="mt-4 text-2xl font-black text-brand-dark">Мои чек-листы</h2>
            <p className="mt-1 text-sm font-medium text-brand-dark/45">
              Смотреть задания, отмечать выполнение и быстро переходить к рабочему экрану.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-green">Открыть</div>
          </Link>

          <Link href="/app/work"
            className="group rounded-[28px] border border-black/5 bg-brand-dark p-5 text-white shadow-[0_8px_30px_rgba(26,29,30,0.18)] transition hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/10 text-brand-green">
              <CheckIcon cls="w-5 h-5" />
            </div>
            <h2 className="mt-4 text-2xl font-black">Начать смену</h2>
            <p className="mt-1 text-sm font-medium text-white/55">
              Перейти в мобильный режим уборки с зонами, фото и отметками выполнения.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-brand-green">Перейти в работу</div>
          </Link>
        </div>

        {/* Map */}
        <div className="mt-4 rounded-[28px] border border-black/5 bg-white shadow-premium overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/35">Объекты сегодня</p>
              <p className="text-base font-black text-brand-dark mt-0.5">Карта уборки</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-brand-green/12 text-[11px] font-black text-brand-green">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              5 объектов
            </span>
          </div>
          <MapView pins={mapPins} center={[51.1282, 71.4304]} zoom={12} className="h-[260px] w-full" />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-premium">
            <div className="flex items-center gap-2 text-brand-green">
              <BellIcon cls="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">Напоминание</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-dark">Браузер запомнен, повторный вход будет быстрее.</p>
          </div>
          <div className="rounded-[24px] border border-black/5 bg-white p-4 shadow-premium">
            <div className="flex items-center gap-2 text-brand-green">
              <ChartIcon cls="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">Динамика</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-dark">Сегодня удобно стартовать с санузлов и коридоров.</p>
          </div>
          <button
            onClick={logout}
            className="rounded-[24px] border border-black/5 bg-white p-4 text-left shadow-premium transition hover:border-brand-dark/15">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">Сессия</span>
            <p className="mt-3 text-sm font-semibold text-brand-dark">Выйти из аккаунта</p>
          </button>
        </div>
      </div>
    </main>
  );
}
