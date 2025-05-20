"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import SentinelAuth, { StrippedClientProvider } from "sentinel-auth-client-js"; // Adjust the import path as needed

export default function SignIn() {
  const searchParams = useSearchParams();

  const [clientId, setClientId] = useState<string | null>(null);
  const [providers, setProviders] = useState<StrippedClientProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const auth = useRef<SentinelAuth | null>(null);

  // Get client ID and other params from URL on component mount
  useEffect(() => {
    const clientId = searchParams.get("client_id");
    const redirectUri = searchParams.get("redirect_uri");
    const state = searchParams.get("state");
    const code_challenge = searchParams.get("code_challenge");

    if (!clientId) {
      setError("Missing client ID");
      setLoading(false);
      return;
    }

    setClientId(clientId);

    if (!process.env.NEXT_PUBLIC_AUTH_API_URL) {
      setError("Missing auth api url");
      setLoading(false);
      return;
    }

    // Initialize SentinelAuth client
    // The baseUrl will need to be configured based on your environment
    auth.current = new SentinelAuth({
      baseUrl: process.env.NEXT_PUBLIC_AUTH_API_URL,
      clientId: clientId,
      storageType: "localStorage",
    });

    // Fetch available providers for this client
    fetchProviders();
  }, [searchParams]);

  // Fetch available authentication providers
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const providersData = await auth.current?.getProviders();
      setProviders(providersData ?? []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError("Invalid client or service unavailable");
      setLoading(false);
    }
  };

  // Show error page if client verification failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Head>
          <title>Error - Authentication Service</title>
        </Head>
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while verifying client and fetching providers
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Head>
          <title>Loading - Authentication Service</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">
            Loading authentication options...
          </p>
        </div>
      </div>
    );
  }

  // Render the sign-in / registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Authentication Service</title>
      </Head>
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Log in to your account
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {/* Email Options */}
          {providers.some((p) => p.provider_option.id === "email") && (
            <>
              <a
                href={`/email/login?${searchParams.toString()}`}
                className="border rounded-2xl px-6 py-4 flex gap-4 items-center"
              >
                <img
                  src={
                    providers.find((p) => p.provider_option.id === "email")
                      ?.provider_option.logo_url
                  }
                  alt=""
                />
                <span className="text-gray-800">
                  Log in with{" "}
                  {
                    providers.find((p) => p.provider_option.id === "email")
                      ?.provider_option.name
                  }
                </span>
              </a>
              <a
                href={`/email/login?${searchParams.toString()}`}
                className="border rounded-2xl px-6 py-4 flex gap-4 items-center"
              >
                <img
                  src={
                    providers.find((p) => p.provider_option.id === "email")
                      ?.provider_option.logo_url
                  }
                  alt=""
                />
                <span className="text-gray-800">
                  Sign up with{" "}
                  {
                    providers.find((p) => p.provider_option.id === "email")
                      ?.provider_option.name
                  }
                </span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
