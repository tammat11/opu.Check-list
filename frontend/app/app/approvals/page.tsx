"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, canAccessApprovals, fetchCurrentUser, logout as logoutUser } from "../../lib/auth";
import { CheckIcon, PreviewNavbar, UsersIcon } from "../../components/AppChrome";

type ApprovalStatus = "pending" | "approved" | "rejected";

type ApprovalRequest = {
  id: number;
  requested_by_id: number | null;
  requested_from_id: number;
  request_type: string;
  user_data: {
    phone?: string;
    iin?: string;
    name?: string;
    userId?: number;
  } | null;
  status: ApprovalStatus;
  rejection_reason: string | null;
  created_at: string;
  responded_at: string | null;
};

type ObjectOption = {
  id: number;
  name: string;
  address?: string | null;
};

type AssignmentDraft = {
  objectId: string;
};

const statusStyle: Record<ApprovalStatus, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-brand-green/12 text-brand-green",
  rejected: "bg-red-50 text-red-500",
};

const statusLabel: Record<ApprovalStatus, string> = {
  pending: "Ожидает",
  approved: "Одобрена",
  rejected: "Отклонена",
};

const requestTypeLabel: Record<string, string> = {
  new_user: "Новый пользователь",
  password_reset: "Сброс пароля",
};

