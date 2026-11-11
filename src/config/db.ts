import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
    // Strips $-operators from user-supplied filters (NoSQL injection defense)
    mongoose.set('sanitizeFilter', true);

    await mongoose.connect(process.env.MONGO_URI as string);

    console.log('MongoDB connected');
}