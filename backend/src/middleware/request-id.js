import crypto from 'node:crypto';

export function requestId(req, res, next) {
  const requestId =
    req.headers['x-request-id'] || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
}