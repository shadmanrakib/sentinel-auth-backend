import { z } from 'zod';

/**
 * Sentinel Auth Client
 * A client-side API for interacting with the Sentinel Auth Backend
 */

declare const TokensResponseSchema: z.ZodObject<{
    access_token: z.ZodString;
    id_token: z.ZodString;
    refresh_token: z.ZodString;
    expires_in: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_in: number;
}, {
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_in: number;
}>;
declare const RefreshTokensResponseSchema: z.ZodObject<{
    access_token: z.ZodString;
    id_token: z.ZodString;
    expires_in: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    access_token: string;
    id_token: string;
    expires_in: number;
}, {
    access_token: string;
    id_token: string;
    expires_in: number;
}>;
declare const AuthCodeResponseSchema: z.ZodObject<{
    code: z.ZodString;
    expires_in: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    expires_in: number;
    code: string;
}, {
    expires_in: number;
    code: string;
}>;
declare const EmailRegistrationRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    client_id: z.ZodString;
    redirect_uri: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    client_id: string;
    redirect_uri?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    email: string;
    password: string;
    client_id: string;
    redirect_uri?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
declare const EmailLoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    client_id: z.ZodString;
    redirect_uri: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    client_id: string;
    redirect_uri?: string | undefined;
}, {
    email: string;
    password: string;
    client_id: string;
    redirect_uri?: string | undefined;
}>;
declare const AuthTokenRequestSchema: z.ZodObject<{
    code: z.ZodString;
    client_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: string;
    client_id: string;
}, {
    code: string;
    client_id: string;
}>;
declare const AuthRefreshRequestSchema: z.ZodObject<{
    refresh_token: z.ZodString;
    client_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refresh_token: string;
    client_id: string;
}, {
    refresh_token: string;
    client_id: string;
}>;
declare const AuthVerifyRequestSchema: z.ZodObject<{
    token: z.ZodString;
    client_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    client_id: string;
    token: string;
}, {
    client_id: string;
    token: string;
}>;
declare const AuthVerifyResponseSchema: z.ZodObject<{
    valid: z.ZodBoolean;
    claims: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    valid: boolean;
    claims: Record<string, any>;
}, {
    valid: boolean;
    claims: Record<string, any>;
}>;
declare const StrippedClientProviderSchema: z.ZodObject<{
    id: z.ZodString;
    client_id: z.ZodString;
    provider_option: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        logo_url: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description: string;
        logo_url?: string | undefined;
    }, {
        id: string;
        name: string;
        description: string;
        logo_url?: string | undefined;
    }>;
    data: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    client_id: string;
    id: string;
    provider_option: {
        id: string;
        name: string;
        description: string;
        logo_url?: string | undefined;
    };
    data?: Record<string, any> | null | undefined;
}, {
    client_id: string;
    id: string;
    provider_option: {
        id: string;
        name: string;
        description: string;
        logo_url?: string | undefined;
    };
    data?: Record<string, any> | null | undefined;
}>;
declare const ErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
    error_description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: string;
    error_description: string;
}, {
    error: string;
    error_description: string;
}>;
type TokensResponse = z.infer<typeof TokensResponseSchema>;
type RefreshTokensResponse = z.infer<typeof RefreshTokensResponseSchema>;
type AuthCodeResponse = z.infer<typeof AuthCodeResponseSchema>;
type EmailRegistrationRequest = z.infer<typeof EmailRegistrationRequestSchema>;
type EmailLoginRequest = z.infer<typeof EmailLoginRequestSchema>;
type AuthTokenRequest = z.infer<typeof AuthTokenRequestSchema>;
type AuthRefreshRequest = z.infer<typeof AuthRefreshRequestSchema>;
type AuthVerifyRequest = z.infer<typeof AuthVerifyRequestSchema>;
type AuthVerifyResponse = z.infer<typeof AuthVerifyResponseSchema>;
type StrippedClientProvider = z.infer<typeof StrippedClientProviderSchema>;
type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
type SentinelAuthConfig = {
    baseUrl: string;
    clientId: string;
    redirectUri?: string;
    storageType?: 'localStorage' | 'sessionStorage' | 'memory';
    autoRefresh?: boolean;
    refreshThreshold?: number;
};
interface Storage {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
    clear(): void;
}
interface JWTClaims {
    sub: string;
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    [key: string]: any;
}
declare class SentinelAuth {
    private baseUrl;
    private clientId;
    private redirectUri;
    private storageType;
    private storage;
    private autoRefresh;
    private refreshThreshold;
    private refreshTimerId;
    private STORAGE_KEYS;
    /**
     * Initializes the Sentinel Auth client
     * @param config - Configuration object
     */
    constructor(config: SentinelAuthConfig);
    /**
     * Initialize the storage mechanism based on config
     * @private
     */
    private _initializeStorage;
    /**
     * Setup a timer to refresh the token before it expires
     * @private
     */
    private _setupRefreshTimer;
    /**
     * Make API request with proper headers and error handling
     * @private
     */
    private _makeRequest;
    /**
     * Store authentication tokens
     * @private
     */
    private _storeTokens;
    /**
     * Get available authentication providers for this client
     * @returns List of available providers
     */
    getProviders(): Promise<StrippedClientProvider[]>;
    /**
     * Register a new user with email and password
     * @param data - Registration data
     * @returns Auth code response
     */
    registerWithEmail(data: Omit<EmailRegistrationRequest, 'client_id' | 'redirect_uri'> & {
        metadata?: Record<string, any>;
    }): Promise<AuthCodeResponse>;
    /**
     * Login with email and password
     * @param data - Login credentials
     * @returns Auth code response
     */
    loginWithEmail(data: Omit<EmailLoginRequest, 'client_id' | 'redirect_uri'>): Promise<AuthCodeResponse>;
    /**
     * Exchange auth code for tokens and store them
     * @param code - Auth code from login or registration
     * @returns Token response
     */
    exchangeCodeForTokens(code: string): Promise<TokensResponse>;
    /**
     * Refresh the access and ID tokens using the refresh token
     * @returns New tokens
     */
    refreshTokens(): Promise<RefreshTokensResponse>;
    /**
     * Verify if a token is valid
     * @param token - Token to verify (uses stored access token if not provided)
     * @returns Token verification result
     */
    verifyToken(token?: string): Promise<AuthVerifyResponse>;
    /**
     * Get the stored access token
     * @returns Access token or null if not logged in
     */
    getAccessToken(): string | null;
    /**
     * Get the stored ID token
     * @returns ID token or null if not logged in
     */
    getIdToken(): string | null;
    /**
     * Get the stored refresh token
     * @returns Refresh token or null if not logged in
     */
    getRefreshToken(): string | null;
    /**
     * Get the token expiration timestamp
     * @returns Expiration timestamp or null if not logged in
     */
    getTokenExpiration(): number | null;
    /**
     * Parse and decode a JWT token
     * @param token - JWT token to decode
     * @returns Decoded token payload or null if invalid
     */
    decodeToken(token: string): JWTClaims | null;
    /**
     * Get user information from the ID token
     * @returns User information from the ID token or null if not logged in
     */
    getUserInfo(): JWTClaims | null;
    /**
     * Check if the user is authenticated (has valid tokens)
     * @returns True if authenticated, false otherwise
     */
    isAuthenticated(): boolean;
    /**
     * Check if the access token is expired or will expire soon
     * @param bufferSeconds - Buffer time in seconds
     * @returns True if token is expired or will expire within buffer time
     */
    isTokenExpired(bufferSeconds?: number): boolean;
    /**
     * Get an authorized request header object for API calls
     * @param refreshIfNeeded - Whether to refresh token if expired
     * @returns Headers object with Authorization header
     */
    getAuthHeaders(refreshIfNeeded?: boolean): Promise<Record<string, string>>;
    /**
     * Complete sign-in flow by handling the authentication code
     * @param code - Authentication code (from URL or provided)
     * @returns Auth result
     */
    handleAuthenticationCallback(code?: string): Promise<TokensResponse>;
    /**
     * Logout the user by clearing tokens and canceling refresh timer
     */
    logout(): void;
}

export { SentinelAuth as default };
export type { AuthCodeResponse, AuthRefreshRequest, AuthTokenRequest, AuthVerifyRequest, AuthVerifyResponse, EmailLoginRequest, EmailRegistrationRequest, ErrorResponse, JWTClaims, RefreshTokensResponse, SentinelAuthConfig, Storage, StrippedClientProvider, TokensResponse };
