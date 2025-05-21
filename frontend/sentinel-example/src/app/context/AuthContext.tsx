"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import SentinelAuth, { JWTClaims } from "sentinel-auth-client-js";

const AuthContext = createContext<
  | {
      user: JWTClaims | null;
      loading: boolean;
      auth: SentinelAuth;
      logout: () => void;
    }
  | undefined
>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<JWTClaims | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(
    () =>
      new SentinelAuth({
        apiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_API_URL!,
        uiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_UI_URL!,
        clientId: process.env.NEXT_PUBLIC_SENTINEL_CLIENT_ID!,
        redirectUri: process.env.NEXT_PUBLIC_SENTINEL_REDIRECT_URI,
        storageType: "memory",
        autoRefresh: true,
      })
  );

  const inited = useRef(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    let a = auth;
    if (!inited.current) {
      const localAuth = new SentinelAuth({
        apiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_API_URL!,
        uiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_UI_URL!,
        clientId: process.env.NEXT_PUBLIC_SENTINEL_CLIENT_ID!,
        redirectUri: process.env.NEXT_PUBLIC_SENTINEL_REDIRECT_URI,
        storageType: "localStorage",
        autoRefresh: true,
      });
      setAuth(localAuth);
      a = localAuth;
      inited.current = true;
    }

    // Check if user is authenticated
    if (a.isAuthenticated()) {
      const userInfo = a.getUserInfo();
      setUser(userInfo);
    }
    setLoading(false);
  }, [auth]);

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, auth, logout }}>
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
