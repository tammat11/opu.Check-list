"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PreviewNavbar } from "../../components/AppChrome";
import { API_BASE, canAccessAdminPanel, fetchCurrentUser, logout as logoutUser } from "../../lib/auth";

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
  assignmentId?: number;
  workers: number;
  lat?: number;
  lng?: number;
}

interface TeamUser {
  id: number;
  name: string;
  phone: string;
  role: string;
  status: string;
  parent_id?: number | null;
  children_count: number;
}

let taskSeed = 1;
const mkTask = (title: string, zone: string, time: string, at = "", icon = "sparkles"): Task =>
  ({ id: taskSeed++, title, zone, time, at, icon });

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
type ApiTemplate = {
  id: number;
  name: string;
  items?: {
    id: number;
    title: string;
    zone?: string | null;
    icon?: string | null;
    duration_minutes?: number | null;
    order_index?: number;
  }[];
};

const apiTemplateToChecklist = (template: ApiTemplate): Checklist => ({
  id: template.id,
  name: template.name,
  tasks: [...(template.items ?? [])]
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((item) => ({
      id: item.id,
      title: item.title,
      zone: item.zone || "Другое",
      time: `${item.duration_minutes ?? 5} мин`,
      at: "",
      icon: item.icon || "sparkles",
    })),
});

const checklistToApiItems = (tasks: Task[]) =>
  tasks
    .filter((task) => task.title.trim())
    .map((task) => ({
      title: task.title.trim(),
      zone: task.zone,
      icon: task.icon,
      duration_minutes: parseInt(task.time, 10) || 5,
      requires_photo: false,
    }));

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

