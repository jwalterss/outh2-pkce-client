/**
 * React hook for OAuth2 authentication
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { OAuth2Service } from '../core/OAuth2Service';
import type { OAuth2Config, AuthState } from '../core/types';

export interface UseOAuth2Return extends AuthState {
  login: (additionalParams?: Record<string, string>) => Promise<void>;
  logout: (redirectTo?: string) => void;
  refresh: () => Promise<void>;
  getToken: () => string | null;
}

export function useOAuth2(config: OAuth2Config): UseOAuth2Return {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
    refreshToken: null,
    idToken: null,
    expiresAt: null,
    scope: null,
    error: null,
  });

  // Create OAuth2Service instance
  const oauth = useMemo(() => {
    const configWithCallbacks: OAuth2Config = {
      ...config,
      onAuthStateChange: (isAuthenticated) => {
        setState(prev => ({
          ...prev,
          isAuthenticated,
          isLoading: false,
        }));
      },
      onTokenRefresh: () => {
        setState(oauth.getAuthState());
      },
    };
    return new OAuth2Service(configWithCallbacks);
  }, [config]);

  // Initialize state
  useEffect(() => {
    setState({
      ...oauth.getAuthState(),
      isLoading: false,
    });
  }, [oauth]);

  // Methods
  const login = useCallback(async (additionalParams?: Record<string, string>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await oauth.authorize(additionalParams);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: { error: 'login_failed', error_description: (error as Error).message },
      }));
    }
  }, [oauth]);

  const logout = useCallback((redirectTo?: string) => {
    oauth.logout(redirectTo);
  }, [oauth]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await oauth.refreshAccessToken();
      setState(oauth.getAuthState());
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: { error: 'refresh_failed', error_description: (error as Error).message },
      }));
    }
  }, [oauth]);

  const getToken = useCallback(() => {
    return oauth.getAccessToken();
  }, [oauth]);

  return {
    ...state,
    login,
    logout,
    refresh,
    getToken,
  };
}