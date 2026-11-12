import { Role } from '../constants/auth.constant';

export interface CreateUser {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
}

export interface AuthUser {
    id: string;
    role: Role;
}

/** Public-facing user shape. Never contains the password hash. */
export interface PublicUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResult {
    user: PublicUser;
    token: string;
}