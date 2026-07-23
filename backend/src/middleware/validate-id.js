import { AppError } from '../utils/app-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateUuidParam(paramName) {
  return (req, _res, next) => {
    const value = req.params[paramName];

    if (!UUID_REGEX.test(value)) {
      return next(
        new AppError(
          400,
          'INVALID_ID',
          `${paramName} must be a valid UUID`,
        ),
      );
    }

    next();
  };
}