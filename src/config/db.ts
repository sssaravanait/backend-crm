import mongoose from "mongoose";

const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 3000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export async function connectDB(): Promise<void> {
    // Strips $-operators from user-supplied filters (NoSQL injection defense)
    mongoose.set('sanitizeFilter', true);

    // Fail fast when disconnected, instead of silently queuing queries forever.
    // This turns a hang into an immediate, visible error.
    mongoose.set('bufferCommands', false);

    mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
    mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));

    for (let attempt = 1; ; attempt++) {
        try {
            await mongoose.connect(process.env.MONGO_URI as string, { serverSelectionTimeoutMS: 5000 });
            console.log('✔ MongoDB connected');
            return;
        } catch (err) {
            if (attempt >= MAX_ATTEMPTS) throw err;
            console.warn(`MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed, retrying...`);
            await sleep(RETRY_DELAY_MS);
        }
    }
}