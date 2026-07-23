import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import { app } from '../../src/app.js';
import { env } from '../../src/config/env.js';
import { prisma } from '../../src/config/prisma.js';

describe('Booking Creation', () => {
  let owner;
  let renter;
  let item;

  beforeEach(async () => {
    renter = await prisma.user.create({
      data: {
        name: 'Test Renter',
        email: `renter-${Date.now()}-${Math.random()}@test.com`,
        passwordHash: 'hashed-password',
        city: 'Lahore',
        area: 'DHA',
      },
    });

    owner = await prisma.user.create({
      data: {
        name: 'Test Owner',
        email: `owner-${Date.now()}-${Math.random()}@test.com`,
        passwordHash: 'hashed-password',
        city: 'Lahore',
        area: 'DHA',
      },
    });

    item = await prisma.item.create({
      data: {
        ownerId: owner.id,
        title: 'Test Camera',
        description: 'A camera available for rental testing.',
        pricePerDayMinor: 1000,
        depositMinor: 5000,
        city: 'Lahore',
        area: 'DHA',
        status: 'AVAILABLE',
      },
    });
  });

  it('allows a renter to create a booking for an available item', async () => {
    const token = jwt.sign({ sub: renter.id }, env.jwtSecret);

    const response = await request(app)
      .post(`/api/v1/items/${item.id}/bookings`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        startDate: '2026-08-01',
        endDate: '2026-08-03',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.itemId).toBe(item.id);
    expect(response.body.data.renterId).toBe(renter.id);
    expect(response.body.data.totalRentalMinor).toBe(3000);
    expect(response.body.data.depositMinor).toBe(5000);
    expect(response.body.data.status).toBe('PENDING_PAYMENT');
  });

  it('prevents an owner from booking their own item', async () => {
    const token = jwt.sign({ sub: owner.id }, env.jwtSecret);

    const response = await request(app)
      .post(`/api/v1/items/${item.id}/bookings`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        startDate: '2026-08-10',
        endDate: '2026-08-12',
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('SELF_BOOKING_FORBIDDEN');
  });

  it('rejects a booking when the end date is before the start date', async () => {
    const token = jwt.sign({ sub: renter.id }, env.jwtSecret);

    const response = await request(app)
      .post(`/api/v1/items/${item.id}/bookings`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        startDate: '2026-08-10',
        endDate: '2026-08-05',
      });

    expect(response.status).toBe(400);
  });

  it('rejects booking an unavailable item', async () => {
    await prisma.item.update({
      where: { id: item.id },
      data: { status: 'UNAVAILABLE' },
    });

    const token = jwt.sign({ sub: renter.id }, env.jwtSecret);

    const response = await request(app)
      .post(`/api/v1/items/${item.id}/bookings`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        startDate: '2026-08-01',
        endDate: '2026-08-03',
      });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('ITEM_NOT_AVAILABLE');
  });

  it('rejects overlapping booking dates', async () => {
    const token = jwt.sign({ sub: renter.id }, env.jwtSecret);

    const firstBooking = await request(app)
      .post(`/api/v1/items/${item.id}/bookings`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        startDate: '2026-08-01',
        endDate: '2026-08-05',
      });

    expect(firstBooking.status).toBe(201);

    const secondRenter = await prisma.user.create({
      data: {
        name: 'Second Renter',
        email: `second-${Date.now()}-${Math.random()}@test.com`,
        passwordHash: 'hashed-password',
        city: 'Lahore',
        area: 'DHA',
      },
    });

    const secondToken = jwt.sign(
      { sub: secondRenter.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .post(`/api/v1/items/${item.id}/bookings`)
      .set('Authorization', `Bearer ${secondToken}`)
      .send({
        startDate: '2026-08-03',
        endDate: '2026-08-07',
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('DATES_UNAVAILABLE');
  });
});