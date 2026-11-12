import Joi, { type ObjectSchema } from 'joi';
import type { LoginDto, RegisterDto } from '../types/auth.types';

// bcrypt silently truncates input beyond 72 bytes, so reject longer passwords explicitly.
const PASSWORD_MAX_LENGTH = 72;

const emailRule = Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } }) // Allow dev domains such as .local
    .max(254)
    .required();

export const registerSchema: ObjectSchema<RegisterDto> = Joi.object<RegisterDto>({
    name: Joi.string().trim().min(2).max(100).required(),
    email: emailRule,
    password: Joi.string()
        .min(8)
        .max(PASSWORD_MAX_LENGTH)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one letter and one number',
        }),
});

// Login checks only presence and length. Complexity rules apply at registration.
export const loginSchema: ObjectSchema<LoginDto> = Joi.object<LoginDto>({
    email: emailRule,
    password: Joi.string().max(PASSWORD_MAX_LENGTH).required(),
});