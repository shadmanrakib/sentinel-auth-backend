"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function Dashboard() {
  const { user, loading, auth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Generate authentication URL with PKCE
      const { url } = await auth.generateAuthUrl();
      // Redirect to the authentication UI
      window.location.href = url;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show login page only if not authenticated
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-70"
        >
          {isLoading ? "Loading..." : "Sign in with SentinelAuth"}
        </button>
      </div>
    </div>
  );
}