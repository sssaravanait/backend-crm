import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError, type ErrorDetails } from "../errors/AppError";

export type RequestSource = "body" | "params" | "query";

export const validate =
    (schema: ZodTypeAny, source: RequestSource = "body") =>
        (req: Request, res: Response, next: NextFunction): void => {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                // Works with Zod 3 and Zod 4: map each issue to its field path
                const details = result.error.issues.reduce<ErrorDetails>((acc, issue) => {
                    const key = issue.path.join(".");
                    if (key)
                        (acc[key] ??= []).push(issue.message);
                    return acc;
                }, {});

                next(AppError.validation(details));
                return;
            }

            res.locals.validated = { ...res.locals.validated, [source]: result.data };
            next();
        };

export const getValidated = <T>(res: Response, source: RequestSource): T =>
    res.locals.validated[source] as T;