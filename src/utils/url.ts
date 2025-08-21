/**
 * URL utilities for OAuth2 flow
 */

/**
 * Build URL with query parameters
 */
export function buildUrl(baseUrl: string, params: Record<string, string | undefined>): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

/**
 * Parse query parameters from URL
 */
export function parseQueryParams(url: string): Record<string, string> {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Get current URL without query parameters
 */
export function getBaseUrl(): string {
  return window.location.origin + window.location.pathname;
}

/**
 * Check if current URL is the redirect URI
 */
export function isRedirectUri(redirectUri: string): boolean {
  const current = getBaseUrl();
  const expected = new URL(redirectUri).origin + new URL(redirectUri).pathname;
  return current === expected;
}