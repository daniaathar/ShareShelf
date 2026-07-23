import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../../src/app.js';
import { env } from '../../src/config/env.js';
import { prisma } from '../../src/config/prisma.js';

describe('Item Ownership Security', () => {
  let owner;
  let otherUser;
  let item;

  beforeEach(async () => {
    owner = await prisma.user.create({
      data: {
        name: 'Item Owner',
        email: `item-owner-${Date.now()}-${Math.random()}@test.com`,
        passwordHash: 'hashed-password',
        city: 'Lahore',
        area: 'DHA',
      },
    });

    otherUser = await prisma.user.create({
      data: {
        name: 'Other User',
        email: `other-user-${Date.now()}-${Math.random()}@test.com`,
        passwordHash: 'hashed-password',
        city: 'Lahore',
        area: 'DHA',
      },
    });

    item = await prisma.item.create({
      data: {
        ownerId: owner.id,
        title: 'Ownership Test Item',
        description: 'An item for ownership authorization testing.',
        pricePerDayMinor: 1000,
        depositMinor: 5000,
        city: 'Lahore',
        area: 'DHA',
      },
    });
  });

  it('prevents a non-owner from updating an item', async () => {
    const token = jwt.sign(
      { sub: otherUser.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .patch(`/api/v1/items/${item.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Unauthorized Update',
        description: 'This update should not be allowed.',
        pricePerDayMinor: 2000,
        depositMinor: 5000,
        city: 'Lahore',
        area: 'DHA',
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('prevents a non-owner from deleting an item', async () => {
    const token = jwt.sign(
      { sub: otherUser.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .delete(`/api/v1/items/${item.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });
});