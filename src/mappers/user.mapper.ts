import type { UserDocument } from '../models/user.model';
import type { PublicUser } from '../types/auth.types';

/**
 * Explicit mapping, so new model fields are never exposed by accident.
 * Prefer this over returning raw documents from services.
 */
export const toPublicUser = (user: UserDocument): PublicUser => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});