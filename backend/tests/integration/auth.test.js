import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { app } from '../../src/app.js';

describe('Authentication API', () => {
  it('rejects registration with invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'not-an-email',
        password: '123',
      });

    expect(response.status).toBe(400);
  });

  it('rejects login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      });

    expect([401, 404]).toContain(response.status);
  });

  it('rejects access to protected routes without authentication', async () => {
    const response = await request(app)
      .get('/api/v1/me');

    expect(response.status).toBe(401);
  });
});

it('rejects access with an invalid JWT', async () => {
  const response = await request(app)
    .get('/api/v1/me')
    .set('Authorization', 'Bearer invalid-token');

  expect(response.status).toBe(401);
});

it('rejects access with a malformed authorization header', async () => {
  const response = await request(app)
    .get('/api/v1/me')
    .set('Authorization', 'NotBearer token');

  expect(response.status).toBe(401);
});

it('rejects registration when required fields are missing', async () => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({});

  expect(response.status).toBe(400);
});

it('rate limits excessive authentication attempts', async () => {
  const responses = [];

  for (let i = 0; i < 11; i++) {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'rate-limit-test@example.com',
        password: 'wrong-password',
      });

    responses.push(response.status);
  }

  expect(responses).toContain(429);
});