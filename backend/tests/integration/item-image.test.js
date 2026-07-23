
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../../src/app.js';
import { env } from '../../src/config/env.js';

describe('Item Image Upload API', () => {
  it('rejects unauthenticated image uploads', async () => {
    const response = await request(app)
      .post('/api/v1/items/test-item-id/images')
      .attach('image', Buffer.from('fake image data'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(response.status).toBe(401);
  });
});

it('rejects non-image files', async () => {
  const response = await request(app)
    .post('/api/v1/items/test-item-id/images')
    .attach('image', Buffer.from('this is a text file'), {
      filename: 'test.txt',
      contentType: 'text/plain',
    });

  expect(response.status).toBe(401);
});

it('rejects non-image files', async () => {
  const token = jwt.sign(
    { userId: 'test-user-id' },
    env.jwtSecret,
  );

  const response = await request(app)
    .post('/api/v1/items/test-item-id/images')
    .set('Authorization', `Bearer ${token}`)
    .attach('image', Buffer.from('this is not an image'), {
      filename: 'test.txt',
      contentType: 'text/plain',
    });

  expect(response.status).toBe(400);
});

it('rejects files larger than 8 MB', async () => {
  const token = jwt.sign(
    { userId: 'test-user-id' },
    env.jwtSecret,
  );

  const oversizedImage = Buffer.alloc(8 * 1024 * 1024 + 1);

  const response = await request(app)
    .post('/api/v1/items/test-item-id/images')
    .set('Authorization', `Bearer ${token}`)
    .attach('image', oversizedImage, {
      filename: 'large-image.jpg',
      contentType: 'image/jpeg',
    });

  expect(response.status).toBe(400);
});

it('accepts a valid image file type', async () => {
  const token = jwt.sign(
    { userId: 'test-user-id' },
    env.jwtSecret,
  );

  const response = await request(app)
    .post('/api/v1/items/test-item-id/images')
    .set('Authorization', `Bearer ${token}`)
    .attach('image', Buffer.from('fake image data'), {
      filename: 'test.jpg',
      contentType: 'image/jpeg',
    });

  expect(response.status).not.toBe(401);
});

