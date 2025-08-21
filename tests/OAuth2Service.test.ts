import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OAuth2Service } from '../src/core/OAuth2Service';
import type { OAuth2Config } from '../src/core/types';

describe('OAuth2Service', () => {
  let service: OAuth2Service;
  let config: OAuth2Config;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Setup config
    config = {
      clientId: 'test-client-id',
      authorizationEndpoint: 'https://auth.example.com/authorize',
      tokenEndpoint: 'https://auth.example.com/token',
      redirectUri: 'http://localhost:3000/callback',
      scope: 'openid profile email',
    };
    
    service = new OAuth2Service(config);
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(service).toBeDefined();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('authorize', () => {
    it('should redirect to authorization endpoint', async () => {
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      await service.authorize();

      expect(mockLocation.href).toContain(config.authorizationEndpoint);
      expect(mockLocation.href).toContain(`client_id=${config.clientId}`);
      expect(mockLocation.href).toContain('response_type=code');
      expect(mockLocation.href).toContain('code_challenge');
    });
  });

  describe('handleCallback', () => {
    it('should handle successful callback', async () => {
      // Mock state
      localStorage.setItem('oauth2_state', 'test-state');
      localStorage.setItem('oauth2_code_verifier', 'test-verifier');

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
        }),
      });

      // Mock URL with code and state
      const mockUrl = 'http://localhost:3000/callback?code=test-code&state=test-state';
      
      await service.handleCallback(mockUrl);

      expect(service.isAuthenticated()).toBe(true);
      expect(service.getAccessToken()).toBe('test-access-token');
    });

    it('should handle error callback', async () => {
      const mockUrl = 'http://localhost:3000/callback?error=access_denied&error_description=User+denied+access';
      
      await expect(service.handleCallback(mockUrl)).rejects.toThrow();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      // Set initial tokens
      localStorage.setItem('oauth2_refresh_token', 'test-refresh-token');

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
        }),
      });

      await service.refreshAccessToken();

      expect(service.getAccessToken()).toBe('new-access-token');
    });
  });

  describe('logout', () => {
    it('should clear tokens and redirect', () => {
      // Set tokens
      localStorage.setItem('oauth2_access_token', 'test-token');
      
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      service.logout('http://localhost:3000');

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('oauth2_access_token')).toBeNull();
      expect(mockLocation.href).toBe('http://localhost:3000');
    });
  });
});