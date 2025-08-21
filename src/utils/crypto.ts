/**
 * Cryptographic utilities for PKCE
 */

/**
 * Generate a random string for use as state or code verifier
 */
export function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues)
    .map(value => charset[value % charset.length])
    .join('');
}

/**
 * Generate SHA-256 hash of a string (for PKCE code challenge)
 */
export async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

/**
 * Base64 URL encode a buffer
 */
export function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE parameters
 */
export async function generatePKCEParams(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = generateRandomString(128);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);
  
  return { codeVerifier, codeChallenge };
}

/**
 * Validate state parameter to prevent CSRF
 */
export function validateState(received: string, stored: string): boolean {
  return received === stored && received.length > 0;
}