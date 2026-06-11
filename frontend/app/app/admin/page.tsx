"use client";

import { useState } from "react";
import { PreviewNavbar } from "../../components/AppChrome";

// ─── Constants ────────────────────────────────────────────────────────────────
const ZONE_OPTIONS = ["Санузлы", "Зал / Офис", "Коридоры", "Кухня", "Другое"];
const ZONE_COLORS: Record<string, string> = {
  "Санузлы":    "bg-blue-100 text-blue-700",
  "Зал / Офис": "bg-emerald-100 text-emerald-700",
  "Коридоры":   "bg-orange-100 text-orange-700",
  "Кухня":      "bg-violet-100 text-violet-700",
  "Другое":     "bg-gray-100 text-gray-600",
};
const CL_COLORS = [
  { dot: "bg-blue-500",    badge: "bg-blue-500",    text: "text-white" },
  { dot: "bg-emerald-500", badge: "bg-emerald-500", text: "text-white" },
  { dot: "bg-orange-500",  badge: "bg-orange-500",  text: "text-white" },
];

// ─── Task Icons ────────────────────────────────────────────────────────────────
const TASK_ICONS: { id: string; label: string }[] = [
  { id: "sparkles",  label: "Блеск" },
  { id: "spray",     label: "Распылитель" },
  { id: "bucket",    label: "Ведро" },
  { id: "mop",       label: "Швабра" },
  { id: "broom",     label: "Метла" },
  { id: "vacuum",    label: "Пылесос" },
  { id: "brush",     label: "Щётка" },
  { id: "sponge",    label: "Губка" },
  { id: "soap",      label: "Мыло" },
  { id: "towel",     label: "Полотенце" },
  { id: "paper",     label: "Туалет. бумага" },
  { id: "toilet",    label: "Унитаз" },
  { id: "sink",      label: "Раковина" },
  { id: "mirror",    label: "Зеркало" },
  { id: "shower",    label: "Душ" },
  { id: "window",    label: "Окно" },
  { id: "door",      label: "Дверь" },
  { id: "stairs",    label: "Лестница" },
  { id: "table",     label: "Стол" },
  { id: "chair",     label: "Стул" },
  { id: "microwave", label: "Микроволновка" },
  { id: "fridge",    label: "Холодильник" },
  { id: "trash_bin", label: "Мусорный бак" },
  { id: "floor",     label: "Пол / плитка" },
];

