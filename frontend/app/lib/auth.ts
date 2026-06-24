"use client";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export type UserRole = "admin" | "partner" | "curator" | "cleaner";

export type AuthUser = {
  id: number;
  name: string;
  full_name?: string;
  role: UserRole;
  status?: string;
};

const STORAGE_KEYS = [
  "token",
  "opu-user-id",
  "opu-user-name",
  "opu-user-role",
  "browserFingerprint",
] as const;

export const getToken = () => localStorage.getItem("token");

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const clearStoredAuth = () => {
  STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const storeAuth = (
  token: string,
  user?: { id?: number; full_name?: string; role?: string; name?: string }
) => {
  localStorage.setItem("token", token);
  if (user?.id !== undefined) localStorage.setItem("opu-user-id", String(user.id));
  if (user?.full_name || user?.name) {
    localStorage.setItem("opu-user-name", user.full_name ?? user.name ?? "");
  }
  if (user?.role) localStorage.setItem("opu-user-role", user.role);
};

export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    clearStoredAuth();
    return null;
  }

  const user = (await res.json()) as AuthUser;
  storeAuth(token, user);
  return user;
};

export const logout = async () => {
  const token = getToken();
  const browserFingerprint = localStorage.getItem("browserFingerprint");

  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ browserFingerprint }),
    }).catch(() => {});
  }

  clearStoredAuth();
};

export const canAccessAdminPanel = (role: string | undefined) =>
  role === "admin" || role === "partner";

export const canAccessApprovals = (role: string | undefined) =>
  role === "admin" || role === "partner" || role === "curator";

export const canAccessWork = (role: string | undefined) => role === "cleaner";
