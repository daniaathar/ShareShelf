import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';

export function notFound(req, _res, next) { next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} was not found`)); }
export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', fields: error.flatten().fieldErrors } });
  if (error instanceof AppError) return res.status(error.status).json({ error: { code: error.code, message: error.message, fields: error.fields } });
  console.error(error);
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
}
