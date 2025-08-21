/**
 * React Context Provider for OAuth2
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useOAuth2, UseOAuth2Return } from './useOAuth2';
import type { OAuth2Config } from '../core/types';

const OAuth2Context = createContext<UseOAuth2Return | null>(null);

export interface OAuth2ProviderProps {
  config: OAuth2Config;
  children: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: (error: any) => ReactNode;
}

export function OAuth2Provider({ 
  config, 
  children, 
  loadingComponent = <div>Loading...</div>,
  errorComponent = (error) => <div>Error: {error.error_description}</div>
}: OAuth2ProviderProps) {
  const auth = useOAuth2(config);

  if (auth.isLoading) {
    return <>{loadingComponent}</>;
  }

  if (auth.error && errorComponent) {
    return <>{errorComponent(auth.error)}</>;
  }

  return (
    <OAuth2Context.Provider value={auth}>
      {children}
    </OAuth2Context.Provider>
  );
}

export function useAuth(): UseOAuth2Return {
  const context = useContext(OAuth2Context);
  if (!context) {
    throw new Error('useAuth must be used within an OAuth2Provider');
  }
  return context;
}