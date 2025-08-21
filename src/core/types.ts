/**
 * Main configuration interface for OAuth2Service
 */
export interface OAuth2Config {
  /** OAuth2 client ID from your provider */
  clientId: string;
  
  /** Authorization server's authorization endpoint URL */
  authorizationEndpoint: string;
  
  /** Authorization server's token endpoint URL */
  tokenEndpoint: string;
  
  /** Redirect URI registered with your OAuth2 provider */
  redirectUri: string;
  
  /** Space-delimited list of scopes */
  scope?: string;
  
  /** Optional logout endpoint */
  logoutEndpoint?: string;
  
  /** Enable automatic token refresh before expiry */
  autoRefresh?: boolean;
  
  /** Buffer time in seconds before token expiry to trigger refresh */
  refreshBufferTime?: number;
  
  /** Callback when tokens are refreshed */
  onTokenRefresh?: (tokens: TokenResponse) => void;
  
  /** Callback on authentication state change */
  onAuthStateChange?: (isAuthenticated: boolean) => void;
  
  /** Storage key prefix for tokens */
  storageKeyPrefix?: string;
  
  /** Custom storage implementation */
  storage?: Storage;
  
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * OAuth2 token response structure
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

/**
 * OAuth2 error response
 */
export interface OAuth2Error {
  error: string;
  error_description?: string;
  error_uri?: string;
}

/**
 * Current authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number | null;
  scope: string | null;
  error: OAuth2Error | null;
}

/**
 * PKCE (Proof Key for Code Exchange) parameters
 */
export interface PKCEParams {
  codeVerifier: string;
  codeChallenge: string;
  challengeMethod: 'S256';
}

/**
 * Authorization request parameters
 */
export interface AuthorizationParams {
  response_type: 'code';
  client_id: string;
  redirect_uri: string;
  scope?: string;
  state: string;
  code_challenge: string;
  code_challenge_method: 'S256';
  [key: string]: string | undefined;
}

/**
 * Token request parameters
 */
export interface TokenRequestParams {
  grant_type: 'authorization_code' | 'refresh_token';
  code?: string;
  refresh_token?: string;
  client_id: string;
  redirect_uri?: string;
  code_verifier?: string;
}