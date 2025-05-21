"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import SentinelAuth, { JWTClaims, AuthState } from "sentinel-auth-client-js";

const AuthContext = createContext<
  | {
      user: JWTClaims | null;
      loading: boolean;
      isAuthenticated: boolean;
      expiresAt: number | null;
      auth: SentinelAuth;
      logout: () => void;
    }
  | undefined
>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    expiresAt: null,
  });
  const [loading, setLoading] = useState(true);
  const authRef = useRef<SentinelAuth | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    if (!authRef.current) {
      const config = {
        apiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_API_URL || 'http://104.248.57.142:8080/v1',
        uiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_UI_URL || 'http://104.248.57.142:3000',
        clientId: process.env.NEXT_PUBLIC_SENTINEL_CLIENT_ID || '995b8108-a26d-4ac7-bd1e-faa5efa47e48',
        redirectUri: process.env.NEXT_PUBLIC_SENTINEL_REDIRECT_URI || 'http://104.248.57.142:3001/auth',
        storageType: "localStorage" as const,
        autoRefresh: true,
      };
      const sentinelAuth = new SentinelAuth(config);
      console.log(config);
      authRef.current = sentinelAuth;

      // Subscribe to auth state changes
      const unsubscribe = sentinelAuth.onAuthStateChange((state) => {
        setAuthState(state);
        setLoading(false);
      });

      unsubscribeRef.current = unsubscribe;
    }

    setAuthState(authRef.current.getCurrentAuthState());

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const logout = () => {
    if (authRef.current) {
      authRef.current.logout();
    }
  };

  if (!authRef.current) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        loading,
        isAuthenticated: authState.isAuthenticated,
        expiresAt: authState.expiresAt,
        auth: authRef.current,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
