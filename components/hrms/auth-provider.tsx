"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  authClient,
  type AccessRequestRecord,
  type AuthSession,
  type AuthUser,
  type StoredAuthState,
} from "@/lib/auth-client";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  requestAccess: typeof authClient.requestAccess;
  login: typeof authClient.login;
  verifyOtp: typeof authClient.verifyOtp;
  resendOtp: typeof authClient.resendOtp;
  setPassword: typeof authClient.setPassword;
  logout: () => Promise<void>;
  getAccessRequests: () => Promise<AccessRequestRecord[]>;
  approveAccessRequest: (requestId: number) => Promise<AccessRequestRecord>;
  rejectAccessRequest: (requestId: number) => Promise<AccessRequestRecord>;
  getSessions: () => Promise<AuthSession[]>;
  bootstrapAdmin: typeof authClient.bootstrapAdmin;
  getBootstrapState: typeof authClient.getBootstrapState;
  setPendingEmail: typeof authClient.setPendingEmail;
  getPendingEmail: typeof authClient.getPendingEmail;
  getPendingOtpCode: typeof authClient.getPendingOtpCode;
  clearPendingEmail: typeof authClient.clearPendingEmail;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(session: StoredAuthState | null, setUser: (user: AuthUser | null) => void, setAccessToken: (token: string | null) => void, setRefreshToken: (token: string | null) => void, setStatus: (status: AuthStatus) => void) {
  if (!session) {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setStatus("anonymous");
    return;
  }
  setUser(session.user);
  setAccessToken(session.accessToken);
  setRefreshToken(session.refreshToken);
  setStatus("authenticated");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      const stored = authClient.getStoredSession();
      if (!stored) {
        if (mounted) setStatus("anonymous");
        return;
      }

      try {
        const freshUser = await authClient.me(stored.accessToken);
        if (!mounted) return;
        authClient.saveStoredSession({ ...stored, user: freshUser });
        applySession({ ...stored, user: freshUser }, setUser, setAccessToken, setRefreshToken, setStatus);
      } catch {
        try {
          const refreshed = await authClient.refresh(stored.refreshToken);
          if (!mounted) return;
          const nextSession = {
            accessToken: refreshed.access_token,
            refreshToken: stored.refreshToken,
            user: refreshed.user,
          };
          authClient.saveStoredSession(nextSession);
          applySession(nextSession, setUser, setAccessToken, setRefreshToken, setStatus);
        } catch {
          authClient.clearStoredSession();
          if (mounted) setStatus("anonymous");
        }
      }
    };

    void restore();
    return () => {
      mounted = false;
    };
  }, []);

  const logout = async () => {
    if (accessToken && refreshToken) {
      try {
        await authClient.logout(refreshToken, accessToken);
      } catch {
        // Ignore remote logout errors and clear local session anyway.
      }
    }
    authClient.clearStoredSession();
    applySession(null, setUser, setAccessToken, setRefreshToken, setStatus);
  };

  const getAccessRequests = async () => {
    if (!accessToken) throw new Error("Not authenticated.");
    return authClient.getAccessRequests(accessToken);
  };

  const approveAccessRequest = async (requestId: number) => {
    if (!accessToken) throw new Error("Not authenticated.");
    return authClient.approveAccessRequest(requestId, accessToken);
  };

  const rejectAccessRequest = async (requestId: number) => {
    if (!accessToken) throw new Error("Not authenticated.");
    return authClient.rejectAccessRequest(requestId, accessToken);
  };

  const getSessions = async () => {
    if (!accessToken) throw new Error("Not authenticated.");
    return authClient.getSessions(accessToken);
  };

  const value: AuthContextValue = {
    status,
    user,
    accessToken,
    refreshToken,
    requestAccess: authClient.requestAccess,
    login: authClient.login,
    verifyOtp: async (payload) => {
      const result = await authClient.verifyOtp(payload);
      const session = {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        user: result.user,
      };
      authClient.saveStoredSession(session);
      authClient.clearPendingEmail();
      applySession(session, setUser, setAccessToken, setRefreshToken, setStatus);
      return result;
    },
    resendOtp: authClient.resendOtp,
    setPassword: authClient.setPassword,
    logout,
    getAccessRequests,
    approveAccessRequest,
    rejectAccessRequest,
    getSessions,
    bootstrapAdmin: authClient.bootstrapAdmin,
    getBootstrapState: authClient.getBootstrapState,
    setPendingEmail: authClient.setPendingEmail,
    getPendingEmail: authClient.getPendingEmail,
    getPendingOtpCode: authClient.getPendingOtpCode,
    clearPendingEmail: authClient.clearPendingEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
