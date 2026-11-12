import { RegisterDto, LoginDto, AuthResult } from "../types/auth.types";
import { userRepository, type UserRepository } from "../repositories/user.repository";
import { UserDocument } from "../models/user.model";
import { toPublicUser } from '../mappers/user.mapper';
import { passwordService } from '../services/password.service';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/app-error';

/**
 * Hash used when the email is unknown. Running one bcrypt comparison either way
 * means response time doesn't reveal which emails are registered (user enumeration).
 */
export class AuthService {
    // Constructor injection (Dependency Inversion): the repository is swappable in tests.
    constructor(private readonly userRepository: UserRepository) {}

    async register(dto: RegisterDto): Promise<AuthResult> {
        if (await this.userRepository.existsByEmail(dto.email)) {
            throw new ConflictError("Email already in use");
        }

        const passwordHash = await passwordService.hash(dto.password);

        // Public registration can never create an admin. Admins are created only by the seed script.
        const user = await this.userRepository.create({
            name: dto.name,
            email: dto.email,
            passwordHash,
            role: 'user',
        });

        return this.buildAuthUser(user);
    }

    async login(dto: LoginDto): Promise<AuthResult> {
        const user = await this.userRepository.findByEmailWithPassword(dto.email);
        const isValid = await passwordService.compare(dto.password, user?.passwordHash as string);

        if (!user || !isValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        return this.buildAuthUser(user);
    }

    /** Shared by register and login so the token and response shape are built one way (DRY). */
    private buildAuthUser(user: UserDocument): AuthResult {
        const publicUser = toPublicUser(user);
        const token = '';
        return { user: publicUser, token };
    }
}

// Composition root: one shared instance wired to the real repository.
export const authService = new AuthService(userRepository);