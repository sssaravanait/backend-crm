import type { RequestHandler } from 'express';
import type { ObjectSchema } from 'joi';
import { BadRequestError } from '../utils/app-error';

/**
 * Validates req.body against a Joi schema.
 * - abortEarly: false → report every invalid field at once
 * - stripUnknown: true → silently removes unexpected keys (for example, a client-sent "role": "admin")
 * The sanitized value replaces req.body, so controllers only see allowed fields.
 */
export const validateBody = <T>(schema: ObjectSchema<T>): RequestHandler => {
    return (req, _res, next) => {
        const { error, value } = schema.validate(req.body ?? {}, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const details = error.details.map(({ path, message }) => ({
                field: path.join('.') || 'body',
                message: message.replace(/^"([^"]+)"(?=\s)/, '$1'),
            }));
            return next(new BadRequestError('Validation failed', details));
        }

        req.body = value;
        next();
    };
};