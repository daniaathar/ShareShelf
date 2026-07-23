import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { requestId } from './middleware/request-id.js';
import { requestLogger } from './middleware/request-logger.js';
import {
  securityHeaders,
  globalRateLimiter,
} from './middleware/security.js';

export const app = express();

app.set('trust proxy', 1);
app.use(requestId);
app.use(requestLogger);
app.use(securityHeaders);

app.use(
  cors({
    origin: env.clientOrigin,
  }),
);

app.use(globalRateLimiter);

app.use(express.json({ limit: '1mb' }));

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);