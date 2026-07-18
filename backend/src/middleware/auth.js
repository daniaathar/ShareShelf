import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export function requireAuth(req, _res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required'));
  try { req.auth = jwt.verify(token, env.jwtSecret); next(); }
  catch { next(new AppError(401, 'INVALID_TOKEN', 'Your session is invalid or expired')); }
}
