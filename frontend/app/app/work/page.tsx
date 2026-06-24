"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { API_BASE, canAccessWork, fetchCurrentUser, logout as logoutUser } from "../../lib/auth";

const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });
const DEFAULT_GEOFENCE_RADIUS_METERS = 200;

const WORK_PIN = [{ lat: 43.2550, lng: 76.9126, label: "ул. Абая 12", color: "#7EC850" }];

const WorkMap = ({
  pins,
  radiusMeters,
  center,
}: {
  pins: { lat: number; lng: number; label: string; color: string }[];
  radiusMeters: number;
  center: [number, number];
}) => (
  <MapView
    pins={pins}
    circles={pins[0] ? [{ lat: pins[0].lat, lng: pins[0].lng, radius: radiusMeters, color: "#7EC850" }] : []}
    center={center}
    zoom={15}
    className="h-[220px] w-full"
  />
);

// ─── Admin Navbar ─────────────────────────────────────────────────────────────
const distanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadiusM = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * earthRadiusM * Math.asin(Math.sqrt(a));
};

const EyeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
  </svg>
);

const AdminNavbar = ({ onLogout }: { onLogout: () => void }) => {
  const userName = typeof window !== "undefined" ? localStorage.getItem("opu-user-name") : null;

  return (
    <div className="sticky top-0 z-50 px-4 pt-3 pb-2">
      <div className="max-w-2xl mx-auto rounded-[26px] bg-brand-dark/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(26,29,30,0.28)] overflow-hidden">
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-white/5 border-b border-white/6">
          <EyeIcon />
          <span className="text-[9px] font-black uppercase tracking-[0.24em] text-white/45">
            Профиль клинера
          </span>
          <span className="px-2 py-0.5 rounded-full bg-brand-green/25 text-brand-green text-[8px] font-black uppercase tracking-[0.15em]">
            Online
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="IC Group" className="h-6 w-auto brightness-0 invert opacity-80" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-[16px] bg-brand-green text-brand-dark text-[10px] font-black uppercase tracking-[0.08em] shadow-[0_2px_12px_rgba(143,198,64,0.35)]"
            >
              <UsersIcon />
              <span className="max-w-[110px] truncate">{userName || "Профиль"}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[14px] border border-white/10 bg-white/6 text-white/75 transition-colors hover:bg-white/12 hover:text-white"
              aria-label="Выйти из аккаунта"
              title="Выйти"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

interface LiveZone extends Zone {
  taskIds: number[];
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

const DEFAULT_ZONE_META = {
  tags: ["ЗОНА"],
  Icon: SparklesIcon,
  gradient: "from-slate-500 to-slate-600",
};

const getZoneMeta = (title: string) => {
  const match = ZONES.find((zone) => zone.title === title);
  return match
    ? { tags: match.tags, Icon: match.Icon, gradient: match.gradient }
    : DEFAULT_ZONE_META;
};

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

void START_NEWS_LABELS;

type PhotoFile = { file: File; preview: string };
type Screen = "start" | "work" | "done";
type TaskPhotoBucket = { before: PhotoFile[]; after: PhotoFile[] };
type DraftStoredPhoto = { name: string; type: string; blob: Blob };
type DraftTaskPhotos = Record<string, { before: DraftStoredPhoto[]; after: DraftStoredPhoto[] }>;
type WorkDraftMeta = {
  checklistId: number;
  selectedZoneId: number | null;
  checkedTasks: Record<number, boolean[]>;
};
type WorkDraft = WorkDraftMeta & {
  taskPhotos: DraftTaskPhotos;
};

const DRAFT_DB_NAME = "opu-work-drafts";
const DRAFT_META_STORE_NAME = "drafts";
const DRAFT_PHOTO_STORE_NAME = "draftPhotos";
const MAX_PHOTO_BYTES = 250 * 1024;

const openDraftDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFT_DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DRAFT_META_STORE_NAME)) {
        db.createObjectStore(DRAFT_META_STORE_NAME, { keyPath: "checklistId" });
      }
      if (!db.objectStoreNames.contains(DRAFT_PHOTO_STORE_NAME)) {
        db.createObjectStore(DRAFT_PHOTO_STORE_NAME, { keyPath: "checklistId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const saveDraftMeta = async (draft: WorkDraftMeta) => {
  const db = await openDraftDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DRAFT_META_STORE_NAME, "readwrite");
    tx.objectStore(DRAFT_META_STORE_NAME).put(draft);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

const saveDraftPhotos = async (checklistId: number, taskPhotos: DraftTaskPhotos) => {
  const db = await openDraftDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DRAFT_PHOTO_STORE_NAME, "readwrite");
    tx.objectStore(DRAFT_PHOTO_STORE_NAME).put({ checklistId, taskPhotos });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

const loadDraftRecord = async (checklistId: number): Promise<WorkDraft | null> => {
  const db = await openDraftDb();
  const result = await new Promise<WorkDraft | null>((resolve, reject) => {
    const tx = db.transaction([DRAFT_META_STORE_NAME, DRAFT_PHOTO_STORE_NAME], "readonly");
    const metaRequest = tx.objectStore(DRAFT_META_STORE_NAME).get(checklistId);
    const photoRequest = tx.objectStore(DRAFT_PHOTO_STORE_NAME).get(checklistId);
    tx.oncomplete = () => {
      const meta = (metaRequest.result as WorkDraftMeta | undefined) ?? null;
      const photoRecord = (photoRequest.result as { checklistId: number; taskPhotos: DraftTaskPhotos } | undefined) ?? null;
      if (!meta) {
        resolve(null);
        return;
      }
      resolve({
        ...meta,
        taskPhotos: photoRecord?.taskPhotos ?? {},
      });
    };
    tx.onerror = () => reject(tx.error);
    metaRequest.onerror = () => reject(metaRequest.error);
    photoRequest.onerror = () => reject(photoRequest.error);
  });
  db.close();
  return result;
};

const clearDraftRecord = async (checklistId: number) => {
  const db = await openDraftDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([DRAFT_META_STORE_NAME, DRAFT_PHOTO_STORE_NAME], "readwrite");
    tx.objectStore(DRAFT_META_STORE_NAME).delete(checklistId);
    tx.objectStore(DRAFT_PHOTO_STORE_NAME).delete(checklistId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });

const compressImageFile = async (file: File, maxBytes = MAX_PHOTO_BYTES): Promise<File> => {
  if (!file.type.startsWith("image/") || file.size <= maxBytes) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = objectUrl;
    });

    let width = image.naturalWidth || image.width;
    let height = image.naturalHeight || image.height;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context || !width || !height) {
      return file;
    }

    for (let step = 0; step < 8; step += 1) {
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42, 0.34]) {
        const blob = await canvasToBlob(canvas, "image/jpeg", quality);
        if (blob && blob.size <= maxBytes) {
          return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
        }
      }

      width *= 0.85;
      height *= 0.85;
    }

    const fallbackBlob = await canvasToBlob(canvas, "image/jpeg", 0.3);
    if (fallbackBlob) {
      return new File([fallbackBlob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return file;
};

const TaskPhotoSection = ({
  title,
  photos,
  onAdd,
  onRemove,
}: {
  title: "ДО" | "ПОСЛЕ";
  photos: PhotoFile[];
  onAdd: (files: FileList | null) => void;
  onRemove: (i: number) => void;
}) => (
  <div className="rounded-[16px] border border-black/6 bg-[#fbfcf8] p-3">
    <div className="mb-2 flex items-center justify-between gap-3">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40">{title}</span>
      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-brand-dark/40 shadow-premium">
        {photos.length} шт.
      </span>
    </div>

    <label className="flex cursor-pointer items-center gap-2 rounded-[14px] border border-dashed border-brand-green/35 bg-white px-3 py-3 transition hover:border-brand-green/55">
      <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#f5f7f2] text-brand-green">
        <CameraIcon cls="w-4 h-4" />
      </div>
      <div className="flex-1 text-[11px] font-black uppercase tracking-[0.08em] text-brand-dark">
        Добавить фото {title.toLowerCase()}
      </div>
      <div className="inline-flex h-9 items-center justify-center rounded-[12px] bg-brand-green px-3 text-[10px] font-black uppercase tracking-[0.12em] text-brand-dark">
        <PlusIcon cls="w-3.5 h-3.5" />
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          onAdd(e.target.files);
          e.target.value = "";
        }}
      />
    </label>

    {photos.length > 0 && (
      <div className="mt-2 grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div key={`${photo.file.name}-${index}`} className="relative overflow-hidden rounded-[14px] border border-black/6 bg-white">
            <img src={photo.preview} alt="" className="h-20 w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white"
              aria-label="Удалить фото"
            >
              <TrashIcon cls="w-3 h-3" />
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
  const [authReady, setAuthReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("start");
  const [gps, setGps] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [zonesData, setZonesData] = useState<LiveZone[]>([]);
  const [checklistId, setChecklistId] = useState<number | null>(null);
  const [workObjectName, setWorkObjectName] = useState("ул. Абая 12");
  const [workAddress, setWorkAddress] = useState("");
  const [workPins, setWorkPins] = useState(WORK_PIN);
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState(DEFAULT_GEOFENCE_RADIUS_METERS);
  const [geoError, setGeoError] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean[]>>({});
  const [taskPhotos, setTaskPhotos] = useState<Record<string, TaskPhotoBucket>>({});
  const [draftChecks, setDraftChecks] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/login");
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Геолокация не поддерживается на этом устройстве.");
      setGpsLoading(false);
      return;
    }

    setGpsLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      p => {
        const nextGps = { lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy) };
        const token = localStorage.getItem("token");
        setGps(nextGps);
        setGpsLoading(false);

        if (token) {
          fetch(`${API_BASE}/location`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude: nextGps.lat,
              longitude: nextGps.lng,
              accuracy: nextGps.acc,
            }),
          }).catch(() => {});
        }
      },
      () => {
        setGeoError("Разрешите доступ к геолокации, чтобы начать рабочий день.");
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

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
      });
  }, [router]);

  useEffect(() => {
    if (!authReady) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetch(`${API_BASE}/dashboard/work`, {
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
        if (typeof data.objectName === "string" && data.objectName) {
          setWorkObjectName(data.objectName);
        }
        if (typeof data.address === "string") {
          setWorkAddress(data.address);
        }
        if (typeof data.geofenceRadiusMeters === "number" && data.geofenceRadiusMeters > 0) {
          setGeofenceRadiusMeters(data.geofenceRadiusMeters);
        }
        setChecklistId(typeof data.checklistId === "number" ? data.checklistId : null);
        if (typeof data.lat === "number" && typeof data.lng === "number") {
          setWorkPins([
            {
              lat: data.lat,
              lng: data.lng,
              label: data.objectName || "Объект",
              color: "#7EC850",
            },
          ]);
        }
        if (Array.isArray(data.zones)) {
          if (data.zones.length === 0) {
            setZonesData([]);
            setCheckedTasks({});
            setSelectedZoneId(null);
            return;
          }

          const nextZones: LiveZone[] = data.zones.map((zone: { id: number; title: string; subtitle?: string; tasks: { id: number; title: string; done: boolean }[] }) => {
            const meta = getZoneMeta(zone.title);
            return {
              id: zone.id,
              title: zone.title,
              subtitle: zone.subtitle || data.objectName || "",
              tags: meta.tags,
              Icon: meta.Icon,
              gradient: meta.gradient,
              tasks: zone.tasks.map((task) => task.title),
              taskIds: zone.tasks.map((task) => task.id),
            };
          });

          const nextChecked = Object.fromEntries(
            data.zones.map((zone: { id: number; tasks: { done: boolean }[] }) => [
              zone.id,
              zone.tasks.map((task) => task.done),
            ])
          );

          setZonesData(nextZones);
          setCheckedTasks(nextChecked);
        }
      })
      .catch(() => {});
  }, [authReady, router]);

  const zoneProgress = (zoneId: number) => {
    const zone = zonesData.find(z => z.id === zoneId)!;
    const checks = checkedTasks[zoneId] ?? [];
    return { done: checks.filter(Boolean).length, total: zone.tasks.length };
  };

  const totalDone = zonesData.reduce((a, z) => a + zoneProgress(z.id).done, 0);
  const totalAll = zonesData.reduce((a, z) => a + z.tasks.length, 0);
  const overallPct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;
  const objectPin = workPins[0] ?? null;
  const rawDistanceToObject = gps && objectPin
    ? distanceMeters(gps.lat, gps.lng, objectPin.lat, objectPin.lng)
    : null;
  const effectiveRadiusMeters = geofenceRadiusMeters + Math.min(gps?.acc ?? 0, 75);
  const isWithinWorkZone = Boolean(rawDistanceToObject !== null && rawDistanceToObject <= effectiveRadiusMeters);
  const startBlockedReason = !checklistId || totalAll === 0
    ? "На сегодня нет назначенной смены. Обратитесь к администратору."
    : gpsLoading
      ? "Определяем вашу геопозицию..."
      : !gps
        ? "Разрешите доступ к геолокации, чтобы начать рабочий день."
        : !isWithinWorkZone
          ? `До рабочей зоны ${Math.max(Math.round((rawDistanceToObject ?? 0) - effectiveRadiusMeters), 0)} м. Подойдите ближе к объекту.`
          : "";
  const taskPhotoKey = (zoneId: number, taskIndex: number) => `${zoneId}-${taskIndex}`;
  const getTaskPhotos = (zoneId: number, taskIndex: number): TaskPhotoBucket =>
    taskPhotos[taskPhotoKey(zoneId, taskIndex)] ?? { before: [], after: [] };
  const flatSteps = zonesData.flatMap((zone) =>
    zone.tasks.map((task, taskIndex) => ({
      zoneId: zone.id,
      zoneTitle: zone.title,
      zoneSubtitle: zone.subtitle,
      zoneTags: zone.tags,
      zoneIcon: zone.Icon,
      zoneGradient: zone.gradient,
      task,
      taskIndex,
      itemId: zone.taskIds[taskIndex],
      done: Boolean((checkedTasks[zone.id] ?? [])[taskIndex]),
      zoneDone: zoneProgress(zone.id).done,
      zoneTotal: zone.tasks.length,
    }))
  );
  const currentStep = flatSteps.find((step) => !step.done) ?? null;
  const currentStepNumber = currentStep ? flatSteps.findIndex((step) => step === currentStep) + 1 : flatSteps.length;
  const currentStepKey = currentStep ? taskPhotoKey(currentStep.zoneId, currentStep.taskIndex) : null;
  const currentStepPhotos = currentStep ? getTaskPhotos(currentStep.zoneId, currentStep.taskIndex) : { before: [], after: [] };
  const currentStepChecked = currentStepKey ? Boolean(draftChecks[currentStepKey]) : false;
  const isLastPendingStep = flatSteps.filter((step) => !step.done).length === 1;

  const addTaskPhotos = async (zoneId: number, taskIndex: number, type: "before" | "after", files: FileList | null) => {
    if (!files) return;
    const compressedFiles = await Promise.all(Array.from(files).map((file) => compressImageFile(file)));
    const arr = compressedFiles.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    const key = taskPhotoKey(zoneId, taskIndex);
    setTaskPhotos((prev) => {
      const current = prev[key] ?? { before: [], after: [] };
      return {
        ...prev,
        [key]: {
          ...current,
          [type]: [...current[type], ...arr],
        },
      };
    });
  };

  const removeTaskPhoto = (zoneId: number, taskIndex: number, type: "before" | "after", photoIndex: number) => {
    const key = taskPhotoKey(zoneId, taskIndex);
    setTaskPhotos((prev) => {
      const current = prev[key];
      if (!current) return prev;
      URL.revokeObjectURL(current[type][photoIndex].preview);
      return {
        ...prev,
        [key]: {
          ...current,
          [type]: current[type].filter((_, index) => index !== photoIndex),
        },
      };
    });
  };

  const clearTaskPhotoBucket = (zoneId: number, taskIndex: number) => {
    const key = taskPhotoKey(zoneId, taskIndex);
    setTaskPhotos((prev) => {
      const current = prev[key];
      if (!current) return prev;
      current.before.forEach((photo) => URL.revokeObjectURL(photo.preview));
      current.after.forEach((photo) => URL.revokeObjectURL(photo.preview));
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const uploadPhotoFiles = async (photos: PhotoFile[], token: string) =>
    (await Promise.all(photos.map((photo) => uploadPhoto(photo, token)))).filter(Boolean);

  useEffect(() => {
    if (!checklistId) return;
    let cancelled = false;

    loadDraftRecord(checklistId)
      .then((draft) => {
        if (!draft || cancelled) return;
        setCheckedTasks(draft.checkedTasks);
        setSelectedZoneId(draft.selectedZoneId);
        const restoredTaskPhotos: Record<string, TaskPhotoBucket> = {};
        for (const [key, bucket] of Object.entries(draft.taskPhotos || {})) {
          restoredTaskPhotos[key] = {
            before: bucket.before.map((photo) => {
              const file = new File([photo.blob], photo.name, { type: photo.type });
              return { file, preview: URL.createObjectURL(file) };
            }),
            after: bucket.after.map((photo) => {
              const file = new File([photo.blob], photo.name, { type: photo.type });
              return { file, preview: URL.createObjectURL(file) };
            }),
          };
        }
        setTaskPhotos(restoredTaskPhotos);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [checklistId]);

  useEffect(() => {
    if (!checklistId) return;
    const draft: WorkDraftMeta = {
      checklistId,
      selectedZoneId,
      checkedTasks,
    };
    const timeoutId = window.setTimeout(() => {
      saveDraftMeta(draft).catch(() => {});
    }, 120);
    return () => window.clearTimeout(timeoutId);
  }, [checklistId, selectedZoneId, checkedTasks]);

  useEffect(() => {
    if (!checklistId) return;
    const serializedPhotos: DraftTaskPhotos = Object.fromEntries(
      Object.entries(taskPhotos).map(([key, bucket]) => [
        key,
        {
          before: bucket.before.map((photo) => ({
            name: photo.file.name,
            type: photo.file.type,
            blob: photo.file,
          })),
          after: bucket.after.map((photo) => ({
            name: photo.file.name,
            type: photo.file.type,
            blob: photo.file,
          })),
        },
      ])
    );
    const timeoutId = window.setTimeout(() => {
      saveDraftPhotos(checklistId, serializedPhotos).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timeoutId);
  }, [checklistId, taskPhotos]);

  const saveLocation = async (token: string) => {
    if (!gps) return;

    await fetch(`${API_BASE}/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        latitude: gps.lat,
        longitude: gps.lng,
        accuracy: gps.acc,
      }),
    }).catch(() => {});
  };

  const uploadPhoto = async (photo: PhotoFile, token: string) => {
    const formData = new FormData();
    formData.append("file", photo.file);

    const res = await fetch(`${API_BASE}/upload/checklist-photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Не удалось загрузить фото. Проверьте файл и попробуйте снова.");
    }

    const data = await res.json();
    return String(data.url || "");
  };

  const submitCurrentStep = async () => {
    setSubmitError("");

    if (!currentStep || !checklistId) {
      setSubmitError("На сегодня нет назначенной смены. Обратитесь к администратору.");
      return;
    }

    if (!currentStepChecked) {
      setSubmitError("Отметьте текущий пункт перед переходом к следующему шагу.");
      return;
    }

    if (currentStepPhotos.before.length === 0 || currentStepPhotos.after.length === 0) {
      setSubmitError("Прикрепите минимум одно фото до и одно фото после.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      await logoutUser();
      router.push("/auth/login");
      return;
    }

    setSubmitting(true);
    try {
      await saveLocation(token);
      const taskBeforeUrls = await uploadPhotoFiles(currentStepPhotos.before, token);
      const taskAfterUrls = await uploadPhotoFiles(currentStepPhotos.after, token);

      const progressRes = await fetch(`${API_BASE}/checklists/${checklistId}/items/${currentStep.itemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: true,
          note: [
            `Шаг ${currentStepNumber}: ${currentStep.task}`,
            currentStep.zoneTitle,
            taskBeforeUrls.length ? `Before: ${taskBeforeUrls.join(", ")}` : "",
            taskAfterUrls.length ? `After: ${taskAfterUrls.join(", ")}` : "",
          ].filter(Boolean).join("\n"),
          photo_url: taskAfterUrls[0] || null,
        }),
      });

      if (!progressRes.ok) {
        const error = await progressRes.json().catch(() => ({}));
        throw new Error(error.detail || "Не удалось сохранить текущий шаг.");
      }

      setCheckedTasks((prev) => ({
        ...prev,
        [currentStep.zoneId]: (prev[currentStep.zoneId] ?? []).map((value, index) =>
          index === currentStep.taskIndex ? true : value
        ),
      }));
      setDraftChecks((prev) => {
        const next = { ...prev };
        if (currentStepKey) {
          delete next[currentStepKey];
        }
        return next;
      });
      clearTaskPhotoBucket(currentStep.zoneId, currentStep.taskIndex);

      if (isLastPendingStep) {
        const reportNotes = [
          workAddress || workObjectName,
          gps ? `GPS: ${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}; accuracy ${gps.acc}m` : "GPS: not available",
          `Completed tasks: ${totalAll}/${totalAll}`,
        ].filter(Boolean).join("\n");

        const completeRes = await fetch(`${API_BASE}/checklists/${checklistId}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: reportNotes }),
        });

        if (!completeRes.ok) {
          const error = await completeRes.json().catch(() => ({}));
          throw new Error(error.detail || "Не удалось завершить смену.");
        }

        await clearDraftRecord(checklistId);
        setTaskPhotos({});
        setScreen("done");
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Не удалось сохранить текущий шаг.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── START ───────────────────────────────────────────────────────────────────
  if (!authReady) {
    return (
      <main className="min-h-screen bg-[#f5f7f2] flex items-center justify-center">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-dark/35">Проверка доступа...</p>
      </main>
    );
  }

  if (screen === "start") return (
    <main className="min-h-screen bg-[#f5f7f2] flex flex-col">
      <AdminNavbar onLogout={handleLogout} />

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
              {!gps && geoError && (
                <p className="text-[11px] text-red-300/90 mt-0.5 font-medium">{geoError}</p>
              )}
            </div>
            <PinIcon cls={`w-4 h-4 shrink-0 ${gps ? "text-brand-green" : "text-white/20"}`} />
          </div>
          {!gps && !gpsLoading && (
            <button
              type="button"
              onClick={requestLocation}
              className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-[14px] border border-white/10 bg-white/8 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/14"
            >
              Разрешить геолокацию
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Сегодня", value: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" }), sub: new Date().toLocaleDateString("ru-RU", { weekday: "short" }) },
            { label: "Зоны", value: String(zonesData.length), sub: "зоны уборки" },
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
              <p className="mt-0.5 text-[14px] font-black text-brand-dark">{workObjectName}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-brand-dark/40">
                {workAddress || workObjectName} · радиус {geofenceRadiusMeters} м
              </p>
            </div>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-[10px] font-black ${
              isWithinWorkZone ? "bg-brand-green/12 text-brand-green" : "bg-red-50 text-red-500"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isWithinWorkZone ? "bg-brand-green animate-pulse" : "bg-red-400"}`} />
              В зоне
            </span>
          </div>
          <WorkMap
            pins={workPins}
            radiusMeters={geofenceRadiusMeters}
            center={[workPins[0]?.lat ?? 43.255, workPins[0]?.lng ?? 76.9126]}
          />
        </div>

        {/* CTA */}
        <button
          onClick={async () => {
            if (!checklistId || totalAll === 0) {
              setSubmitError("На сегодня нет назначенной смены. Обратитесь к администратору.");
              return;
            }

            const token = localStorage.getItem("token");
            if (!token || !checklistId) {
              await logoutUser();
              router.push("/auth/login");
              return;
            }

            try {
              setSubmitError("");
              await saveLocation(token);
              const response = await fetch(`${API_BASE}/checklists/active/${checklistId}/start`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  notes: workAddress || workObjectName,
                  latitude: gps?.lat ?? null,
                  longitude: gps?.lng ?? null,
                  accuracy: gps?.acc ?? null,
                }),
              });

              if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || "Не удалось начать рабочий день.");
              }

              setScreen("work");
            } catch (error) {
              setSubmitError(error instanceof Error ? error.message : "Не удалось начать рабочий день.");
            }
          }}
          disabled={Boolean(startBlockedReason)}
          className={`w-full min-h-[60px] rounded-[22px] font-black uppercase tracking-[0.18em] text-sm transition-all duration-300 ${
            startBlockedReason
              ? "bg-brand-dark/8 text-brand-dark/30 cursor-not-allowed"
              : "bg-brand-dark text-white hover:bg-brand-green hover:text-brand-dark shadow-[0_4px_24px_rgba(26,29,30,0.22)]"
          }`}>
          Начать рабочий день →
        </button>

        <button
          type="button"
          onClick={async () => {
            if (!checklistId || totalAll === 0) {
              setSubmitError("На сегодня нет назначенной смены. Обратитесь к администратору.");
              return;
            }

            const token = localStorage.getItem("token");
            if (!token || !checklistId) {
              await logoutUser();
              router.push("/auth/login");
              return;
            }

            try {
              setSubmitError("");
              const response = await fetch(`${API_BASE}/checklists/active/${checklistId}/start`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  notes: `demo-start: ${workAddress || workObjectName}`,
                  latitude: workPins[0]?.lat ?? null,
                  longitude: workPins[0]?.lng ?? null,
                  accuracy: 5,
                }),
              });

              if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || "Не удалось открыть демо-смену.");
              }

              setScreen("work");
            } catch (error) {
              setSubmitError(error instanceof Error ? error.message : "Не удалось открыть демо-смену.");
            }
          }}
          className="w-full min-h-[52px] rounded-[20px] border border-brand-dark/10 bg-white text-brand-dark font-black uppercase tracking-[0.14em] text-xs transition-all duration-300 hover:border-brand-green hover:text-brand-green shadow-premium"
        >
          Демо-тест: открыть смену
        </button>

        {submitError && (
          <div className="rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-red-500">
            {submitError}
          </div>
        )}

      </div>
    </main>
  );

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (screen === "done") return (
    <main className="min-h-screen bg-brand-light flex flex-col">
        <AdminNavbar onLogout={handleLogout} />
      <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-24 h-24 rounded-full bg-brand-green flex items-center justify-center mx-auto mb-6 text-white shadow-[0_8px_30px_rgba(143,198,64,0.4)]">
          <CircleCheckIcon cls="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black uppercase text-brand-dark mb-2 tracking-tight">Готово!</h2>
        <p className="text-sm font-semibold text-brand-dark/50 mb-8">Отчёт отправлен куратору</p>

        <div className="rounded-[28px] border border-black/6 bg-white p-5 mb-6 text-left space-y-3 shadow-premium">
          {zonesData.map(z => {
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
          onClick={() => {
            setScreen("start");
            setSelectedZoneId(null);
            setCheckedTasks({});
            setTaskPhotos({});
            setSubmitError("");
          }}
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
        <AdminNavbar onLogout={handleLogout} />
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
                <div
                  className="bg-brand-green h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          </div>

          {zonesData.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {zonesData.map((zone) => {
                const { done, total } = zoneProgress(zone.id);
                const allDone = done === total;
                return (
                  <div
                    key={zone.id}
                    className={`rounded-[18px] border px-3 py-3 ${
                      allDone ? "border-brand-green/25 bg-brand-green/8" : "border-black/6 bg-[#f9faf7]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11px] font-black uppercase tracking-[0.1em] text-brand-dark">
                        {zone.title}
                      </span>
                      <span className={`text-[10px] font-black ${allDone ? "text-brand-green" : "text-brand-dark/35"}`}>
                        {done}/{total}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-dark/6">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${allDone ? "bg-brand-green" : "bg-brand-green/60"}`}
                        style={{ width: `${total ? Math.round((done / total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[18px] border border-black/6 bg-[#f9faf7] px-4 py-4 text-center">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-brand-dark">Нет назначенной смены</p>
              <p className="mt-2 text-xs font-semibold text-brand-dark/40">
                Администратор должен назначить объект, чек-лист и клинера.
              </p>
            </div>
          )}
        </div>

        {currentStep ? (
          <div className="space-y-4">
            <div className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${currentStep.zoneGradient} px-5 py-5 shadow-[0_6px_24px_rgba(0,0,0,0.15)]`}>
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-black/10 pointer-events-none" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {currentStep.zoneTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-black/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/90"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-2xl font-black leading-tight text-white">{currentStep.zoneTitle}</p>
                  <p className="mt-1 text-xs font-semibold text-white/70">{currentStep.zoneSubtitle}</p>
                </div>
                <div className="min-w-[62px] shrink-0 rounded-[18px] bg-black/15 px-3 py-2 text-center">
                  <p className="text-xl font-black leading-none text-white">{currentStepNumber}</p>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white/60">
                    из {flatSteps.length}
                  </p>
                </div>
              </div>
              <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-black/15">
                <div
                  className="h-full rounded-full bg-white/80 transition-all duration-500"
                  style={{ width: `${flatSteps.length ? Math.round(((currentStepNumber - 1) / flatSteps.length) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-premium">
              <div className="border-b border-black/5 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-dark/40">
                    Пункт {currentStepNumber}
                  </p>
                  <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-[10px] font-black text-brand-green">
                    {currentStep.zoneDone}/{currentStep.zoneTotal}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!currentStepKey) return;
                    setSubmitError("");
                    setDraftChecks((prev) => ({ ...prev, [currentStepKey]: !prev[currentStepKey] }));
                  }}
                  className="mt-3 flex w-full items-start gap-4 text-left"
                >
                  {(() => {
                    const TaskIcon = getTaskIcon(currentStep.task);
                    return (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-brand-dark/[0.04] text-brand-green">
                        <TaskIcon cls="w-5 h-5" />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <p className="text-lg font-black leading-snug text-brand-dark">{currentStep.task}</p>
                  </div>
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border-2 transition-all duration-200 ${
                      currentStepChecked
                        ? "border-brand-green bg-brand-green text-white shadow-[0_2px_8px_rgba(143,198,64,0.4)]"
                        : "border-brand-dark/15 bg-white text-transparent"
                    }`}
                  >
                    <CheckIcon cls="w-4 h-4" />
                  </div>
                </button>
              </div>

              <div className="grid gap-3 px-5 pb-5 pt-4 md:grid-cols-2">
                <TaskPhotoSection
                  title="ДО"
                  photos={currentStepPhotos.before}
                  onAdd={(files) => addTaskPhotos(currentStep.zoneId, currentStep.taskIndex, "before", files)}
                  onRemove={(photoIndex) => removeTaskPhoto(currentStep.zoneId, currentStep.taskIndex, "before", photoIndex)}
                />
                <TaskPhotoSection
                  title="ПОСЛЕ"
                  photos={currentStepPhotos.after}
                  onAdd={(files) => addTaskPhotos(currentStep.zoneId, currentStep.taskIndex, "after", files)}
                  onRemove={(photoIndex) => removeTaskPhoto(currentStep.zoneId, currentStep.taskIndex, "after", photoIndex)}
                />
              </div>

            </div>

            <button
              onClick={submitCurrentStep}
              disabled={submitting}
              className={`flex min-h-[60px] w-full items-center justify-center gap-2 rounded-[22px] font-black uppercase tracking-[0.16em] text-sm transition-all duration-200 ${
                submitting
                  ? "cursor-not-allowed bg-brand-dark/8 text-brand-dark/30"
                  : "bg-brand-dark text-white shadow-[0_4px_20px_rgba(26,29,30,0.2)] hover:bg-brand-green hover:text-brand-dark"
              }`}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-brand-dark/20 border-t-brand-green animate-spin" />
                  Сохраняем шаг...
                </>
              ) : isLastPendingStep ? (
                "ЗАВЕРШИТЬ СМЕНУ"
              ) : (
                "ПЕРЕЙТИ К СЛЕДУЮЩЕМУ ШАГУ"
              )}
            </button>

            <p className="px-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-dark/35">
              Фото отправляются сразу после перехода к следующему шагу.
            </p>

            {submitError && (
              <div className="rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-red-500">
                {submitError}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[28px] border border-black/6 bg-white px-5 py-6 text-center shadow-premium">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green/12 text-brand-green">
              <CircleCheckIcon cls="h-8 w-8" />
            </div>
            <p className="text-lg font-black uppercase tracking-[0.12em] text-brand-dark">Все шаги выполнены</p>
            <p className="mt-2 text-sm font-semibold text-brand-dark/40">
              Смена завершится автоматически после отправки последнего шага.
            </p>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}
