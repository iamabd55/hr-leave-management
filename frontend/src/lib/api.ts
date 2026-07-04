// ─────────────────────────────────────────────────────────────
// API Client — typed fetch wrapper with JWT auth header
// ─────────────────────────────────────────────────────────────

import type {
  Employee,
  LeaveApplication,
  LeaveBalance,
  LeaveType,
  LoginDto,
  RegisterDto,
  RegisteredUser,
} from "@/types/api";

const TOKEN_KEY = "hr_token";

// ── helpers ──────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (res.status === 401) {
    // Throw with the actual backend message (e.g. "Invalid email or password")
    // so the caller (login page, etc.) can display it directly.
    // Do NOT auto-redirect here — authenticated pages handle this via a React effect.
    const text = await res.text();
    throw new Error(text || "Unauthorized");
  }

  if (res.status === 403) {
    throw new Error("Forbidden");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  // 204 No Content — return empty
  if (res.status === 204) return undefined as unknown as T;

  const contentType = res.headers.get("content-type") ?? "";

  // Guard: if we got HTML back (proxy failure / redirect page), throw clearly
  if (contentType.includes("text/html")) {
    throw new Error(
      `Server returned an HTML page instead of JSON (proxy error). ` +
      `Check that the backend is running on https://localhost:7125.`
    );
  }

  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as T;
}

// ── Auth ──────────────────────────────────────────────────────

export const authApi = {
  login: (dto: LoginDto) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  register: (dto: RegisterDto) =>
    request<RegisteredUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};

// ── Employee ──────────────────────────────────────────────────

export const employeeApi = {
  getAll: () => request<Employee[]>("/employee"),
  getById: (id: number) => request<Employee>(`/employee/${id}`),
  getMe: () => request<Employee>("/employee/me"),
  getByEmail: async (email: string) => {
    const all = await request<Employee[]>("/employee");
    return all.find((e) => e.email.toLowerCase() === email.toLowerCase());
  },
  add: (emp: Omit<Employee, "id" | "leaveApplications" | "leaveBalances">) =>
    request<string>("/employee", { method: "POST", body: JSON.stringify(emp) }),
  update: (id: number, emp: Partial<Employee>) =>
    request<string>(`/employee/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...emp, id }),
    }),
  delete: (id: number) =>
    request<string>(`/employee/${id}`, { method: "DELETE" }),
};

// ── Leave Type ────────────────────────────────────────────────

export const leaveTypeApi = {
  getAll: () => request<LeaveType[]>("/leavetype"),
  getById: (id: number) => request<LeaveType>(`/leavetype/${id}`),
  add: (leaveType: Omit<LeaveType, "id">) =>
    request<string>("/leavetype", { method: "POST", body: JSON.stringify(leaveType) }),
  update: (id: number, leaveType: Partial<LeaveType>) =>
    request<string>(`/leavetype/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...leaveType, id }),
    }),
  delete: (id: number) =>
    request<string>(`/leavetype/${id}`, { method: "DELETE" }),
};

// ── Leave Balance ─────────────────────────────────────────────

export const leaveBalanceApi = {
  getByEmployee: (employeeId: number) =>
    request<LeaveBalance[]>(`/leavebalance/employee/${employeeId}`),
};

// ── Leave Application ─────────────────────────────────────────

export const leaveApplicationApi = {
  getAll: () => request<LeaveApplication[]>("/leaveapplication"),
  getById: (id: number) => request<LeaveApplication>(`/leaveapplication/${id}`),
  getByEmployee: (employeeId: number) =>
    request<LeaveApplication[]>(`/leaveapplication/employee/${employeeId}`),

  apply: (body: {
    employeeId: number;
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    reason: string;
  }) =>
    request<string>("/leaveapplication", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  approve: (id: number) =>
    request<string>(`/leaveapplication/${id}/approve`, { method: "PUT" }),

  // Backend expects a raw JSON string body — NOT an object
  reject: (id: number, rejectionReason: string) =>
    request<string>(`/leaveapplication/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify(rejectionReason),
    }),
};

// ── Helpers ───────────────────────────────────────────────────

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  // Also write a cookie so Next.js middleware can read it
  document.cookie = `hr_token=${token}; path=/; SameSite=Strict`;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = "hr_token=; Max-Age=0; path=/";
}
