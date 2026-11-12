import type { CookieOptions, Response } from 'express';
import { AUTH_COOKIE_MAX_AGE_MS, AUTH_COOKIE_NAME } from '../constants/auth.constant';

// Defined once so set and clear always use identical attributes.
// Browsers only delete a cookie when path, domain, and flags match.
const baseCookieOptions: CookieOptions = {
    httpOnly: true, // JavaScript cannot read the token (XSS mitigation)
    sameSite: 'lax', // Not sent on cross-site POSTs (CSRF mitigation)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    path: '/',
};

export const setAuthCookie = (res: Response, token: string): void => {
    res.cookie(AUTH_COOKIE_NAME, token, { ...baseCookieOptions, maxAge: AUTH_COOKIE_MAX_AGE_MS });
};

export const clearAuthCookie = (res: Response): void => {
    res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions);
};