function TaskIcon({ id, cls = "w-4 h-4" }: { id?: string; cls?: string }) {
  const p = { className: cls, fill: "none", stroke: "currentColor", strokeWidth: 1.8, viewBox: "0 0 24 24", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "sparkles": return (
      <svg {...p}>
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    );
    case "spray": return (
      <svg {...p}>
        <rect x="9" y="9" width="7" height="11" rx="1.5" />
        <path d="M16 12h3M16 9V6a2 2 0 00-2-2h-2" />
        <path d="M19 12l-1 2.5" />
        <path d="M9 13H7l-1.5 2" />
      </svg>
    );
    case "bucket": return (
      <svg {...p}>
        <path d="M7 8l1.5 11h7L17 8H7z" />
        <path d="M6 8h12" />
        <path d="M10 4a2 2 0 014 0v4" />
      </svg>
    );
    case "mop": return (
      <svg {...p}>
        <line x1="12" y1="2" x2="12" y2="15" />
        <path d="M8 15h8l1 4H7l1-4z" />
        <path d="M9 19c0 1.1.9 2 3 2s3-.9 3-2" />
      </svg>
    );
    case "broom": return (
      <svg {...p}>
        <line x1="17" y1="3" x2="8" y2="18" />
        <path d="M8 18c-2 0-4 1-4 3" />
        <path d="M8 18c0 2 1 3 3 3" />
        <path d="M8 18l-3 1" />
        <path d="M8 18l1 3" />
      </svg>
    );
    case "vacuum": return (
      <svg {...p}>
        <rect x="3" y="13" width="11" height="6" rx="3" />
        <path d="M14 16h3a4 4 0 000-8h-3" />
        <circle cx="7" cy="20" r="1" fill="currentColor" />
        <circle cx="11" cy="20" r="1" fill="currentColor" />
      </svg>
    );
    case "brush": return (
      <svg {...p}>
        <path d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128z" />
        <path d="M9.53 16.122a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    );
    case "sponge": return (
      <svg {...p}>
        <rect x="3" y="7" width="18" height="12" rx="3" />
        <circle cx="8"  cy="11" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none" />
        <circle cx="10" cy="15" r="1" fill="currentColor" stroke="none" />
        <circle cx="14" cy="15" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
    case "soap": return (
      <svg {...p}>
        <rect x="4" y="9" width="16" height="11" rx="3" />
        <path d="M8 9V7a2 2 0 012-2h4a2 2 0 012 2v2" />
        <circle cx="9"  cy="14" r="1" fill="currentColor" stroke="none" />
        <circle cx="13" cy="14" r="1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="17" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
    case "towel": return (
      <svg {...p}>
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <line x1="5" y1="9" x2="19" y2="9" />
        <line x1="8" y1="4" x2="8" y2="9" />
        <line x1="12" y1="4" x2="12" y2="9" />
        <line x1="16" y1="4" x2="16" y2="9" />
      </svg>
    );
    case "paper": return (
      <svg {...p}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <line x1="3" y1="12" x2="9" y2="12" />
      </svg>
    );
    case "toilet": return (
      <svg {...p}>
        <rect x="7" y="2" width="10" height="5" rx="1.5" />
        <path d="M6 7h12v2a6 6 0 01-12 0V7z" />
        <ellipse cx="12" cy="21" rx="5" ry="1.5" fill="currentColor" opacity="0.15" stroke="none" />
        <path d="M7 19h10" />
      </svg>
    );
    case "sink": return (
      <svg {...p}>
        <path d="M5 8h14v5a7 7 0 01-14 0V8z" />
        <path d="M5 8V5h14v3" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="9"  y1="22" x2="15" y2="22" />
        <line x1="10" y1="5"  x2="10" y2="8" />
        <line x1="14" y1="5"  x2="14" y2="8" />
      </svg>
    );
    case "mirror": return (
      <svg {...p}>
        <ellipse cx="12" cy="9" rx="6" ry="8" />
        <path d="M10 17l-1 4h6l-1-4" />
        <line x1="9" y1="21" x2="15" y2="21" />
      </svg>
    );
    case "shower": return (
      <svg {...p}>
        <path d="M4 4l6 6" />
        <circle cx="10.5" cy="10.5" r="2.5" />
        <path d="M13 13l5 5" />
        <line x1="8"  y1="16" x2="8"  y2="19" />
        <line x1="11" y1="17" x2="11" y2="20" />
        <line x1="14" y1="16" x2="14" y2="19" />
        <line x1="6"  y1="19" x2="6"  y2="22" />
        <line x1="9"  y1="20" x2="9"  y2="23" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    );
    case "window": return (
      <svg {...p}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    );
    case "door": return (
      <svg {...p}>
        <rect x="5" y="2" width="14" height="20" rx="1.5" />
        <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
        <line x1="5" y1="2" x2="5" y2="22" />
      </svg>
    );
    case "stairs": return (
      <svg {...p}>
        <path d="M3 21h4v-4h4v-4h4v-4h4v-4h2" />
        <path d="M3 21V19" />
      </svg>
    );
    case "table": return (
      <svg {...p}>
        <rect x="2" y="7" width="20" height="4" rx="1.5" />
        <line x1="6"  y1="11" x2="6"  y2="21" />
        <line x1="18" y1="11" x2="18" y2="21" />
      </svg>
    );
    case "chair": return (
      <svg {...p}>
        <rect x="7" y="7" width="10" height="7" rx="1.5" />
        <line x1="7"  y1="14" x2="7"  y2="21" />
        <line x1="17" y1="14" x2="17" y2="21" />
        <path d="M4 10h3M17 10h3" />
        <line x1="4" y1="10" x2="4" y2="18" />
        <line x1="20" y1="10" x2="20" y2="18" />
      </svg>
    );
    case "microwave": return (
      <svg {...p}>
        <rect x="2" y="6" width="20" height="13" rx="2" />
        <rect x="5" y="9" width="8" height="7" rx="1" />
        <circle cx="18" cy="11" r="1" fill="currentColor" stroke="none" />
        <circle cx="18" cy="14" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
    case "fridge": return (
      <svg {...p}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="5" y1="10" x2="19" y2="10" />
        <line x1="9" y1="6"  x2="9" y2="8"  />
        <line x1="9" y1="13" x2="9" y2="17" />
      </svg>
    );
    case "trash_bin": return (
      <svg {...p}>
        <path d="M7 8l1 13h8l1-13" />
        <line x1="5" y1="8" x2="19" y2="8" />
        <path d="M9 8V5h6v3" />
        <line x1="10" y1="12" x2="10" y2="17" />
        <line x1="14" y1="12" x2="14" y2="17" />
      </svg>
    );
    case "floor": return (
      <svg {...p}>
        <rect x="3"  y="3"  width="7" height="7" rx="1" />
        <rect x="14" y="3"  width="7" height="7" rx="1" />
        <rect x="3"  y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
    default: return (
      <svg {...p}>
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    );
  }
}

interface Task {
  id: number;
  title: string;
  zone: string;
  time: string;
  at: string;
  icon: string;
}
interface Checklist {
  id: number;
  name: string;
  tasks: Task[];
}
interface Address {
  id: number;
  name: string;
  district: string;
  checklistId: number;
  workers: number;
  lat?: number;
  lng?: number;
}

const mkTask = (title: string, zone: string, time: string, at = "", icon = "sparkles"): Task =>
  ({ id: Date.now() + Math.random(), title, zone, time, at, icon });

const initialChecklists: Checklist[] = [
  {
    id: 1, name: "Чек-лист 1",
    tasks: [
      mkTask("Помыть унитазы",            "Санузлы",    "10 мин", "", "toilet"),
      mkTask("Протереть раковины и краны", "Санузлы",    "5 мин",  "", "sink"),
      mkTask("Помыть полы",               "Санузлы",    "10 мин", "", "mop"),
      mkTask("Заменить мыло и бумагу",    "Санузлы",    "3 мин",  "", "soap"),
      mkTask("Протереть зеркала",         "Санузлы",    "5 мин",  "", "mirror"),
      mkTask("Очистить мусорные корзины", "Санузлы",    "3 мин",  "", "trash_bin"),
    ],
  },
  {
    id: 2, name: "Чек-лист 2",
    tasks: [
      mkTask("Пропылесосить / подмести",  "Зал / Офис", "15 мин", "", "vacuum"),
      mkTask("Протереть столы и стулья",  "Зал / Офис", "10 мин", "", "table"),
      mkTask("Вынести мусор",             "Зал / Офис", "5 мин",  "", "trash_bin"),
      mkTask("Протереть подоконники",     "Зал / Офис", "5 мин",  "", "window"),
      mkTask("Помыть полы",               "Зал / Офис", "15 мин", "", "mop"),
    ],
  },
  {
    id: 3, name: "Чек-лист 3",
    tasks: [
      mkTask("Подмести коридор",          "Коридоры",   "5 мин",  "", "broom"),
      mkTask("Протереть перила",          "Коридоры",   "5 мин",  "", "brush"),
      mkTask("Вымыть пол",                "Коридоры",   "10 мин", "", "bucket"),
      mkTask("Убрать обувь и вещи",       "Коридоры",   "5 мин",  "", "door"),
      mkTask("Помыть раковину",           "Кухня",      "5 мин",  "", "sink"),
      mkTask("Протереть столешницы",      "Кухня",      "5 мин",  "", "sponge"),
      mkTask("Вынести мусор",             "Кухня",      "3 мин",  "", "trash_bin"),
      mkTask("Протереть микроволновку",   "Кухня",      "5 мин",  "", "microwave"),
    ],
  },
];

const initialAddresses: Address[] = [
  { id: 1, name: "ул. Абая 12",       district: "Алмалинский район",    checklistId: 1, workers: 2, lat: 43.2550, lng: 76.9126 },
  { id: 2, name: "пр. Достык 89",     district: "Медеуский район",      checklistId: 2, workers: 3, lat: 43.2415, lng: 76.9554 },
  { id: 3, name: "ул. Толе би 55",    district: "Бостандыкский район",  checklistId: 3, workers: 1, lat: 43.2680, lng: 76.8930 },
  { id: 4, name: "пр. Аль-Фараби 17", district: "Бостандыкский район",  checklistId: 3, workers: 2, lat: 43.2174, lng: 76.8690 },
  { id: 5, name: "ул. Байзакова 280", district: "Алматинский район",    checklistId: 3, workers: 1, lat: 43.2760, lng: 76.9310 },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const BuildingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);
const TrashIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const PencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
  </svg>
);

type Tab = "addresses" | "checklists";

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("addresses");

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newChecklistId, setNewChecklistId] = useState<number | "new">(1);
  const [newClName, setNewClName] = useState("");

  // Checklists
  const [checklists, setChecklists] = useState<Checklist[]>(initialChecklists);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTasks, setEditTasks] = useState<Task[]>([]);
  const [editName, setEditName] = useState("");
  const [iconPickerFor, setIconPickerFor] = useState<number | null>(null);

  const startEdit = (cl: Checklist) => {
    setEditingId(cl.id);
    setEditTasks(cl.tasks.map(t => ({ ...t })));
    setEditName(cl.name);
    setIconPickerFor(null);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setChecklists(prev => prev.map(cl =>
      cl.id === editingId
        ? { ...cl, name: editName, tasks: editTasks.filter(t => t.title.trim()) }
        : cl
    ));
    setEditingId(null);
    setIconPickerFor(null);
  };

  const updateTask = (idx: number, field: keyof Task, val: string) => {
    setEditTasks(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  };

  const removeTask = (idx: number) => setEditTasks(prev => prev.filter((_, i) => i !== idx));

  const grouped = checklists.map((cl, idx) => ({
    cl, color: CL_COLORS[idx] ?? CL_COLORS[0],
    addresses: addresses.filter(a => a.checklistId === cl.id),
  }));

  const totalTime = (tasks: Task[]) => {
    const mins = tasks.reduce((acc, t) => {
      const m = parseInt(t.time);
      return acc + (isNaN(m) ? 0 : m);
    }, 0);
    return mins ? `${mins} мин` : "—";
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2]">
      <PreviewNavbar active="admin" />

      <div className="max-w-3xl mx-auto px-4 pb-16 pt-4">
        {/* Header */}
        <div className="rounded-[28px] bg-brand-dark px-5 py-5 mb-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/3 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1">Панель управления</p>
          <h1 className="text-3xl font-black text-white uppercase">Админка</h1>
          <div className="mt-3 flex gap-2 flex-wrap">
            {checklists.map((cl, idx) => (
              <span key={cl.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white/80 bg-white/10">
                <span className={`w-1.5 h-1.5 rounded-full ${CL_COLORS[idx]?.badge ?? "bg-gray-400"}`} />
                {cl.name} · {cl.tasks.length} задач · {totalTime(cl.tasks)}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-white rounded-[18px] p-1.5 border border-black/5">
          {(["addresses", "checklists"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-wider transition-all ${
                tab === t ? "bg-brand-dark text-white shadow-sm" : "text-brand-dark/50 hover:text-brand-dark"
              }`}>
              {t === "addresses" ? "Адреса" : "Чек-листы"}
            </button>
          ))}
        </div>

        {/* ── ADDRESSES TAB ── */}
        {tab === "addresses" && (
          <div className="space-y-3">
            {grouped.map(({ cl, color, addresses: addrs }) => (
              <div key={cl.id} className="rounded-[24px] bg-white border border-black/5 overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-3 px-4 py-4">
                  <span className={`w-3 h-3 rounded-full ${color.dot} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-brand-dark uppercase tracking-wider">{cl.name}</p>
                    <p className="text-[11px] text-brand-dark/40 font-semibold mt-0.5">{cl.tasks.length} задач · {totalTime(cl.tasks)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {addrs.length > 0 && (
                      <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-[12px] bg-brand-green/12 text-xs font-black text-brand-green">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        {addrs.reduce((s, a) => s + (a.workers ?? 1), 0)} чел.
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-brand-dark/6 text-xs font-black text-brand-dark/60">
                      <BuildingIcon />
                      {addrs.length === 0
                        ? "Нет адресов"
                        : addrs.length === 1
                          ? addrs[0].name
                          : `Остальные адреса (${addrs.length})`}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add address */}
            <div className="rounded-[24px] bg-white border border-black/5 overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
              {!adding ? (
                <button onClick={() => setAdding(true)} className="w-full flex items-center gap-3 px-4 py-4 text-brand-dark/50 hover:text-brand-dark transition-colors">
                  <div className="w-8 h-8 rounded-[12px] border-2 border-dashed border-brand-dark/20 flex items-center justify-center"><PlusIcon /></div>
                  <span className="text-sm font-black uppercase tracking-wider">Добавить адрес</span>
                </button>
              ) : (
                <div className="p-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40">Новый адрес</p>
                  <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Адрес объекта"
                    className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors" />
                  <input value={newDistrict} onChange={e => setNewDistrict(e.target.value)} placeholder="Район (необязательно)"
                    className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors" />

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-brand-dark/40 mb-2">Чек-лист</p>
                    <div className="flex flex-wrap gap-2">
                      {checklists.map((cl, idx) => (
                        <button key={cl.id} onClick={() => setNewChecklistId(cl.id)}
                          className={`px-3 py-2 rounded-[14px] text-xs font-black uppercase transition-all ${
                            newChecklistId === cl.id ? `${CL_COLORS[idx]?.badge ?? "bg-gray-500"} text-white` : "bg-black/5 text-brand-dark/50 hover:bg-black/10"
                          }`}>
                          {cl.name}
                        </button>
                      ))}
                      <button onClick={() => setNewChecklistId("new")}
                        className={`px-3 py-2 rounded-[14px] text-xs font-black uppercase transition-all flex items-center gap-1 ${
                          newChecklistId === "new" ? "bg-brand-green text-brand-dark" : "bg-black/5 text-brand-dark/50 hover:bg-black/10"
                        }`}>
                        <PlusIcon /> Новый чек-лист
                      </button>
                    </div>
                  </div>

                  {newChecklistId === "new" && (
                    <input value={newClName} onChange={e => setNewClName(e.target.value)}
                      placeholder="Название нового чек-листа"
                      className="w-full px-4 py-3 rounded-[16px] border-2 border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors" />
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      disabled={!newName.trim() || (newChecklistId === "new" && !newClName.trim())}
                      onClick={() => {
                        if (!newName.trim()) return;
                        let clId: number;
                        if (newChecklistId === "new") {
                          if (!newClName.trim()) return;
                          const nextId = Math.max(0, ...checklists.map(c => c.id)) + 1;
                          setChecklists(p => [...p, { id: nextId, name: newClName.trim(), tasks: [] }]);
                          clId = nextId;
                          setNewClName("");
                        } else {
                          clId = newChecklistId as number;
                        }
                        setAddresses(p => [...p, { id: Date.now(), name: newName.trim(), district: newDistrict.trim(), checklistId: clId }]);
                        setNewName(""); setNewDistrict(""); setNewChecklistId(1); setAdding(false);
                      }}
                      className="flex-1 py-3 rounded-[16px] bg-brand-green text-brand-dark text-xs font-black uppercase disabled:opacity-40 hover:bg-brand-dark hover:text-white transition-all">
                      Добавить
                    </button>
                    <button onClick={() => { setAdding(false); setNewName(""); setNewDistrict(""); setNewClName(""); setNewChecklistId(1); }}
                      className="px-5 py-3 rounded-[16px] bg-black/6 text-brand-dark/60 text-xs font-black uppercase">
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CHECKLISTS TAB ── */}
        {tab === "checklists" && (
          <div className="space-y-4">
            {checklists.map((cl, idx) => {
              const color = CL_COLORS[idx] ?? CL_COLORS[0];
              const isEditing = editingId === cl.id;

              const byZone = cl.tasks.reduce<Record<string, Task[]>>((acc, t) => {
                (acc[t.zone] = acc[t.zone] ?? []).push(t);
                return acc;
              }, {});

              return (
                <div key={cl.id} className="rounded-[24px] bg-white border border-black/5 overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-black/5">
                    <span className={`w-3 h-3 rounded-full ${color.dot} flex-shrink-0`} />
                    {isEditing ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="flex-1 font-black text-sm text-brand-dark uppercase tracking-wider bg-transparent outline-none border-b-2 border-brand-green" />
                    ) : (
                      <span className="flex-1 font-black text-sm text-brand-dark uppercase tracking-wider">{cl.name}</span>
                    )}
                    <span className="text-[10px] text-brand-dark/35 font-black">{cl.tasks.length} задач · {totalTime(cl.tasks)}</span>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-brand-green text-brand-dark text-[10px] font-black uppercase">
                          <CheckIcon /> Сохранить
                        </button>
                        <button onClick={() => { setEditingId(null); setIconPickerFor(null); }} className="px-2.5 py-1.5 rounded-[10px] bg-black/6 text-brand-dark/50 text-[10px] font-black">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(cl)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-brand-dark/6 hover:bg-brand-dark/12 transition-colors text-[10px] font-black text-brand-dark/60 uppercase">
                        <PencilIcon /> Изменить
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-3">
                    {isEditing ? (
                      (() => {
                        const zones = [...new Set(editTasks.map(t => t.zone))];
                        const unusedZones = ZONE_OPTIONS.filter(z => !zones.includes(z));
                        return (
                          <div className="space-y-3">
                            {zones.map(zone => {
                              const zoneTasks = editTasks.map((t, i) => ({ t, i })).filter(({ t }) => t.zone === zone);
                              return (
                                <div key={zone} className="flex items-stretch gap-2">
                                  <div className="flex-1 rounded-[16px] border-2 border-black/6 overflow-hidden min-w-0">
                                    {/* Zone header */}
                                    <div className={`flex items-center justify-between px-3 py-2 ${ZONE_COLORS[zone] ?? "bg-gray-100 text-gray-600"}`}>
                                      <span className="text-[10px] font-black uppercase tracking-wider">{zone}</span>
                                      <button
                                        onClick={() => setEditTasks(p => p.filter(t => t.zone !== zone))}
                                        className="text-[10px] font-black opacity-50 hover:opacity-100 transition-opacity">
                                        Удалить зону
                                      </button>
                                    </div>
                                    {/* Tasks */}
                                    <div className="px-2 pt-1.5 pb-1.5 space-y-1 bg-white">
                                      {zoneTasks.map(({ t, i }) => (
                                        <div key={t.id}>
                                          <div className="flex items-center gap-1.5">
                                            {/* Icon picker button */}
                                            <button
                                              onClick={() => setIconPickerFor(iconPickerFor === t.id ? null : t.id)}
                                              title="Выбрать иконку"
                                              className={`w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0 transition-colors ${
                                                iconPickerFor === t.id
                                                  ? "bg-brand-green text-brand-dark"
                                                  : "bg-brand-dark/6 text-brand-dark/50 hover:bg-brand-dark/12"
                                              }`}>
                                              <TaskIcon id={t.icon} cls="w-3.5 h-3.5" />
                                            </button>
                                            <input value={t.title}
                                              onChange={e => updateTask(i, "title", e.target.value)}
                                              placeholder="Название задачи"
                                              className="flex-1 px-2.5 py-1.5 rounded-[8px] border border-black/8 focus:border-brand-green outline-none text-xs text-brand-dark bg-[#fafaf8] transition-colors min-w-0" />
                                            <input value={t.at}
                                              onChange={e => updateTask(i, "at", e.target.value)}
                                              placeholder="08:00"
                                              type="time"
                                              className="w-[68px] flex-shrink-0 px-1 py-1.5 rounded-[8px] border border-black/8 focus:border-brand-green outline-none text-[10px] font-bold text-brand-dark bg-[#fafaf8] text-center" />
                                            <div className="flex items-center gap-0.5 flex-shrink-0">
                                              <input value={t.time.replace(/\D/g, "")}
                                                onChange={e => updateTask(i, "time", e.target.value + " мин")}
                                                placeholder="5"
                                                className="w-8 px-1 py-1.5 rounded-[8px] border border-black/8 focus:border-brand-green outline-none text-[11px] font-bold text-brand-dark bg-[#fafaf8] text-center" />
                                              <span className="text-[8px] font-black text-brand-dark/35 uppercase">мин</span>
                                            </div>
                                            <button onClick={() => removeTask(i)}
                                              className="w-6 h-6 rounded-[6px] bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-colors flex-shrink-0">
                                              <TrashIcon cls="w-3 h-3" />
                                            </button>
                                          </div>
                                          {/* Icon picker grid */}
                                          {iconPickerFor === t.id && (
                                            <div className="mt-1 p-2 rounded-[10px] bg-[#f5f7f2] border border-black/8">
                                              <p className="text-[8px] font-black uppercase tracking-widest text-brand-dark/30 mb-1.5 px-0.5">Иконка</p>
                                              <div className="flex flex-wrap gap-1">
                                                {TASK_ICONS.map(icon => (
                                                  <button
                                                    key={icon.id}
                                                    title={icon.label}
                                                    onClick={() => { updateTask(i, "icon", icon.id); setIconPickerFor(null); }}
                                                    className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
                                                      t.icon === icon.id
                                                        ? "bg-brand-green text-brand-dark"
                                                        : "hover:bg-brand-dark/10 text-brand-dark/50 bg-white"
                                                    }`}>
                                                    <TaskIcon id={icon.id} cls="w-4 h-4" />
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      <button
                                        onClick={() => setEditTasks(p => [...p, { id: Date.now(), title: "", zone, time: "5 мин", at: "", icon: "sparkles" }])}
                                        className="w-full py-2 rounded-[10px] border border-dashed border-black/12 text-[11px] font-black text-brand-dark/35 hover:text-brand-green hover:border-brand-green transition-colors flex items-center justify-center gap-1">
                                        <PlusIcon /> задачу
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Add zone */}
                            {unusedZones.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-dark/30 w-full mb-0.5">Добавить зону</span>
                                {unusedZones.map(z => (
                                  <button key={z}
                                    onClick={() => setEditTasks(p => [...p, { id: Date.now(), title: "", zone: z, time: "5 мин", at: "", icon: "sparkles" }])}
                                    className={`px-2.5 py-1.5 rounded-[10px] text-[10px] font-black uppercase transition-all flex items-center gap-1 ${ZONE_COLORS[z] ?? "bg-gray-100 text-gray-600"} hover:opacity-80`}>
                                    <PlusIcon /> {z}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      /* View mode */
                      <div className="space-y-3">
                        {Object.entries(byZone).map(([zone, tasks]) => (
                          <div key={zone}>
                            <div className="flex items-center gap-2 mb-1.5 px-1">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${ZONE_COLORS[zone] ?? "bg-gray-100 text-gray-600"}`}>{zone}</span>
                              <span className="text-[9px] text-brand-dark/30 font-black">{tasks.length} задач</span>
                            </div>
                            <div className="space-y-1">
                              {tasks.map((task, i) => (
                                <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] bg-[#f8f9f6]">
                                  <div className={`w-7 h-7 rounded-[10px] ${color.badge} flex items-center justify-center flex-shrink-0 text-white`}>
                                    <TaskIcon id={task.icon} cls="w-3.5 h-3.5" />
                                  </div>
                                  <span className="flex-1 text-sm font-semibold text-brand-dark">{task.title}</span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {task.at && <span className="px-2 py-0.5 rounded-full bg-brand-dark/8 text-[10px] font-black text-brand-dark/60">{task.at}</span>}
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-brand-dark/40"><ClockIcon />{task.time}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
