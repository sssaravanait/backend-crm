import { z } from 'zod';
import type { LoginDto, RegisterDto } from '../types/auth.types';

// bcrypt silently truncates input beyond 72 bytes, so reject longer passwords explicitly.
const PASSWORD_MAX_LENGTH = 72;

const emailRule = z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .email();

export const registerSchema = z
    .object({
        name: z.string().trim().min(2).max(100),
        email: emailRule,
        password: z
            .string()
            .min(8)
            .max(PASSWORD_MAX_LENGTH)
            .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
                message: 'Password must contain at least one letter and one number',
            }),
    })
    .strict() satisfies z.ZodType<RegisterDto>;

// Login checks only presence and length. Complexity rules apply at registration.
export const loginSchema = z
    .object({
        email: emailRule,
        password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
    })
    .strict() satisfies z.ZodType<LoginDto>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;