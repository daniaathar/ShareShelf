import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errors.js';

export const app = express();
app.use(cors({ origin: env.clientOrigin })); app.use(express.json({ limit: '1mb' })); app.use('/api/v1', routes); app.use(notFound); app.use(errorHandler);
