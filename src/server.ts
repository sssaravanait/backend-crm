import mongoose from "mongoose";
import { app } from "./app";
import { connectDB } from "./config/db";

async function startServer(): Promise<void> {
    await connectDB();

    const server = app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running on port ${process.env.PORT || 4000}`);
    });

    // Graceful shutdown: Docker sends SIGTERM on `docker stop`
    const shutdown = (signal: NodeJS.Signals): void => {
        console.log(`${signal} received, shutting down...`);
        server.close(async () => {
            await mongoose.disconnect();
            process.exit(0);
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

startServer().catch((err: unknown) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});