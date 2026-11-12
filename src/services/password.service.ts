import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../constants/auth.constant';

/** Thin wrapper so the hashing algorithm can change in one place. */
export const passwordService = {
    hash: (plainText: string): Promise<string> => bcrypt.hash(plainText, BCRYPT_SALT_ROUNDS),
    compare: (plainText: string, hash: string): Promise<boolean> => bcrypt.compare(plainText, hash),
};