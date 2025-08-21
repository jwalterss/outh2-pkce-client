/**
 * Storage utilities for token management
 */

import { STORAGE_KEYS } from '../core/constants';

export class TokenStorage {
  private storage: Storage;
  private prefix: string;

  constructor(storage: Storage = localStorage, prefix: string = 'oauth2_') {
    this.storage = storage;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  setAccessToken(token: string): void {
    this.storage.setItem(this.getKey(STORAGE_KEYS.ACCESS_TOKEN), token);
  }

  getAccessToken(): string | null {
    return this.storage.getItem(this.getKey(STORAGE_KEYS.ACCESS_TOKEN));
  }

  setRefreshToken(token: string): void {
    this.storage.setItem(this.getKey(STORAGE_KEYS.REFRESH_TOKEN), token);
  }

  getRefreshToken(): string | null {
    return this.storage.getItem(this.getKey(STORAGE_KEYS.REFRESH_TOKEN));
  }

  setIdToken(token: string): void {
    this.storage.setItem(this.getKey(STORAGE_KEYS.ID_TOKEN), token);
  }

  getIdToken(): string | null {
    return this.storage.getItem(this.getKey(STORAGE_KEYS.ID_TOKEN));
  }

  setExpiresAt(expiresAt: number): void {
    this.storage.setItem(this.getKey(STORAGE_KEYS.EXPIRES_AT), expiresAt.toString());
  }

  getExpiresAt(): number | null {
    const value = this.storage.getItem(this.getKey(STORAGE_KEYS.EXPIRES_AT));
    return value ? parseInt(value, 10) : null;
  }

  setScope(scope: string): void {
    this.storage.setItem(this.getKey(STORAGE_KEYS.SCOPE), scope);
  }

  getScope(): string | null {
    return this.storage.getItem(this.getKey(STORAGE_KEYS.SCOPE));
  }

  setCodeVerifier(verifier: string): void {
    this.storage.setItem(this.getKey(STORAGE_KEYS.CODE_VERIFIER), verifier);
  }

  getCodeVerifier(): string | null {
    return this.storage.getItem(this.getKey(STORAGE_KEYS.CODE_VERIFIER));
  }

  setState(state: string): void {
    this.storage.setItem(this.getKey(STORAGE_KEYS.STATE), state);
  }

  getState(): string | null {
    return this.storage.getItem(this.getKey(STORAGE_KEYS.STATE));
  }

  clear(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.storage.removeItem(this.getKey(key));
    });
  }

  clearTemporary(): void {
    this.storage.removeItem(this.getKey(STORAGE_KEYS.CODE_VERIFIER));
    this.storage.removeItem(this.getKey(STORAGE_KEYS.STATE));
  }
}