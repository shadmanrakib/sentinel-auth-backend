"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Initializing authentication...");
  const [error, setError] = useState<string | null>(null);
  const { auth, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
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

          if (!state) {
            setStatus("No authentication state found in URL");
            setError("Authentication failed. Please try again.");
            return;
          }

          setStatus("Processing authentication...");

          console.log({ code, state });

          // Handle the authentication callback with PKCE
          await auth.handleAuthCallbackWithPKCE({ code, state });

          setStatus("Authentication successful!");

          // Get user info from the token
          const userInfo = auth.getUserInfo();
          console.log("User authenticated:", userInfo);

          // Redirect to dashboard or home page after successful authentication
          setTimeout(() => {
            router.push("/dashboard"); // Or wherever you want to redirect users after login
          }, 500);
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
    }
  }, [searchParams, router, loading, auth]); // Re-run when search params change

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
