"use client";

import Head from "next/head";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import SentinelAuth, { StrippedClientProvider } from "sentinel-auth-client-js";

type LoginFormInputs = {
  email: string;
  password: string;
};

const EmailLoginPage = () => {
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [clientId, setClientId] = useState<string | null>(null);
  const [providers, setProviders] = useState<StrippedClientProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authInProgress, setAuthInProgress] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

  // Handle signin with email and password
  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setAuthInProgress(true);
      setGeneralError("");

      const response = await auth.current?.loginWithEmail({
        email: data.email,
        password: data.password,
      });

      // Redirect with the authorization code
      if (response) {
        console.log(response);
        handleAuthSuccess(response.code);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Login error:", err);
      setGeneralError(
        err.message || "Failed to login. Please check your credentials."
      );
      setAuthInProgress(false);
    }
  };

  // Handle successful authentication (redirect with code)
  const handleAuthSuccess = (code: string) => {
    const redirectUri = searchParams.get("redirect_uri");
    const state = searchParams.get("state");

    let finalRedirectUri = redirectUri;

    // If no redirect URI was provided, we need to request the default from the API
    if (!finalRedirectUri) {
      // For this implementation, we'll redirect to a success page
      // In a real implementation, you might need to fetch the default redirect from the API
      finalRedirectUri = `${window.location.origin}/auth/success`;
    }

    // Build the redirect URL with the authorization code
    const redirectTo =
      `${finalRedirectUri}${finalRedirectUri.includes("?") ? "&" : "?"}` +
      new URLSearchParams({
        code,
        ...(state && { state }),
      }).toString();

    console.log(redirectTo);

    // Redirect the user
    window.location.href = redirectTo;
  };

  // Show error page if client verification failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Login - Authentication Service</title>
      </Head>
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {generalError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{generalError}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must have at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div></div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || authInProgress}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isSubmitting || authInProgress ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="animate-spin h-5 w-5 text-indigo-300"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {"Don't have an account?"}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`/email/signup?${searchParamsString}`}
              className="w-full flex justify-center py-2 px-4 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailLoginPage;
