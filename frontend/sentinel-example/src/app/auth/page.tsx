"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SentinelAuth from "sentinel-auth-client-js";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Initializing authentication...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize SentinelAuth client
    const sentinelAuth = new SentinelAuth({
      apiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_API_URL!,
      uiBaseUrl: process.env.NEXT_PUBLIC_SENTINEL_UI_URL!,
      clientId: process.env.NEXT_PUBLIC_SENTINEL_CLIENT_ID!,
      redirectUri: process.env.NEXT_PUBLIC_SENTINEL_REDIRECT_URI!,
      storageType: "localStorage", // Or 'sessionStorage' based on your needs
      autoRefresh: true,
    });

    const handleAuthentication = async () => {
      try {
        // Get code and state from URL search params
        const code = searchParams.get("code") || undefined;
        const state = searchParams.get("state") || undefined;

        if (!code) {
          setStatus("No authentication code found in URL");
          setError("Authentication failed. Please try again.");
          return;
        }

        setStatus("Processing authentication...");

        // Handle the authentication callback with PKCE
        await sentinelAuth.handleAuthCallbackWithPKCE({ code, state });

        setStatus("Authentication successful!");

        // Get user info from the token
        const userInfo = sentinelAuth.getUserInfo();
        console.log("User authenticated:", userInfo);

        // Redirect to dashboard or home page after successful authentication
        setTimeout(() => {
          router.push("/dashboard"); // Or wherever you want to redirect users after login
          router.refresh(); // Force refresh to update auth state across the app
        }, 1500);
      } catch (err) {
        console.error("Authentication error:", err);
        setStatus("Authentication failed");
        const errMessage =
          err &&
          typeof err === "object" &&
          "message" in err &&
          typeof err.message === "string"
            ? err.message
            : null;
        setError(errMessage || "An error occurred during authentication");

        // Optionally redirect to login page after error
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    handleAuthentication();
  }, [searchParams, router]); // Re-run when search params change

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Authentication</h1>
          <p className="mt-2 text-sm text-gray-600">{status}</p>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {status === "Authentication successful!" && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              You have successfully logged in! Redirecting...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
