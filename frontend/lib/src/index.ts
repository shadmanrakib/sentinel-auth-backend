// This file was scaffolded using Gen AI with the openapi specification as the prompt input

/**
 * Sentinel Auth Client
 * A client-side API for interacting with the Sentinel Auth Backend
 */

import { z } from "zod";

// Zod schemas for request and response validation
const TokensResponseSchema = z.object({
  access_token: z.string(),
  id_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});

const RefreshTokensResponseSchema = z.object({
  access_token: z.string(),
  id_token: z.string(),
  expires_in: z.number(),
});

const AuthCodeResponseSchema = z.object({
  code: z.string(),
  expires_in: z.number(),
});

const EmailRegistrationRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  client_id: z.string(),
  code_challenge: z.string(),
  code_challenge_method: z.string(),
  redirect_uri: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
});

const EmailLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  client_id: z.string(),
  code_challenge: z.string(),
  code_challenge_method: z.string(),
  redirect_uri: z.string().url().optional(),
});

const AuthTokenRequestSchema = z.object({
  code: z.string(),
  client_id: z.string(),
  code_verifier: z.string(),
});

const AuthRefreshRequestSchema = z.object({
  refresh_token: z.string(),
  client_id: z.string(),
  code_verifier: z.string(),
});

const AuthVerifyRequestSchema = z.object({
  token: z.string(),
  client_id: z.string(),
});

const AuthVerifyResponseSchema = z.object({
  valid: z.boolean(),
  claims: z.record(z.any()),
});

const ProviderOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo_url: z.string().optional(),
  description: z.string(),
});

const StrippedClientProviderSchema = z.object({
  id: z.string(),
  client_id: z.string(),
  provider_option: ProviderOptionSchema,
  data: z.record(z.any()).nullable().optional(),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
  error_description: z.string(),
});

// Types derived from Zod schemas
export type TokensResponse = z.infer<typeof TokensResponseSchema>;
export type RefreshTokensResponse = z.infer<typeof RefreshTokensResponseSchema>;
export type AuthCodeResponse = z.infer<typeof AuthCodeResponseSchema>;
export type EmailRegistrationRequest = z.infer<
  typeof EmailRegistrationRequestSchema
>;
export type EmailLoginRequest = z.infer<typeof EmailLoginRequestSchema>;
export type AuthTokenRequest = z.infer<typeof AuthTokenRequestSchema>;
export type AuthRefreshRequest = z.infer<typeof AuthRefreshRequestSchema>;
export type AuthVerifyRequest = z.infer<typeof AuthVerifyRequestSchema>;
export type AuthVerifyResponse = z.infer<typeof AuthVerifyResponseSchema>;
export type StrippedClientProvider = z.infer<
  typeof StrippedClientProviderSchema
>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Configuration type for SentinelAuth
export type SentinelAuthConfig = {
  apiBaseUrl: string;
  uiBaseUrl: string;
  clientId: string;
  redirectUri?: string;
  storageType?: "localStorage" | "sessionStorage" | "memory";
  autoRefresh?: boolean;
  refreshThreshold?: number;
};

// Storage interface
export interface Storage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  clear(): void;
}

// JWT Claims interface
export interface JWTClaims {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: JWTClaims | null;
  expiresAt: number | null;
}

export type AuthStateChangeListener = (state: AuthState) => void;

class SentinelAuth {
  private apiBaseUrl: string;
  private uiBaseUrl: string;
  private clientId: string;
  private redirectUri: string | undefined;
  private storageType: "localStorage" | "sessionStorage" | "memory";
  private storage: Storage;
  private autoRefresh: boolean;
  private refreshThreshold: number;
  private refreshTimerId: number | null = null;
  private STORAGE_KEYS: {
    ACCESS_TOKEN: string;
    ID_TOKEN: string;
    REFRESH_TOKEN: string;
    EXPIRES_AT: string;
  };
  private authStateListeners: AuthStateChangeListener[] = [];

