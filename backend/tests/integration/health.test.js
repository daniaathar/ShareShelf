import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

describe('Health Check API', () => {
  it('should return API health status', async () => {
    const response = await request(app)
      .get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        status: 'ok',
      },
    });
  });
});

it('rate limits excessive general API requests', async () => {
  const responses = [];

  for (let i = 0; i < 301; i++) {
    const response = await request(app)
      .get('/api/v1/health');

    responses.push(response.status);
  }

  expect(responses).toContain(429);
});

it('adds a unique request ID to responses', async () => {
  const response = await request(app)
    .get('/api/v1/health');

  expect(response.headers['x-request-id']).toBeDefined();
  expect(response.headers['x-request-id']).toMatch(
    /^[0-9a-f-]{36}$/i,
  );
});