import type { Request } from "express";
import { AppError } from "../errors/AppError";

export const getUserId = (req: Request): string => {
    const id = req.user?.id;
    if (!id) throw AppError.unauthorized();
    return id;
};