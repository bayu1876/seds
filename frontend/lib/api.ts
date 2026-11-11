export const API_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "/api";

export type AccessInfo = {
  permissions: string[];
  roles: string[];
  departments: { id: string; code: string; name: string }[];
};

const EMPTY_ACCESS: AccessInfo = { permissions: [], roles: [], departments: [] };

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sed_token");
}

function getUser(): any {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("sed_user");
  return user ? JSON.parse(user) : null;
}

function getAccess(): AccessInfo {
  if (typeof window === "undefined") return EMPTY_ACCESS;
  try {
    const raw = localStorage.getItem("sed_access");
    if (!raw) return EMPTY_ACCESS;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.permissions)) return EMPTY_ACCESS;
    return {
      permissions: parsed.permissions.filter(
        (p: unknown): p is string => typeof p === "string",
      ),
      roles: Array.isArray(parsed.roles)
        ? parsed.roles.filter((r: unknown): r is string => typeof r === "string")
        : [],
      departments: Array.isArray(parsed.departments) ? parsed.departments : [],
    };
  } catch {
    return EMPTY_ACCESS;
  }
}

function saveAccess(access: AccessInfo) {
  if (typeof window === "undefined") return;
  localStorage.setItem("sed_access", JSON.stringify(access));
}

function hasPermission(module: string, action: string): boolean {
  return getAccess().permissions.includes(`${module}:${action}`);
}

function handleUnauthorized(endpoint: string): boolean {
  if (typeof window === "undefined") return false;
  if (endpoint.startsWith("/auth/login")) return false;
  try {
    localStorage.removeItem("sed_token");
    localStorage.removeItem("sed_user");
    localStorage.removeItem("sed_access");
  } catch {}
  const current = window.location.pathname + window.location.search;
  if (window.location.pathname !== "/login") {
    window.location.replace(`/login?redirect=${encodeURIComponent(current)}`);
  }
  return true;
}

async function request(
  endpoint: string,
  options: RequestInit = {},
): Promise<any> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized(endpoint);
    }
    throw new ApiError(
      res.status === 403
        ? "Anda tidak memiliki izin untuk tindakan ini."
        : data.message || "Request failed",
      res.status,
      data,
    );
  }

  return data;
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, body: any) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint: string, body: any) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint: string, body: any) =>
    request(endpoint, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (endpoint: string, body?: unknown) =>
    request(endpoint, {
      method: "DELETE",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  upload: (endpoint: string, formData: FormData) =>
    fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      body: formData,
      headers: getToken()
        ? { Authorization: `Bearer ${getToken()}` }
        : {},
    }).then(async (res: Response) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          handleUnauthorized(endpoint);
        }
        throw new ApiError(
          res.status === 403
            ? "Anda tidak memiliki izin untuk tindakan ini."
            : data.message || "Upload failed",
          res.status,
          data,
        );
      }
      return data;
    }),
};

export const auth = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }).then((res: any) => {
      if (typeof window !== "undefined" && res.token) {
        localStorage.setItem("sed_token", res.token);
        localStorage.setItem("sed_user", JSON.stringify(res.user));
        if (res.access) saveAccess(res.access);
      }
      return res;
    }),
  refresh: () =>
    api.get("/auth/me").then((res: any) => {
      if (typeof window !== "undefined") {
        if (res.user) localStorage.setItem("sed_user", JSON.stringify(res.user));
        if (res.access) saveAccess(res.access);
      }
      return res as { user: any; access: AccessInfo };
    }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sed_token");
      localStorage.removeItem("sed_user");
      localStorage.removeItem("sed_access");
    }
  },
  getUser,
  getAccess,
  hasPermission,
  isAuthenticated: () => !!getToken(),
};

export async function downloadFile(endpoint: string, fallbackName: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized(endpoint);
    }
    throw new Error("Download failed");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export { ApiError };
