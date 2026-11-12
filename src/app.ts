import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { apiRouter } from "./routes/index";
import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";

dotenv.config();

export const app = express();

// The Next.js proxy is the only hop in front of Express. Trusting one hop makes
// req.ip the real client IP, so rate limiting works per user, not per frontend container.
app.set('trust proxy', 1);

// First in the chain, so every request is logged, including ones rejected later.
app.use(requestLogger);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', apiRouter);
app.use(errorHandler);