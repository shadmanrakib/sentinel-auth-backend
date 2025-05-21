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
      const sentinelAuth = new SentinelAuth({
        apiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_API_URL!,
        uiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_UI_URL!,
        clientId: process.env.NEXT_PUBLIC_SENTINEL_CLIENT_ID!,
        redirectUri: process.env.NEXT_PUBLIC_SENTINEL_REDIRECT_URI,
        storageType: "localStorage",
        autoRefresh: true,
      });
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