type Tab = "addresses" | "checklists" | "users";

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("addresses");
  const [authReady, setAuthReady] = useState(false);
  const [formError, setFormError] = useState("");

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [addingChecklistId, setAddingChecklistId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newDistrict, setNewDistrict] = useState("");

  // Checklists
  const [checklists, setChecklists] = useState<Checklist[]>(initialChecklists);
  const [creatingChecklist, setCreatingChecklist] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTasks, setEditTasks] = useState<Task[]>([]);
  const [editName, setEditName] = useState("");
  const [iconPickerFor, setIconPickerFor] = useState<number | null>(null);
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("+7 ");
  const [newUserIin, setNewUserIin] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("cleaner");

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    fetchCurrentUser()
      .then((currentUser) => {
        if (!currentUser) {
          router.push("/auth/login");
          return;
        }

        if (!canAccessAdminPanel(currentUser.role)) {
          router.push("/app/dashboard");
          return;
        }

        setAuthReady(true);
      });
  }, [router]);

  useEffect(() => {
    if (!authReady) return;

    const loadAdminData = async () => {
      try {
        const [objectsRes, assignmentsRes, templatesRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/objects`, { headers: authHeaders() }),
          fetch(`${API_BASE}/checklists/assignments`, { headers: authHeaders() }),
          fetch(`${API_BASE}/checklists/templates`, { headers: authHeaders() }),
          fetch(`${API_BASE}/users`, { headers: authHeaders() }),
        ]);

        if (
          objectsRes.status === 401 ||
          objectsRes.status === 403 ||
          assignmentsRes.status === 401 ||
          assignmentsRes.status === 403 ||
          templatesRes.status === 401 ||
          templatesRes.status === 403 ||
          usersRes.status === 401 ||
          usersRes.status === 403
        ) {
          await logoutUser();
          setFormError("Недостаточно прав. Войдите заново на этом адресе: 127.0.0.1:3000.");
          router.push("/auth/login");
          return;
        }

        const objectsData = await objectsRes.json();
        const assignmentsData = await assignmentsRes.json();
        const templatesData = await templatesRes.json();
        const usersData = await usersRes.json();
        const assignmentMap = new Map<number, { templateId: number; assignmentId: number }>();

        if (Array.isArray(templatesData.templates) && templatesData.templates.length > 0) {
          const nextChecklists = templatesData.templates.map(apiTemplateToChecklist);
          setChecklists(nextChecklists);
        }

        if (Array.isArray(assignmentsData.assignments)) {
          for (const assignment of assignmentsData.assignments) {
            if (
              typeof assignment.object_id === "number" &&
              typeof assignment.template_id === "number" &&
              !assignmentMap.has(assignment.object_id)
            ) {
              assignmentMap.set(assignment.object_id, {
                templateId: assignment.template_id,
                assignmentId: assignment.id,
              });
            }
          }
        }

        if (Array.isArray(objectsData.objects) && objectsData.objects.length > 0) {
          setAddresses(
            objectsData.objects.map(
              (object: {
                id: number;
                name: string;
                address?: string | null;
                district?: string | null;
                workers_count?: number;
                latitude?: number | null;
                longitude?: number | null;
              }) => {
                const assignment = assignmentMap.get(object.id);
                return assignment
                  ? {
                      id: object.id,
                      name: object.address || object.name,
                      district: object.district || "",
                      checklistId: assignment.templateId,
                      assignmentId: assignment.assignmentId,
                      workers: object.workers_count ?? 1,
                      lat: object.latitude ?? undefined,
                      lng: object.longitude ?? undefined,
                    }
                  : null;
              }
            ).filter(Boolean) as Address[]
          );
        }
        if (Array.isArray(usersData.users)) {
          setUsers(usersData.users);
        }
      } catch {}
    };

    loadAdminData();
  }, [authReady, router]);

  const startEdit = (cl: Checklist) => {
    setEditingId(cl.id);
    setEditTasks(cl.tasks.map(t => ({ ...t })));
    setEditName(cl.name);
    setIconPickerFor(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`${API_BASE}/checklists/templates/${editingId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          name: editName,
          items: checklistToApiItems(editTasks),
        }),
      });

      if (res.ok) {
        const template = await res.json();
        setChecklists(prev => prev.map(cl =>
          cl.id === editingId ? apiTemplateToChecklist(template) : cl
        ));
        setEditingId(null);
        setIconPickerFor(null);
      } else {
        setFormError("Не удалось сохранить чек-лист.");
      }
    } catch {
      setFormError("Не удалось сохранить чек-лист.");
    }
  };

  const createChecklist = async () => {
    setFormError("");
    if (!newChecklistName.trim()) {
      setFormError("Введите название чек-листа.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/checklists/templates`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: newChecklistName.trim(),
          items: [],
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.detail || "Не удалось создать чек-лист.");
        return;
      }

      const createdChecklist = apiTemplateToChecklist(data.template);
      setChecklists((prev) => [...prev, createdChecklist]);
      setCreatingChecklist(false);
      setNewChecklistName("");
      startEdit(createdChecklist);
    } catch {
      setFormError("Не удалось создать чек-лист.");
    }
  };

  const deleteChecklist = async (checklistId: number) => {
    setFormError("");
    try {
      const res = await fetch(`${API_BASE}/checklists/templates/${checklistId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.detail || "Не удалось удалить чек-лист.");
        return;
      }

      setChecklists((prev) => prev.filter((item) => item.id !== checklistId));
      setAddresses((prev) => prev.filter((item) => item.checklistId !== checklistId));
      setEditingId(null);
      setIconPickerFor(null);
      setEditTasks([]);
      setEditName("");
    } catch {
      setFormError("Не удалось удалить чек-лист.");
    }
  };

  const updateTask = (idx: number, field: keyof Task, val: string) => {
    setEditTasks(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  };

  const removeTask = (idx: number) => setEditTasks(prev => prev.filter((_, i) => i !== idx));

  const grouped = checklists.map((cl, idx) => ({
    cl, color: CL_COLORS[idx] ?? CL_COLORS[0],
    addresses: addresses.filter(a => a.checklistId === cl.id),
  }));
  const cleaners = users.filter((user) => user.role === "cleaner" && user.status === "active");
  const managers = users.filter((user) => user.role !== "cleaner" && user.status === "active");
  const roleLabel = (role: string) =>
    role === "admin" ? "Админ" :
    role === "partner" ? "Партнер" :
    role === "curator" ? "Куратор" : "Клинер";

  const totalTime = (tasks: Task[]) => {
    const mins = tasks.reduce((acc, t) => {
      const m = parseInt(t.time);
      return acc + (isNaN(m) ? 0 : m);
    }, 0);
    return mins ? `${mins} мин` : "—";
  };

  const createUser = async () => {
    setFormError("");
    if (!newUserName.trim() || !newUserPhone.trim() || newUserIin.length !== 12) {
      setFormError("Заполните имя, телефон и Н из 12 цифр.");
      return;
    }

    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        name: newUserName.trim(),
        phone: newUserPhone.trim(),
        iin: newUserIin.trim(),
        role: newUserRole,
        password: newUserPassword.trim() || "welcome123",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormError(data.detail || "Не удалось создать сотрудника.");
      return;
    }

    setUsers((prev) => [...prev, { ...data, children_count: data.children_count ?? 0 }]);
    setNewUserName("");
    setNewUserPhone("+7 ");
    setNewUserIin("");
    setNewUserPassword("");
    setNewUserRole("cleaner");
    setCreatingUser(false);
  };

  const deactivateUser = async (userId: number) => {
    setFormError("");
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.detail || "Не удалось отключить сотрудника.");
      return;
    }
    setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, status: "inactive" } : user));
  };

  const resetAddressForm = () => {
    setAddingChecklistId(null);
    setNewName("");
    setNewDistrict("");
  };

  const removeAddressFromChecklist = async (address: Address) => {
    setFormError("");
    if (!address.assignmentId) {
      setFormError("Не найдена привязка адреса к чек-листу.");
      return;
    }

    const res = await fetch(`${API_BASE}/checklists/assignments/${address.assignmentId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormError(data.detail || "Не удалось удалить адрес из чек-листа.");
      return;
    }

    setAddresses((prev) => prev.filter((item) => item.id !== address.id));
  };

  const createAddressForChecklist = async (checklistId: number) => {
    setFormError("");
    if (!newName.trim()) {
      return;
    }

    try {
      const objectRes = await fetch(`${API_BASE}/objects`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: newName.trim(),
          address: newName.trim(),
          district: newDistrict.trim() || null,
          workers_count: 1,
          status: "active",
        }),
      });
      const createdObject = await objectRes.json();

      if (!objectRes.ok) {
        throw new Error(createdObject.detail || "Failed to create object");
      }

      const objectId = createdObject.id;
      const assignRes = await fetch(`${API_BASE}/checklists/assign`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          template_id: checklistId,
          object_id: objectId,
          is_default: false,
        }),
      });
      const assignData = await assignRes.json().catch(() => ({}));
      if (!assignRes.ok) {
        throw new Error(assignData.detail || "Failed to assign checklist");
      }

      setAddresses((prev) => [
        ...prev,
        {
          id: typeof objectId === "number" ? objectId : Date.now(),
          name: newName.trim(),
          district: newDistrict.trim(),
          checklistId,
          assignmentId: assignData.assignment?.id,
          workers: 1,
        },
      ]);
      resetAddressForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Не удалось создать адрес.");
    }
  };

  if (!authReady) {
    return (
      <main className="min-h-screen bg-[#f5f7f2] flex items-center justify-center">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-dark/35">Проверка доступа...</p>
      </main>
    );
  }

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
          {(["addresses", "checklists", "users"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-wider transition-all ${
                tab === t ? "bg-brand-dark text-white shadow-sm" : "text-brand-dark/50 hover:text-brand-dark"
              }`}>
              {t === "addresses" ? "Адреса" : t === "checklists" ? "Чек-листы" : "Сотрудники"}
            </button>
          ))}
        </div>

        {/* Addresses Tab */}
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
                  <span className="rounded-[12px] bg-brand-dark/6 px-3 py-1.5 text-xs font-black text-brand-dark/60">
                    {addrs.length} {addrs.length === 1 ? "адрес" : addrs.length < 5 ? "адреса" : "адресов"}
                  </span>
                </div>

                <div className="border-t border-black/5 bg-[#fbfcf8] px-4 py-3 space-y-2">
                  {addrs.length > 0 ? (
                    addrs.map((address) => (
                      <div key={address.id} className="rounded-[16px] bg-white border border-black/5 px-3 py-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-brand-dark truncate">{address.name}</p>
                            <p className="text-[10px] font-semibold text-brand-dark/35">
                              {address.district || "Район не указан"}
                            </p>
                          </div>
                          <button
                            onClick={() => removeAddressFromChecklist(address)}
                            className="min-h-[38px] rounded-[12px] border border-red-200 bg-red-50 px-4 text-[10px] font-black uppercase tracking-[0.12em] text-red-500 transition hover:bg-red-500 hover:text-white"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[16px] border border-dashed border-black/10 bg-white/70 px-4 py-5 text-center text-xs font-semibold text-brand-dark/35">
                      Для этого чек-листа пока не привязан ни один адрес.
                    </div>
                  )}

                  {addingChecklistId === cl.id ? (
                    <div className="rounded-[18px] bg-white border border-black/5 px-4 py-4 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40">
                        Новый адрес для {cl.name}
                      </p>
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Адрес объекта"
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors"
                      />
                      <input
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        placeholder="Район (необязательно)"
                        className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          disabled={!newName.trim()}
                          onClick={() => createAddressForChecklist(cl.id)}
                          className="flex-1 py-3 rounded-[16px] bg-brand-green text-brand-dark text-xs font-black uppercase disabled:opacity-40 hover:bg-brand-dark hover:text-white transition-all"
                        >
                          Добавить
                        </button>
                        <button
                          onClick={resetAddressForm}
                          className="px-5 py-3 rounded-[16px] bg-black/6 text-brand-dark/60 text-xs font-black uppercase"
                        >
                          Отмена
                        </button>
                      </div>
                      {formError && (
                        <p className="text-xs font-semibold text-red-500">{formError}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setFormError("");
                        setAddingChecklistId(cl.id);
                        setNewName("");
                        setNewDistrict("");
                      }}
                      className="w-full flex items-center gap-3 rounded-[16px] bg-white border border-dashed border-black/10 px-4 py-4 text-brand-dark/50 hover:text-brand-dark transition-colors"
                    >
                      <div className="w-8 h-8 rounded-[12px] border-2 border-dashed border-brand-dark/20 flex items-center justify-center"><PlusIcon /></div>
                      <span className="text-sm font-black uppercase tracking-wider">Добавить адрес</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CHECKLISTS TAB ── */}
        {tab === "checklists" && (
          <div className="space-y-4">
            <div className="rounded-[24px] bg-white border border-black/5 overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
              {!creatingChecklist ? (
                <button
                  onClick={() => {
                    setFormError("");
                    setCreatingChecklist(true);
                    setNewChecklistName("");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-4 text-brand-dark/50 hover:text-brand-dark transition-colors"
                >
                  <div className="w-8 h-8 rounded-[12px] border-2 border-dashed border-brand-dark/20 flex items-center justify-center"><PlusIcon /></div>
                  <span className="text-sm font-black uppercase tracking-wider">Добавить чек-лист</span>
                </button>
              ) : (
                <div className="p-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40">Новый чек-лист</p>
                  <input
                    autoFocus
                    value={newChecklistName}
                    onChange={(e) => setNewChecklistName(e.target.value)}
                    placeholder="Название чек-листа"
                    className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors"
                  />

                  {formError && (
                    <p className="text-xs font-semibold text-red-500">{formError}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      disabled={!newChecklistName.trim()}
                      onClick={createChecklist}
                      className="flex-1 py-3 rounded-[16px] bg-brand-green text-brand-dark text-xs font-black uppercase disabled:opacity-40 hover:bg-brand-dark hover:text-white transition-all"
                    >
                      Создать
                    </button>
                    <button
                      onClick={() => {
                        setCreatingChecklist(false);
                        setNewChecklistName("");
                        setFormError("");
                      }}
                      className="px-5 py-3 rounded-[16px] bg-black/6 text-brand-dark/60 text-xs font-black uppercase"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                        <button
                          onClick={() => deleteChecklist(cl.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-red-50 text-red-500 text-[10px] font-black uppercase border border-red-200 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <TrashIcon cls="w-3 h-3" /> Удалить
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
                                              <p className="text-[8px] font-black uppercase tracking-widest text-brand-dark/30 mb-1.5 px-0.5">конка</p>
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
                              {tasks.map((task) => (
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

        {/* ── USERS TAB ── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[22px] bg-white px-4 py-4 border border-black/5 shadow-premium">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">Всего</p>
                <p className="mt-2 text-3xl font-black text-brand-dark">{users.length}</p>
              </div>
              <div className="rounded-[22px] bg-white px-4 py-4 border border-black/5 shadow-premium">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">Клинеры</p>
                <p className="mt-2 text-3xl font-black text-brand-dark">{cleaners.length}</p>
              </div>
              <div className="rounded-[22px] bg-white px-4 py-4 border border-black/5 shadow-premium">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-dark/35">Управление</p>
                <p className="mt-2 text-3xl font-black text-brand-dark">{managers.length}</p>
              </div>
            </div>

            <div className="rounded-[24px] bg-white border border-black/5 overflow-hidden shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
              {!creatingUser ? (
                <button
                  onClick={() => { setFormError(""); setCreatingUser(true); }}
                  className="w-full flex items-center gap-3 px-4 py-4 text-brand-dark/50 hover:text-brand-dark transition-colors"
                >
                  <div className="w-8 h-8 rounded-[12px] border-2 border-dashed border-brand-dark/20 flex items-center justify-center"><PlusIcon /></div>
                  <span className="text-sm font-black uppercase tracking-wider">Добавить сотрудника</span>
                </button>
              ) : (
                <div className="p-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/40">Новый сотрудник</p>
                  <input
                    autoFocus
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="мя сотрудника"
                    className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors"
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="+7 700 000 00 00"
                      className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors"
                    />
                    <input
                      value={newUserIin}
                      onChange={(e) => setNewUserIin(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      placeholder="Н, 12 цифр"
                      className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-black bg-[#fafaf8] transition-colors"
                    >
                      <option value="cleaner">Клинер</option>
                      <option value="curator">Куратор</option>
                      <option value="partner">Партнер</option>
                    </select>
                    <input
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Пароль, по умолчанию welcome123"
                      className="w-full px-4 py-3 rounded-[16px] border-2 border-black/8 focus:border-brand-green outline-none text-sm font-semibold bg-[#fafaf8] transition-colors"
                    />
                  </div>
                  {formError && <p className="text-xs font-semibold text-red-500">{formError}</p>}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={createUser}
                      className="flex-1 py-3 rounded-[16px] bg-brand-green text-brand-dark text-xs font-black uppercase disabled:opacity-40 hover:bg-brand-dark hover:text-white transition-all"
                    >
                      Создать
                    </button>
                    <button
                      onClick={() => { setCreatingUser(false); setNewUserName(""); setNewUserPhone("+7 "); setNewUserIin(""); setNewUserPassword(""); setNewUserRole("cleaner"); }}
                      className="px-5 py-3 rounded-[16px] bg-black/6 text-brand-dark/60 text-xs font-black uppercase"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className={`rounded-[20px] bg-white border border-black/5 px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.05)] ${user.status !== "active" ? "opacity-55" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[14px] bg-brand-dark text-white flex items-center justify-center text-sm font-black">
                      {user.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black text-brand-dark truncate">{user.name}</p>
                        <span className="px-2 py-0.5 rounded-full bg-brand-green/12 text-[9px] font-black uppercase tracking-[0.12em] text-brand-green">
                          {roleLabel(user.role)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em] ${
                          user.status === "active" ? "bg-brand-dark/6 text-brand-dark/45" : "bg-red-50 text-red-400"
                        }`}>
                          {user.status === "active" ? "Активен" : "Отключен"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] font-semibold text-brand-dark/35">
                        {user.phone} · Н скрыт · {user.children_count} подчиненных
                      </p>
                    </div>
                    {user.status === "active" ? (
                      <button
                        onClick={() => deactivateUser(user.id)}
                        className="rounded-[12px] bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-red-400 transition hover:bg-red-100"
                      >
                        Отключить
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

