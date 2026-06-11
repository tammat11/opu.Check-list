"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });

const WORK_PIN = [{ lat: 43.2550, lng: 76.9126, label: "ул. Абая 12", color: "#7EC850" }];

const WorkMap = () => (
  <MapView pins={WORK_PIN} center={[43.2550, 76.9126]} zoom={15} className="h-[220px] w-full" />
);

// ─── Admin Navbar ─────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const ClipboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);

const AdminNavbar = ({
  onDashboard,
  onAdmin,
}: {
  onDashboard: () => void;
  onAdmin: () => void;
}) => (
  <div className="sticky top-0 z-50 px-4 pt-3 pb-2">
    {/* Floating island */}
    <div className="max-w-2xl mx-auto rounded-[26px] bg-brand-dark/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(26,29,30,0.28)] overflow-hidden">
      {/* Preview strip */}
      <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-white/5 border-b border-white/6">
        <EyeIcon />
        <span className="text-[9px] font-black uppercase tracking-[0.24em] text-white/45">
          Просмотр администратора
        </span>
        <span className="px-2 py-0.5 rounded-full bg-brand-green/25 text-brand-green text-[8px] font-black uppercase tracking-[0.15em]">
          Preview
        </span>
      </div>

      {/* Nav row */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        {/* Logo + label */}
        <div className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="IC Group" className="h-6 w-auto brightness-0 invert opacity-80" />
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] text-white/45 hover:text-white hover:bg-white/8 transition-all text-[10px] font-black uppercase tracking-[0.08em]">
            <GridIcon /> <span className="hidden sm:inline">Дашборд</span>
          </button>
          <button
            type="button"
            onClick={onAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] text-white/45 hover:text-white hover:bg-white/8 transition-all text-[10px] font-black uppercase tracking-[0.08em]">
            <UsersIcon /> <span className="hidden sm:inline">Админка</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[16px] bg-brand-green text-brand-dark text-[10px] font-black uppercase tracking-[0.08em] shadow-[0_2px_12px_rgba(143,198,64,0.35)]">
            <ClipboardIcon /> Уборка
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const ChevronLeft = ({ cls = "w-5 h-5" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const CameraIcon = ({ cls = "w-5 h-5" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
  </svg>
);
const PlusIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const TrashIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const PinIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <circle cx="12" cy="11" r="3" />
  </svg>
);
const CircleCheckIcon = ({ cls = "w-12 h-12" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const SparklesIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16zM5 15l.6 1.6L7 17l-1.4.4L5 19l-.6-1.6L3 17l1.4-.4L5 15z" />
  </svg>
);
const SinkTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M6 12V9a2 2 0 012-2h8a2 2 0 012 2v3M5 12v2a4 4 0 004 4h6a4 4 0 004-4v-2M12 4v2" />
  </svg>
);
const SurfaceTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7v10M19 7v10M7 11h10M7 15h6M3 17h18" />
  </svg>
);
const TrashTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6M4 7h16M7 7l1 12h8l1-12M10 10v6M14 10v6" />
  </svg>
);
const FloorTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 6h14M5 12h14M5 18h14M8 6v12M16 6v12" />
  </svg>
);
const DoorTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 21V5a2 2 0 012-2h7a2 2 0 012 2v16M6 21h12M13 12h.01" />
  </svg>
);
const MirrorTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="6" y="4" width="12" height="16" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6M9 16h6" />
  </svg>
);
const SuppliesTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6M10 4v4l-4 5v5h12v-5l-4-5V4" />
  </svg>
);
const MicrowaveTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h6M8 14h6M17 10v4" />
  </svg>
);
const LightTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const VacuumTaskIcon = ({ cls = "w-4 h-4" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 5h4v7a3 3 0 11-3-3h7m0 0v9m0-9h3" />
  </svg>
);

// ─── Zone icons ───────────────────────────────────────────────────────────────
const BathroomIcon = ({ cls = "w-6 h-6" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18M3 17a2 2 0 01-2-2v-1a4 4 0 014-4h14a4 4 0 014 4v1a2 2 0 01-2 2M3 17l-1 4h20l-1-4M7 10V6a2 2 0 012-2" />
  </svg>
);
const OfficeIcon = ({ cls = "w-6 h-6" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M9 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
  </svg>
);
const DoorIcon = ({ cls = "w-6 h-6" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V5a2 2 0 012-2h10a2 2 0 012 2v16m-7 0v-5a1 1 0 011-1h2a1 1 0 011 1v5M3 21h18" />
  </svg>
);
const KitchenIcon = ({ cls = "w-6 h-6" }: { cls?: string }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Zone {
  id: number;
  title: string;
  subtitle: string;
  tags: string[];
  Icon: React.FC<{ cls?: string }>;
  gradient: string;
  tasks: string[];
}

const ZONES: Zone[] = [
  {
    id: 1, title: "Санузлы", subtitle: "Туалеты и душевые",
    tags: ["УБОРНАЯ", "ПРИОРИТЕТ"],
    Icon: BathroomIcon,
    gradient: "from-blue-500 to-blue-600",
    tasks: ["Помыть унитазы", "Протереть раковины и краны", "Помыть полы", "Заменить мыло и бумагу", "Протереть зеркала", "Очистить мусорные корзины"],
  },
  {
    id: 2, title: "Зал / Офис", subtitle: "Рабочие и общие зоны",
    tags: ["ЗАЛ", "ЕЖЕДНЕВНО"],
    Icon: OfficeIcon,
    gradient: "from-emerald-500 to-green-600",
    tasks: ["Пропылесосить / подмести", "Протереть столы и стулья", "Вынести мусор", "Протереть подоконники", "Помыть полы"],
  },
  {
    id: 3, title: "Коридоры", subtitle: "Холлы и входные группы",
    tags: ["КОРИДОР"],
    Icon: DoorIcon,
    gradient: "from-orange-500 to-amber-600",
    tasks: ["Протереть двери и ручки", "Помыть полы коридора", "Протереть стёкла дверей", "Проверить освещение"],
  },
  {
    id: 4, title: "Кухня", subtitle: "Кухонные и обеденные зоны",
    tags: ["КУХНЯ"],
    Icon: KitchenIcon,
    gradient: "from-violet-500 to-purple-600",
    tasks: ["Помыть раковину", "Протереть столешницы и плиту", "Вынести мусор", "Протереть микроволновку"],
  },
];

const START_NEWS_LABELS = [
  "Сейчас в фокусе",
  "Следом по плану",
  "Не пропустить",
  "Под конец смены",
];

const getTaskIcon = (task: string) => {
  const value = task.toLowerCase();

  if (value.includes("раков")) return SinkTaskIcon;
  if (value.includes("стол") || value.includes("столешниц") || value.includes("плит")) return SurfaceTaskIcon;
  if (value.includes("мусор")) return TrashTaskIcon;
  if (value.includes("пол")) return FloorTaskIcon;
  if (value.includes("двер") || value.includes("ручк")) return DoorTaskIcon;
  if (value.includes("зеркал") || value.includes("стёкл") || value.includes("стекл")) return MirrorTaskIcon;
  if (value.includes("мыло") || value.includes("бумаг")) return SuppliesTaskIcon;
  if (value.includes("микроволнов")) return MicrowaveTaskIcon;
  if (value.includes("освещ")) return LightTaskIcon;
  if (value.includes("пропылесос") || value.includes("подмест")) return VacuumTaskIcon;

  return SparklesIcon;
};

type PhotoFile = { file: File; preview: string };
type Screen = "start" | "work" | "done";

// ─── Progress ring ────────────────────────────────────────────────────────────
const ProgressRing = ({ pct, size = 32 }: { pct: number; size?: number }) => {
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={2.5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#8fc640" strokeWidth={2.5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s ease", opacity: pct > 0 ? 1 : 0 }} />
    </svg>
  );
};

// ─── Photo section ────────────────────────────────────────────────────────────
const PhotoSection = ({
  label, photos, inputRef, onAdd, onRemove,
}: {
  label: string;
  photos: PhotoFile[];
  inputRef: React.RefObject<HTMLInputElement | null>;
  onAdd: (files: FileList | null) => void;
  onRemove: (i: number) => void;
}) => (
  <div className="rounded-[28px] border border-black/6 bg-[#fbfcf8] p-5">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-dark/45">
          {label === "ДО уборки" ? "До" : "После"}
        </div>
        <div className="mt-1.5 text-base font-black text-brand-dark">
          Фото {label.toLowerCase()}
        </div>
        <div className="mt-0.5 text-sm font-semibold text-brand-dark/55">
          Снимки состояния
        </div>
      </div>
      <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-brand-dark/45 shadow-premium">
        {photos.length} шт.
      </div>
    </div>

    <label className="flex cursor-pointer flex-col gap-4 rounded-[22px] border-2 border-dashed border-brand-green/30 bg-white p-5 transition hover:border-brand-green/55 hover:bg-[#fdfffa]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#f5f7f2] text-brand-green shadow-sm">
          <CameraIcon cls="w-5 h-5" />
        </div>
        <div className="text-sm font-black uppercase tracking-[0.1em] text-brand-dark">
          Загрузить фото {label.toLowerCase()}
        </div>
      </div>
      <div
        onClick={(e) => { e.preventDefault(); inputRef.current?.click(); }}
        className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[18px] bg-brand-green px-5 text-sm font-black uppercase tracking-[0.14em] text-brand-dark shadow-button"
      >
        <PlusIcon cls="w-4 h-4" /> Добавить фото {label.toLowerCase()}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { onAdd(e.target.files); e.target.value = ""; }} />
    </label>

    {photos.length > 0 && (
      <div className="mt-4 space-y-3">
        {photos.map((p, i) => (
          <div key={i} className="flex items-center gap-4 rounded-[22px] border border-black/6 bg-white p-3">
            <img src={p.preview} alt="" className="h-20 w-20 rounded-[16px] object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black text-brand-dark">{p.file.name}</div>
              <div className="mt-1 text-xs text-brand-dark/45">
                {(p.file.size / (1024 * 1024)).toFixed(2)} МБ
              </div>
            </div>
            <button type="button" onClick={() => onRemove(i)}
              className="rounded-2xl border border-red-100 bg-red-50 p-3 text-red-500 transition hover:bg-red-100"
              aria-label="Удалить фото">
              <TrashIcon cls="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WorkPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("start");
  const [gps, setGps] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean[]>>({});
  const [photosAfter, setPhotosAfter] = useState<PhotoFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const afterRef = useRef<HTMLInputElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => { setGps({ lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy) }); setGpsLoading(false); },
      () => setGpsLoading(false)
    );
  }, []);

  const selectedZone = ZONES.find(z => z.id === selectedZoneId);
  const tasks = selectedZone ? (checkedTasks[selectedZone.id] ?? new Array(selectedZone.tasks.length).fill(false)) : [];

  const selectZone = (id: number) => {
    setSelectedZoneId(id);
    setTimeout(() => {
      checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const toggleTask = (i: number) => {
    if (!selectedZone) return;
    setCheckedTasks(prev => ({ ...prev, [selectedZone.id]: tasks.map((v, idx) => idx === i ? !v : v) }));
  };

  const zoneProgress = (zoneId: number) => {
    const zone = ZONES.find(z => z.id === zoneId)!;
    const checks = checkedTasks[zoneId] ?? [];
    return { done: checks.filter(Boolean).length, total: zone.tasks.length };
  };

  const totalDone = ZONES.reduce((a, z) => a + zoneProgress(z.id).done, 0);
  const totalAll = ZONES.reduce((a, z) => a + z.tasks.length, 0);
  const overallPct = Math.round((totalDone / totalAll) * 100);

  const addPhotos = (files: FileList | null, type: "before" | "after") => {
    if (!files) return;
    const arr = Array.from(files).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    if (type === "after") {
      setPhotosAfter(p => [...p, ...arr]);
    }
  };
  const removePhoto = (i: number, type: "before" | "after") => {
    if (type === "after") {
      setPhotosAfter(prev => {
        URL.revokeObjectURL(prev[i].preview);
        return prev.filter((_, j) => j !== i);
      });
    }
  };

  // ── START ───────────────────────────────────────────────────────────────────
  if (screen === "start") return (
    <main className="min-h-screen bg-[#f5f7f2] flex flex-col">
      <AdminNavbar
        onDashboard={() => router.push("/app/dashboard")}
        onAdmin={() => router.push("/app/admin")}
      />

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-8 gap-5">

        {/* Hero card */}
        <div className="relative rounded-[30px] bg-brand-dark overflow-hidden px-6 py-6 shadow-[0_8px_40px_rgba(26,29,30,0.18)]">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-green/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-brand-green/8 pointer-events-none" />

          <div className="relative flex items-center gap-4 mb-5">
            <img src="/logo.png" alt="IC Group" className="h-12 w-auto brightness-0 invert opacity-90" />
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40 mb-0.5">Система контроля</p>
            </div>
          </div>

          <h1 className="text-[clamp(2.8rem,9vw,3.8rem)] font-black uppercase text-white leading-[0.88] tracking-tight mb-1">
            УБОРКА
          </h1>
          <p className="text-[clamp(1rem,3vw,1.2rem)] font-black uppercase text-brand-green tracking-[0.04em]">
            IC GROUP
          </p>

          {/* GPS inside hero */}
          <div className={`mt-5 flex items-center gap-3 rounded-[16px] px-4 py-2.5 ${gps ? "bg-brand-green/15" : "bg-white/6"}`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${gps ? "bg-brand-green" : gpsLoading ? "bg-white/30 animate-pulse" : "bg-red-400"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${gps ? "text-brand-green" : "text-white/40"}`}>
                {gpsLoading ? "Определение координат..." : gps ? "Геолокация определена" : "Геолокация недоступна"}
              </p>
              {gps && (
                <p className="text-[11px] text-white/45 mt-0.5 truncate font-medium">
                  {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)} · ±{gps.acc} м
                </p>
              )}
            </div>
            <PinIcon cls={`w-4 h-4 shrink-0 ${gps ? "text-brand-green" : "text-white/20"}`} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Сегодня", value: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" }), sub: new Date().toLocaleDateString("ru-RU", { weekday: "short" }) },
            { label: "Зоны", value: String(ZONES.length), sub: "зоны уборки" },
            { label: "Задачи", value: String(totalAll), sub: "пунктов" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-[22px] px-3 py-4 text-center border border-black/5 shadow-premium">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/35 mb-1">{s.label}</p>
              <p className="text-2xl font-black text-brand-dark leading-none">{s.value}</p>
              <p className="text-[10px] font-semibold text-brand-dark/30 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="bg-white rounded-[26px] border border-black/5 shadow-premium overflow-hidden">
          <div className="px-4 py-2.5 border-b border-black/5 bg-[#fbfcf8] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-dark/40">Объект сегодня</p>
              <p className="mt-0.5 text-[14px] font-black text-brand-dark">ул. Абая 12</p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-brand-green/12 text-[10px] font-black text-brand-green">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              В зоне
            </span>
          </div>
          <WorkMap />
        </div>

        {/* CTA */}
        <button onClick={() => setScreen("work")}
          className="w-full min-h-[60px] rounded-[22px] bg-brand-dark text-white font-black uppercase tracking-[0.18em] text-sm hover:bg-brand-green hover:text-brand-dark transition-all duration-300 shadow-[0_4px_24px_rgba(26,29,30,0.22)]">
          Начать рабочий день →
        </button>

        <button onClick={() => router.push("/")}
          className="w-full min-h-[44px] text-sm font-semibold text-brand-dark/35 hover:text-brand-dark transition-colors duration-200">
          ← На главную
        </button>

      </div>
    </main>
  );

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (screen === "done") return (
    <main className="min-h-screen bg-brand-light flex flex-col">
      <AdminNavbar
        onDashboard={() => router.push("/app/dashboard")}
        onAdmin={() => router.push("/app/admin")}
      />
      <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-24 h-24 rounded-full bg-brand-green flex items-center justify-center mx-auto mb-6 text-white shadow-[0_8px_30px_rgba(143,198,64,0.4)]">
          <CircleCheckIcon cls="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black uppercase text-brand-dark mb-2 tracking-tight">Готово!</h2>
        <p className="text-sm font-semibold text-brand-dark/50 mb-8">Отчёт отправлен куратору</p>

        <div className="rounded-[28px] border border-black/6 bg-white p-5 mb-6 text-left space-y-3 shadow-premium">
          {ZONES.map(z => {
            const { done, total } = zoneProgress(z.id);
            return (
              <div key={z.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${z.gradient} flex items-center justify-center`}>
                    <z.Icon cls="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-black text-brand-dark">{z.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-black ${done === total ? "text-brand-green" : "text-brand-dark/30"}`}>{done}/{total}</span>
                  {done === total && <CheckIcon cls="w-3.5 h-3.5 text-brand-green" />}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => { setScreen("start"); setSelectedZoneId(null); setCheckedTasks({}); setPhotosAfter([]); }}
          className="w-full min-h-[56px] rounded-[22px] bg-brand-green text-brand-dark font-black uppercase tracking-[0.16em] text-sm hover:bg-brand-dark hover:text-white transition-colors duration-300 shadow-button">
          Новая смена
        </button>
      </div>
      </div>
    </main>
  );

  // ── WORK ────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#f5f7f2]">
      <AdminNavbar
        onDashboard={() => router.push("/app/dashboard")}
        onAdmin={() => router.push("/app/admin")}
      />
      <div className="pb-16">
      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">

        {/* Header card */}
        <div className="relative rounded-[28px] bg-brand-dark overflow-hidden px-5 py-5 shadow-[0_6px_30px_rgba(26,29,30,0.16)]">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-brand-green/10 pointer-events-none" />
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen("start")}
              className="w-10 h-10 rounded-[14px] bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors shrink-0">
              <ChevronLeft cls="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-black uppercase text-white leading-none tracking-tight">УБОРКА</h1>
              <p className="text-xs font-black uppercase text-brand-green tracking-[0.1em] mt-0.5">РАБОЧИЙ ДЕНЬ</p>
            </div>
            <img src="/logo.png" alt="IC Group" className="h-9 w-auto brightness-0 invert opacity-80 shrink-0" />
          </div>

          {/* GPS inside header */}
          <div className={`mt-4 flex items-center gap-3 rounded-[16px] px-4 py-2.5 ${gps ? "bg-brand-green/15" : "bg-white/6"}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${gps ? "bg-brand-green" : gpsLoading ? "bg-white/30 animate-pulse" : "bg-red-400"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${gps ? "text-brand-green" : "text-white/40"}`}>
                {gpsLoading ? "Определение координат..." : gps ? "Геолокация определена" : "Геолокация недоступна"}
              </p>
              {gps && <p className="text-[10px] text-white/40 mt-0.5 font-medium truncate">{gps.lat.toFixed(5)}, {gps.lng.toFixed(5)} · ±{gps.acc} м</p>}
            </div>
            <PinIcon cls={`w-3.5 h-3.5 shrink-0 ${gps ? "text-brand-green" : "text-white/20"}`} />
          </div>
        </div>

        {/* Overall progress — always visible */}
        <div className="rounded-[24px] border border-black/5 bg-white px-5 py-4 shadow-premium">
          <div className="flex items-center gap-4 mb-3">
            {/* Big percent */}
            <div className="shrink-0 w-14 h-14 rounded-[18px] flex flex-col items-center justify-center bg-brand-green/10">
              <span className="text-xl font-black text-brand-green tabular-nums leading-none">{overallPct}%</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40">Прогресс смены</span>
                <span className="text-xs font-black text-brand-dark">
                  <span className="text-brand-green">{totalDone}</span>
                  <span className="text-brand-dark/30"> / {totalAll}</span>
                </span>
              </div>
              <div className="w-full bg-brand-dark/6 rounded-full h-2.5 overflow-hidden">
                <div className="bg-brand-green h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${overallPct}%` }} />
              </div>
            </div>
          </div>
          {/* Per-zone mini indicators */}
          <div className="grid grid-cols-4 gap-2">
            {ZONES.map(zone => {
              const { done, total } = zoneProgress(zone.id);
              const pct = Math.round((done / total) * 100);
              const allDone = done === total;
              return (
                <button key={zone.id} onClick={() => selectZone(zone.id)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group">
                  <div className="relative w-full">
                    <div className="w-full bg-brand-dark/6 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-brand-green" : "bg-brand-green/60"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${allDone ? "bg-brand-green" : pct > 0 ? "bg-brand-green/50" : "bg-brand-dark/15"}`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-brand-dark/40 group-hover:text-brand-dark transition-colors truncate">
                      {zone.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone grid */}
        <div>
          <p className="text-[10px] font-black tracking-[0.24em] text-brand-dark/40 uppercase mb-3 px-1">Выберите зону</p>
          <div className="grid grid-cols-2 gap-3">
            {ZONES.map(zone => {
              const { done, total } = zoneProgress(zone.id);
              const pct = Math.round((done / total) * 100);
              const allDone = done === total;
              const isSelected = selectedZoneId === zone.id;
              return (
                <button key={zone.id} onClick={() => selectZone(zone.id)}
                  className={`relative text-left rounded-[24px] p-4 transition-all duration-200 cursor-pointer overflow-hidden ${
                    allDone ? "bg-brand-green" : isSelected ? `bg-gradient-to-br ${zone.gradient}` : "bg-white border border-black/6"
                  }`}
                  style={{
                    boxShadow: isSelected ? "0 8px 28px rgba(0,0,0,0.18)" : "0 1px 6px rgba(0,0,0,0.05)",
                    minHeight: "128px",
                  }}>
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center mb-3 shadow-sm ${isSelected || allDone ? "bg-white/25" : `bg-gradient-to-br ${zone.gradient}`}`}>
                    <zone.Icon cls="w-6 h-6 text-white" />
                  </div>
                  <p className={`font-black text-sm leading-tight ${isSelected || allDone ? "text-white" : "text-brand-dark"}`}>{zone.title}</p>
                  <p className={`text-[11px] mt-1 font-semibold ${isSelected || allDone ? "text-white/70" : "text-brand-dark/40"}`}>{done}/{total} задач</p>
                  {/* Progress indicator top-right */}
                  <div className="absolute top-3 right-3">
                    {allDone
                      ? <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center">
                          <CheckIcon cls="w-4 h-4 text-white" />
                        </div>
                      : pct > 0
                        ? <ProgressRing pct={pct} size={28} />
                        : <div className="w-5 h-5 rounded-full border-2 border-brand-dark/12" />
                    }
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected zone detail */}
        {selectedZone && (
          <div ref={checklistRef} className="space-y-3 pt-1">
            {/* Zone header */}
            <div className={`relative rounded-[28px] overflow-hidden px-5 py-5 bg-gradient-to-br ${selectedZone.gradient} shadow-[0_6px_24px_rgba(0,0,0,0.15)]`}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-black/10 pointer-events-none" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedZone.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-black/15 text-white/90 text-[9px] font-black tracking-[0.18em] uppercase">{tag}</span>
                    ))}
                  </div>
                  <p className="text-2xl font-black text-white leading-tight">{selectedZone.title}</p>
                  <p className="text-xs text-white/70 mt-1 font-semibold">{selectedZone.subtitle}</p>
                </div>
                <div className="shrink-0 bg-black/15 rounded-[18px] px-3 py-2 text-center min-w-[52px]">
                  <p className="text-xl font-black text-white leading-none">{tasks.filter(Boolean).length}</p>
                  <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.1em] mt-0.5">из {tasks.length}</p>
                </div>
              </div>
              {/* Mini progress bar */}
              <div className="relative mt-4 bg-black/15 rounded-full h-1.5 overflow-hidden">
                <div className="bg-white/80 h-full rounded-full transition-all duration-500"
                  style={{ width: `${tasks.length ? Math.round((tasks.filter(Boolean).length / tasks.length) * 100) : 0}%` }} />
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-[28px] border border-black/6 bg-white overflow-hidden shadow-premium">
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                <p className="text-[10px] font-black tracking-[0.22em] text-brand-dark/40 uppercase">Чек-лист</p>
                <span className="text-[10px] font-black text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-full">
                  {tasks.filter(Boolean).length}/{tasks.length}
                </span>
              </div>
              {selectedZone.tasks.map((task, i) => (
                <button key={i} onClick={() => toggleTask(i)}
                  className={`w-full flex items-center gap-4 px-5 min-h-[58px] text-left border-b last:border-0 border-black/5 transition-colors duration-150 cursor-pointer ${tasks[i] ? "bg-brand-green/5" : "hover:bg-[#f9faf7]"}`}>
                  {(() => {
                    const TaskIcon = getTaskIcon(task);
                    return (
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${tasks[i] ? "bg-brand-green/12 text-brand-green" : "bg-brand-dark/[0.04] text-brand-dark/45"}`}>
                        <TaskIcon cls="w-4 h-4" />
                      </div>
                    );
                  })()}
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${tasks[i] ? "bg-brand-green border-brand-green shadow-[0_2px_8px_rgba(143,198,64,0.4)]" : "border-brand-dark/15"}`}>
                    {tasks[i] && <CheckIcon cls="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm font-semibold transition-colors duration-150 flex-1 ${tasks[i] ? "line-through text-brand-dark/25" : "text-brand-dark"}`}>{task}</span>
                  {tasks[i] && (
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-brand-green shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Photos */}
            <PhotoSection
              label="ПОСЛЕ уборки"
              photos={photosAfter}
              inputRef={afterRef}
              onAdd={f => addPhotos(f, "after")}
              onRemove={i => removePhoto(i, "after")}
            />

            {/* Submit */}
            <button
              onClick={async () => { setSubmitting(true); await new Promise(r => setTimeout(r, 900)); setScreen("done"); setSubmitting(false); }}
              disabled={submitting}
              className={`w-full min-h-[60px] rounded-[22px] font-black uppercase tracking-[0.16em] text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mb-6 ${
                submitting ? "bg-brand-dark/8 text-brand-dark/30 cursor-not-allowed" : "bg-brand-dark text-white hover:bg-brand-green hover:text-brand-dark shadow-[0_4px_20px_rgba(26,29,30,0.2)]"
              }`}>
              {submitting
                ? <><span className="w-4 h-4 border-2 border-brand-dark/20 border-t-brand-green rounded-full animate-spin" /> Отправка...</>
                : "ОТПРАВИТЬ"}
            </button>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}
