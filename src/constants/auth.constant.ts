/** Single source of truth for roles. Used by the model, types, and validation. */
export const ROLES = ['admin', 'user'] as const;
export type Role = (typeof ROLES)[number];

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && (ROLES as readonly string[]).includes(value);

export const AUTH_COOKIE_NAME = 'access_token';

/** Keep in sync with JWT_EXPIRES_IN (default 1d). */
export const AUTH_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Cost factor for bcrypt. 12 is a sensible default for 2025-era hardware. */
export const BCRYPT_SALT_ROUNDS = 12;