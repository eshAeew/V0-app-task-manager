export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_email_verified: boolean;
}

export interface AccessRequestRecord {
  id: number;
  work_email: string;
  employee_code: string;
  department_name: string;
  designation_name: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  debug_setup_token?: string | null;
  debug_setup_url?: string | null;
}

export interface AuthSession {
  id: number;
  user_agent: string;
  ip_address: string | null;
  created_at: string;
  last_seen_at: string;
  revoked_at: string | null;
  is_current: boolean;
}

export interface LoginResponse {
  email: string;
  otp_required: boolean;
  otp_expires_at: string;
  debug_otp_code?: string | null;
}

export interface VerifyOtpResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface StoredAuthState {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export const authStorageKeys = {
  session: "northstar-auth-session",
  pendingEmail: "northstar-pending-email",
  pendingOtpCode: "northstar-pending-otp-debug",
};

async function request<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let detail = "Request failed.";
    try {
      const data = await response.json();
      detail = data.detail || JSON.stringify(data);
      if (data.locked_until) {
        detail = `${detail} Locked until ${data.locked_until}`;
      }
    } catch {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const authClient = {
  getStoredSession(): StoredAuthState | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(authStorageKeys.session);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredAuthState;
    } catch {
      return null;
    }
  },
  saveStoredSession(session: StoredAuthState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(authStorageKeys.session, JSON.stringify(session));
  },
  clearStoredSession() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(authStorageKeys.session);
  },
  setPendingEmail(email: string, debugOtpCode?: string | null) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(authStorageKeys.pendingEmail, email);
    if (debugOtpCode) {
      window.sessionStorage.setItem(authStorageKeys.pendingOtpCode, debugOtpCode);
    } else {
      window.sessionStorage.removeItem(authStorageKeys.pendingOtpCode);
    }
  },
  getPendingEmail() {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(authStorageKeys.pendingEmail);
  },
  getPendingOtpCode() {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(authStorageKeys.pendingOtpCode);
  },
  clearPendingEmail() {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(authStorageKeys.pendingEmail);
    window.sessionStorage.removeItem(authStorageKeys.pendingOtpCode);
  },
  getBootstrapState() {
    return request<{ needs_bootstrap: boolean }>("/auth/bootstrap-state");
  },
  bootstrapAdmin(payload: { email: string; password: string; full_name: string }) {
    return request<AuthUser>("/auth/bootstrap-admin", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  requestAccess(payload: {
    work_email: string;
    employee_code: string;
    department_name: string;
    designation_name: string;
    justification: string;
  }) {
    return request<AccessRequestRecord>("/auth/access-request", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  setPassword(payload: { token: string; password: string }) {
    return request<{ email: string; password_set: boolean }>("/auth/set-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload: { email: string; password: string }) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  verifyOtp(payload: { email: string; otp: string }) {
    return request<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  resendOtp(payload: { email: string }) {
    return request<LoginResponse>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me(accessToken: string) {
    return request<AuthUser>("/auth/me", { method: "GET" }, accessToken);
  },
  refresh(refreshToken: string) {
    return request<{ access_token: string; user: AuthUser }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
  logout(refreshToken: string, accessToken: string) {
    return request<void>(
      "/auth/logout",
      {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
      accessToken
    );
  },
  getSessions(accessToken: string) {
    return request<AuthSession[]>("/auth/sessions", { method: "GET" }, accessToken);
  },
  getAccessRequests(accessToken: string) {
    return request<AccessRequestRecord[]>("/auth/access-requests", { method: "GET" }, accessToken);
  },
  approveAccessRequest(requestId: number, accessToken: string) {
    return request<AccessRequestRecord>(
      `/auth/access-request/${requestId}/approve`,
      { method: "POST", body: JSON.stringify({}) },
      accessToken
    );
  },
  rejectAccessRequest(requestId: number, accessToken: string) {
    return request<AccessRequestRecord>(
      `/auth/access-request/${requestId}/reject`,
      { method: "POST", body: JSON.stringify({}) },
      accessToken
    );
  },
};
