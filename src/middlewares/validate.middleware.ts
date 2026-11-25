import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../errors/AppError";

export type RequestSource = "body" | "params" | "query";

/**
 * Validates one part of the request and stores the parsed (typed, stripped) result
 * in res.locals. Storing it in res.locals instead of reassigning req.query works
 * in Express 5, where req.query is a read-only getter.
 */
export const validate =
    (schema: ZodTypeAny, source: RequestSource = "body") =>
        (req: Request, res: Response, next: NextFunction): void => {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                const { fieldErrors, formErrors } = result.error.flatten();
                const errors = formErrors.length ? { ...fieldErrors, _form: formErrors } : fieldErrors;
                next(new AppError(422, "Validation failed", errors));
                return;
            }

            res.locals.validated = { ...res.locals.validated, [source]: result.data };
            next();
        };

export const getValidated = <T>(res: Response, source: RequestSource): T =>
    res.locals.validated[source] as T;