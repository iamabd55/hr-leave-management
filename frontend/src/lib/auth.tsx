"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import { authApi, clearToken, saveToken } from "@/lib/api";
import type { User } from "@/types/api";

// Exact claim URIs used by .NET's ClaimTypes enum
const CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const CLAIM_EMAIL = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const CLAIM_ROLE = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const CLAIM_SID = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

interface JwtPayload {
  [CLAIM_NAME]?: string;
  [CLAIM_EMAIL]?: string;
  [CLAIM_ROLE]?: string;
  [CLAIM_SID]?: string;
  EmployeeId?: string;
  exp?: number;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUser(token: string): User | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);

    const role = (payload[CLAIM_ROLE] ?? "Employee") as "Admin" | "Employee";
    const name = payload[CLAIM_NAME] ?? payload[CLAIM_EMAIL] ?? "User";
    const email = payload[CLAIM_EMAIL] ?? "";
    const idStr = payload[CLAIM_SID];
    const empStr = payload["EmployeeId"];

    return {
      id: idStr ? parseInt(idStr, 10) : 0,
      name,
      email,
      role,
      employeeId: empStr ? parseInt(empStr, 10) : null,
    };
  } catch (e) {
    console.error("JWT decode failed:", e);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("hr_token");
    if (stored) {
      const decoded = decodeUser(stored);
      if (decoded) {
        setToken(stored);
        setUser(decoded);
      } else {
        clearToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken } = await authApi.login({ email, password });
    const decoded = decodeUser(newToken);
    if (!decoded) throw new Error("Failed to read token from server");
    saveToken(newToken);
    setToken(newToken);
    setUser(decoded);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin: user?.role === "Admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