  /**
   * Initializes the Sentinel Auth client
   * @param config - Configuration object
   */
  constructor(config: SentinelAuthConfig) {
    // Required config
    if (!config.apiBaseUrl) {
      console.log(config, config.apiBaseUrl)
      throw new Error("baseUrl is required");
    }
    if (!config.clientId) {
      throw new Error("clientId is required");
    }

    this.apiBaseUrl = config.apiBaseUrl.replace(/\/$/, ""); // Remove trailing slash if present
    this.uiBaseUrl = config.uiBaseUrl.replace(/\/$/, ""); // Remove trailing slash if present

    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri || undefined;

    // Storage configuration
    this.storageType = config.storageType || "localStorage";
    this.storage = this._initializeStorage(this.storageType);

    // Token refresh configuration
    this.autoRefresh = config.autoRefresh !== false;
    this.refreshThreshold = config.refreshThreshold || 300; // 5 minutes

    // Token keys in storage
    this.STORAGE_KEYS = {
      ACCESS_TOKEN: `sentinel_access_token_${this.clientId}`,
      ID_TOKEN: `sentinel_id_token_${this.clientId}`,
      REFRESH_TOKEN: `sentinel_refresh_token_${this.clientId}`,
      EXPIRES_AT: `sentinel_expires_at_${this.clientId}`,
    };

    // Initialize refresh timer if needed
    if (this.autoRefresh && this.isAuthenticated()) {
      this._setupRefreshTimer();
    }
  }

  /**
   * Initialize the storage mechanism based on config
   * @private
   */
  private _initializeStorage(
    type: "localStorage" | "sessionStorage" | "memory"
  ): Storage {
    switch (type) {
      case "localStorage":
        return {
          get: (key: string) => localStorage.getItem(key),
          set: (key: string, value: string) => localStorage.setItem(key, value),
          remove: (key: string) => localStorage.removeItem(key),
          clear: () => {
            Object.values(this.STORAGE_KEYS).forEach((key) =>
              localStorage.removeItem(key)
            );
          },
        };
      case "sessionStorage":
        return {
          get: (key: string) => sessionStorage.getItem(key),
          set: (key: string, value: string) =>
            sessionStorage.setItem(key, value),
          remove: (key: string) => sessionStorage.removeItem(key),
          clear: () => {
            Object.values(this.STORAGE_KEYS).forEach((key) =>
              sessionStorage.removeItem(key)
            );
          },
        };
      case "memory":
        const memoryStorage: Record<string, string> = {};
        return {
          get: (key: string) => memoryStorage[key] || null,
          set: (key: string, value: string) => {
            memoryStorage[key] = value;
          },
          remove: (key: string) => {
            delete memoryStorage[key];
          },
          clear: () => {
            Object.values(this.STORAGE_KEYS).forEach((key) => {
              delete memoryStorage[key];
            });
          },
        };
      default:
        throw new Error(`Unsupported storage type: ${type}`);
    }
  }

  /**
   * Setup a timer to refresh the token before it expires
   * @private
   */
  private _setupRefreshTimer(): void {
    const expiresAtStr = this.storage.get(this.STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAtStr) return;

    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Math.floor(Date.now() / 1000);
    const timeUntilRefresh = expiresAt - now - this.refreshThreshold;

    if (timeUntilRefresh <= 0) {
      // Token is already expired or will expire soon, refresh now
      this.refreshTokens().catch((err) =>
        console.error("Failed to refresh tokens:", err)
      );
    } else {
      // Set timer to refresh before expiration
      if (this.refreshTimerId) window.clearTimeout(this.refreshTimerId);
      this.refreshTimerId = window.setTimeout(() => {
        this.refreshTokens().catch((err) =>
          console.error("Failed to refresh tokens:", err)
        );
      }, timeUntilRefresh * 1000);
    }
  }

  /**
   * Get the current auth state
   * @returns Current auth state
   */
  getCurrentAuthState(): AuthState {
    const isAuthenticated = this.isAuthenticated();
    const user = this.getUserInfo();
    const expiresAt = this.getTokenExpiration();

    return {
      isAuthenticated,
      user,
      expiresAt,
    };
  }

  /**
   * Notify all auth state listeners of the current state
   * @private
   */
  private _notifyAuthStateChange(): void {
    const currentState = this.getCurrentAuthState();
    this.authStateListeners.forEach((listener) => {
      try {
        console.log("sub fire");
        listener(currentState);
      } catch (error) {
        console.error("Error in auth state change listener:", error);
      }
    });
  }

