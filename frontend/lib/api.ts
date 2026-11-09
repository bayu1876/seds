export const API_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3001/api";

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
    throw new ApiError(
      data.message || "Request failed",
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
  delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),
};

export const auth = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }).then((res: any) => {
      if (typeof window !== "undefined" && res.token) {
        localStorage.setItem("sed_token", res.token);
        localStorage.setItem("sed_user", JSON.stringify(res.user));
      }
      return res;
    }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sed_token");
      localStorage.removeItem("sed_user");
    }
  },
  getUser,
  isAuthenticated: () => !!getToken(),
};

export { ApiError };
