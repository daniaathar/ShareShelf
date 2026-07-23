import multer from 'multer';
import { ZodError } from 'zod';

import { logger } from '../config/logger.js';
import { AppError } from '../utils/app-error.js';

export function notFound(req, _res, next) {
  next(
    new AppError(
      404,
      'NOT_FOUND',
      `Route ${req.method} ${req.path} was not found`,
    ),
  );
}

export function errorHandler(error, req, res, _next) {
  const requestId = req.requestId;

  // Log every server-side error with its request ID
  logger.error(
    {
      requestId,
      method: req.method,
      path: req.originalUrl,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    },
    'Request failed',
  );

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        fields: error.flatten().fieldErrors,
        requestId,
      },
    });
  }

  // Multer file upload errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Image must be 8 MB or smaller',
          requestId,
        },
      });
    }

    return res.status(400).json({
      error: {
        code: 'FILE_UPLOAD_ERROR',
        message: 'There was a problem uploading the file',
        requestId,
      },
    });
  }

  // Application errors
  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        fields: error.fields,
        requestId,
      },
    });
  }

  // Unexpected errors
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    },
  });
}