const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ApprovalsPage() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [objects, setObjects] = useState<ObjectOption[]>([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<number, AssignmentDraft>>({});

  const loadRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/approvals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        await logoutUser();
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Не удалось загрузить заявки");
      }

      const data = await res.json();
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  };

  const loadReferences = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    const objectsRes = await fetch(`${API_BASE}/objects`, { headers });

    if (objectsRes.ok) {
      const data = await objectsRes.json();
      setObjects(Array.isArray(data.objects) ? data.objects : []);
    }
  };

  useEffect(() => {
    fetchCurrentUser()
      .then((currentUser) => {
        if (!currentUser) {
          router.push("/auth/login");
          return;
        }
        if (!canAccessApprovals(currentUser.role)) {
          router.push("/app/dashboard");
          return;
        }
        setAuthReady(true);
      });
  }, [router]);

  useEffect(() => {
    if (authReady) {
      loadRequests();
      loadReferences();
    }
  }, [authReady]);

  const pendingCount = useMemo(() => requests.filter((request) => request.status === "pending").length, [requests]);
  const approvedCount = useMemo(() => requests.filter((request) => request.status === "approved").length, [requests]);
  const rejectedCount = useMemo(() => requests.filter((request) => request.status === "rejected").length, [requests]);

  const humanizeError = (message: string) => {
    if (message === "Phone already exists") return "Пользователь с таким телефоном уже есть в базе";
    if (message === "IIN already exists") return "Пользователь с таким ИИН уже есть в базе";
    if (message === "Object not found") return "Выбранный адрес не найден";
    if (message === "Template not found") return "Чек-лист, привязанный к адресу, не найден";
    if (message === "Checklist assignment not found") return "К этому адресу еще не привязан чек-лист";
    return message;
  };

  const updateRequest = async (request: ApprovalRequest, action: "approve" | "reject") => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const draft = assignmentDrafts[request.id] || { objectId: "" };
    if (action === "approve" && request.request_type === "new_user" && !draft.objectId) {
      setError("Выберите адрес перед одобрением заявки");
      return;
    }

    setActionId(request.id);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/approvals/${request.id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: action === "reject"
          ? JSON.stringify({ reason: "Отклонено куратором" })
          : JSON.stringify({
              object_id: draft.objectId ? Number(draft.objectId) : null,
            }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(humanizeError(data.detail || "Не удалось обновить заявку"));
      }

      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить заявку");
    } finally {
      setActionId(null);
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
      <PreviewNavbar active="approvals" />

      <div className="max-w-2xl mx-auto px-4 pb-16 pt-4 space-y-4">
        <div className="rounded-[28px] bg-brand-dark px-5 py-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-52 h-52 rounded-full bg-brand-green/10 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1">Куратор · заявки</p>
          <h1 className="text-3xl font-black text-white">Заявки на доступ</h1>
          <p className="mt-2 max-w-md text-sm font-semibold text-white/45">
            Здесь появляются новые регистрации и запросы на восстановление пароля. После одобрения пользователь сам создаст личный пароль при входе.
          </p>

          <div className="mt-4 flex gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-amber-200 bg-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {pendingCount} ожидает
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-brand-green bg-brand-green/15">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
              {approvedCount} одобрено
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-red-300 bg-red-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {rejectedCount} отклонено
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-[28px] border border-black/5 bg-white shadow-premium overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-black/5 bg-[#fbfcf8] px-4 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-dark/35">Входящие заявки</p>
              <p className="mt-0.5 text-sm font-black text-brand-dark">{requests.length} всего</p>
            </div>
            <button
              onClick={loadRequests}
              disabled={loading}
              className="rounded-[14px] bg-brand-dark px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white disabled:opacity-40"
            >
              Обновить
            </button>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-dark/35">Загрузка...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-brand-green/10 text-brand-green">
                <CheckIcon cls="w-7 h-7" />
              </div>
              <p className="mt-4 text-xl font-black text-brand-dark">Заявок пока нет</p>
              <p className="mt-1 text-sm font-semibold text-brand-dark/40">Когда пользователь отправит регистрацию, она появится здесь.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {requests.map((request) => {
                const userData = request.user_data || {};
                const pending = request.status === "pending";
                const draft = assignmentDrafts[request.id] || { objectId: "" };
                const needsAssignment = pending && request.request_type === "new_user";

                return (
                  <div key={request.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-brand-dark text-white">
                          <UsersIcon cls="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-black text-brand-dark">{userData.name || "Без имени"}</p>
                            <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${statusStyle[request.status]}`}>
                              {statusLabel[request.status]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-bold text-brand-dark/45">
                            {requestTypeLabel[request.request_type] || request.request_type} · {formatDateTime(request.created_at)}
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <div className="rounded-[14px] bg-[#f5f7f2] px-3 py-2">
                              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-dark/30">Телефон</p>
                              <p className="mt-0.5 text-sm font-black text-brand-dark">{userData.phone || "—"}</p>
                            </div>
                            <div className="rounded-[14px] bg-[#f5f7f2] px-3 py-2">
                              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-brand-dark/30">ИИН</p>
                              <p className="mt-0.5 text-sm font-black text-brand-dark">{userData.iin || "—"}</p>
                            </div>
                          </div>
                          {request.rejection_reason && (
                            <p className="mt-2 text-xs font-semibold text-red-500">Причина: {request.rejection_reason}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {pending && (
                      <div className="mt-4 space-y-3">
                        {needsAssignment && (
                          <div className="grid gap-2">
                            <label className="block rounded-[16px] bg-[#f5f7f2] px-3 py-2">
                              <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-brand-dark/30">
                                Адрес
                              </span>
                              <select
                                value={draft.objectId}
                                onChange={(event) => {
                                  const objectId = event.target.value;
                                  setAssignmentDrafts((current) => ({
                                    ...current,
                                    [request.id]: {
                                      objectId,
                                    },
                                  }));
                                }}
                                className="mt-1 w-full bg-transparent text-sm font-black text-brand-dark outline-none"
                              >
                                <option value="">Выбрать адрес</option>
                                {objects.map((object) => (
                                  <option key={object.id} value={object.id}>
                                    {object.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                          onClick={() => updateRequest(request, "approve")}
                          disabled={actionId === request.id || (needsAssignment && !draft.objectId)}
                          className="min-h-[44px] rounded-[16px] bg-brand-green text-brand-dark text-xs font-black uppercase tracking-[0.12em] shadow-button disabled:opacity-40"
                        >
                          Одобрить
                        </button>
                          <button
                          onClick={() => updateRequest(request, "reject")}
                          disabled={actionId === request.id}
                          className="min-h-[44px] rounded-[16px] border border-red-100 bg-red-50 text-xs font-black uppercase tracking-[0.12em] text-red-500 disabled:opacity-40"
                        >
                          Отклонить
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
