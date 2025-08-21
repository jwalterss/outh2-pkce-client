/**
 * OAuth2 and PKCE constants
 */

/** Default storage key prefix */
export const DEFAULT_STORAGE_PREFIX = 'oauth2_';

/** Storage keys */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ID_TOKEN: 'id_token',
  EXPIRES_AT: 'expires_at',
  SCOPE: 'scope',
  CODE_VERIFIER: 'code_verifier',
  STATE: 'state',
} as const;

/** Default token refresh buffer (5 minutes) */
export const DEFAULT_REFRESH_BUFFER = 300;

/** PKCE code verifier length */
export const CODE_VERIFIER_LENGTH = 128;

/** Authorization response types */
export const RESPONSE_TYPE = {
  CODE: 'code',
  TOKEN: 'token',
} as const;

/** Grant types */
export const GRANT_TYPE = {
  AUTHORIZATION_CODE: 'authorization_code',
  REFRESH_TOKEN: 'refresh_token',
  CLIENT_CREDENTIALS: 'client_credentials',
} as const;

/** Error codes */
export const ERROR_CODES = {
  INVALID_REQUEST: 'invalid_request',
  UNAUTHORIZED_CLIENT: 'unauthorized_client',
  ACCESS_DENIED: 'access_denied',
  UNSUPPORTED_RESPONSE_TYPE: 'unsupported_response_type',
  INVALID_SCOPE: 'invalid_scope',
  SERVER_ERROR: 'server_error',
  TEMPORARILY_UNAVAILABLE: 'temporarily_unavailable',
} as const;