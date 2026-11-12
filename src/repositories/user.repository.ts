import { UserDocument, UserModel } from '../models/user.model';
import { CreateUser } from '../types/auth.types';

export interface UserRepository {
    existsByEmail(email: string): Promise<boolean>;
    findById(id: string): Promise<UserDocument | null>;
    findByEmailWithPassword(email: string): Promise<UserDocument | null>;
    create(data: CreateUser): Promise<UserDocument>;
}

class MongoUserRepository implements UserRepository {

    async existsByEmail(email: string): Promise<boolean> {
        return await UserModel.exists({ email }) !== null;
    }

    async findById(id: string): Promise<UserDocument | null> {
        return UserModel.findById(id);
    }

    async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
        // Only login needs the hash, so it's the only place that opts in to selecting it.
        return UserModel.findOne({ email }).select('+passwordHash');
    }

    async create(data: CreateUser): Promise<UserDocument> {
        return UserModel.create(data);
    }
}

export const userRepository: UserRepository = new MongoUserRepository();