/**
 * OAuth2 PKCE Client Library
 * 
 * A secure, lightweight OAuth2 Authorization Code Flow with PKCE implementation
 */

// Core exports
export { OAuth2Service } from './core/OAuth2Service';
export * from './core/types';
export * from './core/constants';

// Utility exports
export * from './utils/crypto';
export * from './utils/storage';
export * from './utils/url';

// React exports (will be tree-shaken if not used)
export { useOAuth2 } from './react/useOAuth2';
export { OAuth2Provider, useAuth } from './react/OAuth2Provider';

// Version
export const VERSION = '1.0.0';