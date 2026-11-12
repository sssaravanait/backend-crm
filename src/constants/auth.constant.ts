/** Single source of truth for roles. Used by the model, types, and validation. */
export const ROLES = ['admin', 'user'] as const;
export type Role = (typeof ROLES)[number];