  /**
   * Add an auth state change listener
   * @param listener - Function to call when auth state changes
   * @returns Function to remove the listener
   */
  onAuthStateChange(listener: AuthStateChangeListener): () => void {
    this.authStateListeners.push(listener);

    // Immediately notify the new listener of the current state
    try {
      console.log("init fire");
      listener(this.getCurrentAuthState());
    } catch (error) {
      console.error("Error in initial auth state notification:", error);
    }

    // Return a function to remove this listener
    return () => {
      this.authStateListeners = this.authStateListeners.filter(
        (l) => l !== listener
      );
    };
  }

  /**
   * Make API request with proper headers and error handling
   * @private
   */
  private async _makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    responseSchema: z.ZodType<T>
  ): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const mergedOptions: RequestInit = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    if (
      mergedOptions.body &&
      typeof mergedOptions.body === "object" &&
      !(mergedOptions.body instanceof FormData)
    ) {
      mergedOptions.body = JSON.stringify(mergedOptions.body);
    }

    try {
      const response = await fetch(url, mergedOptions);
      const data = await response.json();

      if (!response.ok) {
        try {
          // Validate error response
          const errorData = ErrorResponseSchema.parse(data);
          throw new Error(errorData.error_description || errorData.error);
        } catch (e) {
          if (e instanceof z.ZodError) {
            // Invalid error response format
            throw new Error(`Request failed with status ${response.status}`);
          }
          throw e;
        }
      }

      // Validate response with the provided schema
      try {
        return responseSchema.parse(data);
      } catch (e) {
        if (e instanceof z.ZodError) {
          console.error("API response validation error:", e.errors);
          throw new Error("Invalid response from server");
        }
        throw e;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Failed to fetch") {
          throw new Error("Network error. Please check your connection.");
        }
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  }

  /**
   * Store authentication tokens
   * @private
   */
  private _storeTokens(tokenData: TokensResponse): void {
    const { access_token, id_token, refresh_token, expires_in } = tokenData;

    // Calculate expiration timestamp
    const expiresAt = Math.floor(Date.now() / 1000) + (expires_in || 3600);

    // Store tokens
    this.storage.set(this.STORAGE_KEYS.ACCESS_TOKEN, access_token);
    this.storage.set(this.STORAGE_KEYS.ID_TOKEN, id_token);
    if (refresh_token) {
      this.storage.set(this.STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
    }
    this.storage.set(this.STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

    // Setup refresh timer if auto-refresh is enabled
    if (this.autoRefresh) {
      this._setupRefreshTimer();
    }

    this._notifyAuthStateChange();
  }

  /**
   * Get available authentication providers for this client
   * @returns List of available providers
   */
  async getProviders(): Promise<StrippedClientProvider[]> {
    return this._makeRequest(
      `/auth/providers?client_id=${encodeURIComponent(this.clientId)}`,
      { method: "GET" },
      z.array(StrippedClientProviderSchema)
    );
  }

  /**
   * Register a new user with email and password
   * @param data - Registration data
   * @returns Auth code response
   */
  async registerWithEmail(
    data: Omit<EmailRegistrationRequest, "client_id" | "redirect_uri"> & {
      metadata?: Record<string, any>;
    }
  ): Promise<AuthCodeResponse> {
    // Create and validate payload
    const payload = EmailRegistrationRequestSchema.parse({
      email: data.email,
      password: data.password,
      code_challenge: data.code_challenge,
      code_challenge_method: data.code_challenge_method,
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      metadata: data.metadata || {},
    });

    return this._makeRequest(
      "/auth/providers/email/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      AuthCodeResponseSchema
    );
  }

  /**
   * Login with email and password
   * @param data - Login credentials
   * @returns Auth code response
   */
  async loginWithEmail(
    data: Omit<EmailLoginRequest, "client_id" | "redirect_uri">
  ): Promise<AuthCodeResponse> {
    // Create and validate payload
    const payload = EmailLoginRequestSchema.parse({
      email: data.email,
      password: data.password,
      code_challenge: data.code_challenge,
      code_challenge_method: data.code_challenge_method,
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
    });

    return this._makeRequest(
      "/auth/providers/email/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      AuthCodeResponseSchema
    );
  }

  /**
   * Exchange auth code for tokens and store them
   * @param code - Auth code from login or registration
   * @returns Token response
   */
  async exchangeCodeForTokens(code: string): Promise<TokensResponse> {
    const state = this.storage.get("sentinel_state");
    const codeVerifier = this.storage.get(`sentinel_code_verifier_${state}`);

    if (!codeVerifier) {
      throw new Error("Authentication code verifier missing");
    }

    // Create and validate payload
    const payload = AuthTokenRequestSchema.parse({
      code,
      client_id: this.clientId,
      code_verifier: codeVerifier,
    });

    const response = await this._makeRequest(
      "/auth/token",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      TokensResponseSchema
    );

    // Store the tokens
    this._storeTokens(response);

    return response;
  }

  /**
   * Refresh the access and ID tokens using the refresh token
   * @returns New tokens
   */
  async refreshTokens(): Promise<RefreshTokensResponse> {
    const refreshToken = this.storage.get(this.STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const state = this.storage.get("sentinel_state");
    const codeVerifier = this.storage.get(`sentinel_code_verifier_${state}`);

    if (!codeVerifier) {
      throw new Error("Authentication code verifier missing");
    }

    try {
      // Create and validate payload
      const payload = AuthRefreshRequestSchema.parse({
        refresh_token: refreshToken,
        client_id: this.clientId,
        code_verifier: codeVerifier,
      });

      const response = await this._makeRequest(
        "/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        RefreshTokensResponseSchema
      );

      // Store the new tokens (keeping the existing refresh token)
      this._storeTokens({
        ...response,
        refresh_token: refreshToken, // Keep the existing refresh token if not returned
      });

      return response;
    } catch (error) {
      // If refresh fails, clear the tokens and throw error
      this.logout();
      throw new Error("Token refresh failed. You have been logged out.");
    }
  }

  /**
   * Verify if a token is valid
   * @param token - Token to verify (uses stored access token if not provided)
   * @returns Token verification result
   */
  async verifyToken(token?: string): Promise<AuthVerifyResponse> {
    token = token || this.getAccessToken() || undefined;

    if (!token) {
      throw new Error("No token to verify");
    }

    // Create and validate payload
    const payload = AuthVerifyRequestSchema.parse({
      token,
      client_id: this.clientId,
    });

    return this._makeRequest(
      "/auth/verify",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      AuthVerifyResponseSchema
    );
  }

  /**
   * Get the stored access token
   * @returns Access token or null if not logged in
   */
  getAccessToken(): string | null {
    return this.storage.get(this.STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get the stored ID token
   * @returns ID token or null if not logged in
   */
  getIdToken(): string | null {
    return this.storage.get(this.STORAGE_KEYS.ID_TOKEN);
  }

  /**
   * Get the stored refresh token
   * @returns Refresh token or null if not logged in
   */
  getRefreshToken(): string | null {
    return this.storage.get(this.STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Get the token expiration timestamp
   * @returns Expiration timestamp or null if not logged in
   */
  getTokenExpiration(): number | null {
    const expiresAt = this.storage.get(this.STORAGE_KEYS.EXPIRES_AT);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  /**
   * Parse and decode a JWT token
   * @param token - JWT token to decode
   * @returns Decoded token payload or null if invalid
   */
  decodeToken(token: string): JWTClaims | null {
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  /**
   * Get user information from the ID token
   * @returns User information from the ID token or null if not logged in
   */
  getUserInfo(): JWTClaims | null {
    const idToken = this.getIdToken();
    return idToken ? this.decodeToken(idToken) : null;
  }

  /**
   * Check if the user is authenticated (has valid tokens)
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const expiresAt = this.getTokenExpiration();

    if (!accessToken || !expiresAt) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return expiresAt > now;
  }

  /**
   * Check if the access token is expired or will expire soon
   * @param bufferSeconds - Buffer time in seconds
   * @returns True if token is expired or will expire within buffer time
   */
  isTokenExpired(bufferSeconds = 0): boolean {
    const expiresAt = this.getTokenExpiration();
    if (!expiresAt) return true;

    const now = Math.floor(Date.now() / 1000);
    return expiresAt <= now + bufferSeconds;
  }

  /**
   * Get an authorized request header object for API calls
   * @param refreshIfNeeded - Whether to refresh token if expired
   * @returns Headers object with Authorization header
   */
  async getAuthHeaders(
    refreshIfNeeded = true
  ): Promise<Record<string, string>> {
    if (
      refreshIfNeeded &&
      this.isTokenExpired(this.refreshThreshold) &&
      this.getRefreshToken()
    ) {
      await this.refreshTokens();
    }

    const accessToken = this.getAccessToken();

    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  /**
   * Complete sign-in flow by handling the authentication code
   * @param code - Authentication code (from URL or provided)
   * @returns Auth result
   */
  async handleAuthenticationCallback(code?: string): Promise<TokensResponse> {
    // If no code is provided, try to get it from URL query parameters
    if (!code) {
      const urlParams = new URLSearchParams(window.location.search);
      code = urlParams.get("code") || undefined;
    }

    if (!code) {
      throw new Error("No authentication code found");
    }

    return this.exchangeCodeForTokens(code);
  }

  /**
   * Logout the user by clearing tokens and canceling refresh timer
   */
  logout(): void {
    // Clear the refresh timer
    if (this.refreshTimerId) {
      window.clearTimeout(this.refreshTimerId);
      this.refreshTimerId = null;
    }

    // Clear all tokens from storage
    this.storage.clear();

    this._notifyAuthStateChange();
  }

  /**
   * Generates a random string for state or code verifier
   * @param length - Length of the random string
   * @returns Random string
   */
  private _generateRandomString(length: number = 43): string {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let random = "";
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    randomValues.forEach((val) => (random += charset[val % charset.length]));
    return random;
  }

  /**
   * Generates a code challenge from a code verifier
   * @param codeVerifier - The code verifier string
   * @returns Code challenge string
   */
  private async _generateCodeChallenge(codeVerifier: string): Promise<string> {
    // Hash the code verifier using SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await window.crypto.subtle.digest("SHA-256", data);

    // Convert the hash to base64url encoding
    const hashArr = Array.from(new Uint8Array(hash)); // Convert to regular array
    const hashStr = hashArr.map((byte) => String.fromCharCode(byte)).join("");
    const base64 = btoa(hashStr);

    const base64url = base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return base64url;
  }

  /**
   * Generate authentication URL for a provider with PKCE parameters
   * @param providerId - ID of the authentication provider
   * @param options - Additional options
   * @returns Generated auth URL and PKCE data
   */
  async generateAuthUrl(
    options: {
      redirectUri?: string;
      state?: string;
      codeVerifier?: string;
    } = {}
  ): Promise<{
    url: string;
    state: string;
    codeVerifier: string;
  }> {
    // Use provided values or generate new ones
    const redirectUri = options.redirectUri || this.redirectUri;
    if (!redirectUri) {
      throw new Error(
        "redirectUri is required either in options or constructor config"
      );
    }

    const state = options.state || this._generateRandomString(32);
    const codeVerifier = options.codeVerifier || this._generateRandomString(43);
    const codeChallenge = await this._generateCodeChallenge(codeVerifier);

    // Store code verifier in storage for later use during token exchange
    this.storage.set(`sentinel_code_verifier_${state}`, codeVerifier);

    console.log(codeVerifier, codeChallenge, state);

    // store the state as well
    this.storage.set(`sentinel_state`, state);

    // Build query parameters
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const url = `${this.uiBaseUrl}/?${params.toString()}`;

    return {
      url,
      state,
      codeVerifier,
    };
  }

  /**
   * Handle authentication callback with PKCE support
   * @param options - Callback options
   * @returns Token response
   */
  async handleAuthCallbackWithPKCE(
    options: {
      code?: string;
      state?: string;
      codeVerifier?: string;
    } = {}
  ): Promise<TokensResponse> {
    // If no code or state is provided, try to get them from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = options.code || urlParams.get("code");
    const state = options.state || urlParams.get("state");

    if (!code) {
      throw new Error("No authentication code found");
    }

    let savedState = this.storage.get(`sentinel_state`);
    if (!savedState || savedState !== state) {
      throw new Error("Possible middle man attack");
    }

    let codeVerifier = options.codeVerifier;

    // If state is available and no code verifier provided, try to get from storage
    if (state && !codeVerifier) {
      codeVerifier =
        this.storage.get(`sentinel_code_verifier_${state}`) || undefined;
    }

    if (!codeVerifier) {
      throw new Error("No code verifier found for PKCE auth flow");
    }

    // Create payload for token exchange with code verifier
    const payload = {
      code,
      client_id: this.clientId,
      code_verifier: codeVerifier,
      redirect_uri: this.redirectUri,
    };

    // Exchange code for tokens
    const response = await this._makeRequest(
      "/auth/token",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      TokensResponseSchema
    );

    // Store the tokens
    this._storeTokens(response);

    return response;
  }
}

// Export the SentinelAuth class
export default SentinelAuth;
