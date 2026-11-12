import { Schema, model, HydratedDocument } from 'mongoose';
import { ROLES, type Role } from '../constants/auth.constant';

export interface UserInterface {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserInterface>;

const userSchema = new Schema<UserInterface>({
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, minlength: 5, maxlength: 255 },
    passwordHash: { 
        type: String, 
        required: true, 
        select: false, // Excluded from queries unless explicitly requested with '+passwordHash'
    },
    role: { type: String, enum: [...ROLES], default: 'user'}
}, {
    timestamps: true, // Adds createdAt and updatedAt
    versionKey: false, // Drops __v from the document
});

export const UserModel = model<UserInterface>('User', userSchema);