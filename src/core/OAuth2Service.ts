/**
 * OAuth2 Service with PKCE implementation
 */

import type { 
  OAuth2Config, 
  TokenResponse, 
  AuthState, 
  OAuth2Error,
  AuthorizationParams,
  TokenRequestParams 
} from './types';
import { DEFAULT_REFRESH_BUFFER, GRANT_TYPE, RESPONSE_TYPE } from './constants';
import { generateRandomString, generatePKCEParams, validateState } from '../utils/crypto';
import { TokenStorage } from '../utils/storage';
import { buildUrl, parseQueryParams, isRedirectUri } from '../utils/url';

export class OAuth2Service {
  private config: Required<OAuth2Config>;
  private storage: TokenStorage;
  private refreshTimer?: NodeJS.Timeout;
  private refreshPromise?: Promise<void>;

  constructor(config: OAuth2Config) {
    this.config = {
      scope: '',
      autoRefresh: true,
      refreshBufferTime: DEFAULT_REFRESH_BUFFER,
      onTokenRefresh: () => {},
      onAuthStateChange: () => {},
      storageKeyPrefix: 'oauth2_',
      storage: typeof window !== 'undefined' ? localStorage : undefined!,
      debug: false,
      logoutEndpoint: '',
      ...config,
    };

    this.storage = new TokenStorage(this.config.storage, this.config.storageKeyPrefix);
    
    // Check for existing session
    if (this.isAuthenticated()) {
      this.scheduleTokenRefresh();
    }

    // Handle callback if we're on the redirect URI
    if (typeof window !== 'undefined' && isRedirectUri(this.config.redirectUri)) {
      this.handleCallback().catch(error => {
        this.log('Error handling callback:', error);
      });
    }
  }

  /**
   * Start the authorization flow
   */
  public async authorize(additionalParams?: Record<string, string>): Promise<void> {
    try {
      // Generate PKCE parameters
      const { codeVerifier, codeChallenge } = await generatePKCEParams();
      const state = generateRandomString(32);

      // Store for later use
      this.storage.setCodeVerifier(codeVerifier);
      this.storage.setState(state);

      // Build authorization URL
      const params: AuthorizationParams = {
        response_type: RESPONSE_TYPE.CODE,
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        scope: this.config.scope,
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        ...additionalParams,
      };

      const authUrl = buildUrl(this.config.authorizationEndpoint, params);
      
      // Redirect to authorization server
      window.location.href = authUrl;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Handle the OAuth2 callback
   */
  public async handleCallback(url?: string): Promise<void> {
    try {
      const params = parseQueryParams(url || window.location.href);
      
      // Check for errors
      if (params.error) {
        const error: OAuth2Error = {
          error: params.error,
          error_description: params.error_description,
          error_uri: params.error_uri,
        };
        throw error;
      }

      // Validate state
      const storedState = this.storage.getState();
      if (!storedState || !validateState(params.state, storedState)) {
        throw new Error('Invalid state parameter');
      }

      // Exchange code for tokens
      const codeVerifier = this.storage.getCodeVerifier();
      if (!params.code || !codeVerifier) {
        throw new Error('Missing authorization code or code verifier');
      }

      await this.exchangeCodeForToken(params.code, codeVerifier);
      
      // Clean up temporary storage
      this.storage.clearTemporary();
      
      // Clean up URL
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForToken(code: string, codeVerifier: string): Promise<void> {
    const params: TokenRequestParams = {
      grant_type: GRANT_TYPE.AUTHORIZATION_CODE,
      code,
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      code_verifier: codeVerifier,
    };

    const tokens = await this.makeTokenRequest(params);
    this.storeTokens(tokens);
    this.scheduleTokenRefresh();
    this.config.onAuthStateChange(true);
  }

  /**
   * Refresh the access token
   */
  public async refreshAccessToken(): Promise<void> {
    // Prevent concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = undefined;
    }
  }

  private async performRefresh(): Promise<void> {
    const refreshToken = this.storage.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const params: TokenRequestParams = {
        grant_type: GRANT_TYPE.REFRESH_TOKEN,
        refresh_token: refreshToken,
        client_id: this.config.clientId,
      };

      const tokens = await this.makeTokenRequest(params);
      this.storeTokens(tokens);
      this.scheduleTokenRefresh();
      this.config.onTokenRefresh(tokens);
    } catch (error) {
      // If refresh fails, clear session
      this.logout();
      throw error;
    }
  }

  /**
   * Make a token request to the token endpoint
   */
  private async makeTokenRequest(params: TokenRequestParams): Promise<TokenResponse> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params as any).toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  /**
   * Store tokens in storage
   */
  private storeTokens(tokens: TokenResponse): void {
    this.storage.setAccessToken(tokens.access_token);
    
    if (tokens.refresh_token) {
      this.storage.setRefreshToken(tokens.refresh_token);
    }
    
    if (tokens.id_token) {
      this.storage.setIdToken(tokens.id_token);
    }
    
    if (tokens.scope) {
      this.storage.setScope(tokens.scope);
    }
    
    if (tokens.expires_in) {
      const expiresAt = Date.now() + tokens.expires_in * 1000;
      this.storage.setExpiresAt(expiresAt);
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    if (!this.config.autoRefresh) {
      return;
    }

    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const expiresAt = this.storage.getExpiresAt();
    if (!expiresAt) {
      return;
    }

    const now = Date.now();
    const refreshAt = expiresAt - (this.config.refreshBufferTime * 1000);
    const delay = Math.max(0, refreshAt - now);

    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken().catch(error => {
        this.log('Auto-refresh failed:', error);
      });
    }, delay);
  }

  /**
   * Get the current access token
   */
  public getAccessToken(): string | null {
    const token = this.storage.getAccessToken();
    const expiresAt = this.storage.getExpiresAt();
    
    // Check if token is expired
    if (token && expiresAt && Date.now() >= expiresAt) {
      this.logout();
      return null;
    }
    
    return token;
  }

  /**
   * Get the current refresh token
   */
  public getRefreshToken(): string | null {
    return this.storage.getRefreshToken();
  }

  /**
   * Get the ID token (if available)
   */
  public getIdToken(): string | null {
    return this.storage.getIdToken();
  }

  /**
   * Get token expiry time
   */
  public getTokenExpiry(): number | null {
    return this.storage.getExpiresAt();
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  /**
   * Get the current authentication state
   */
  public getAuthState(): AuthState {
    return {
      isAuthenticated: this.isAuthenticated(),
      isLoading: false,
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
      idToken: this.getIdToken(),
      expiresAt: this.getTokenExpiry(),
      scope: this.storage.getScope(),
      error: null,
    };
  }

  /**
   * Logout the user
   */
  public logout(redirectTo?: string): void {
    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Clear storage
    this.storage.clear();
    
    // Notify state change
    this.config.onAuthStateChange(false);

    // Handle logout redirect
    if (this.config.logoutEndpoint) {
      const params = {
        client_id: this.config.clientId,
        post_logout_redirect_uri: redirectTo || window.location.origin,
      };
      window.location.href = buildUrl(this.config.logoutEndpoint, params);
    } else if (redirectTo) {
      window.location.href = redirectTo;
    }
  }

  /**
   * Handle errors
   */
  private handleError(error: Error | OAuth2Error): void {
    this.log('OAuth2 Error:', error);
    
    if ('error' in error) {
      console.error(`OAuth2 Error: ${error.error}`, error.error_description);
    } else {
      console.error('OAuth2 Error:', error.message);
    }
  }

  /**
   * Debug logging
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[OAuth2Service]', ...args);
    }
  }
}