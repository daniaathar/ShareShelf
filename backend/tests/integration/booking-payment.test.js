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

describe('Booking Payment Security', () => {
  let owner;
  let renter;
  let item;
  let booking;

  beforeEach(async () => {
    owner = await prisma.user.create({
      data: {
        name: 'Payment Owner',
        email: `payment-owner-${Date.now()}-${Math.random()}@test.com`,
        passwordHash: 'hashed-password',
        city: 'Lahore',
        area: 'DHA',
      },
    });

    renter = await prisma.user.create({
      data: {
        name: 'Payment Renter',
        email: `payment-renter-${Date.now()}-${Math.random()}@test.com`,
        passwordHash: 'hashed-password',
        city: 'Lahore',
        area: 'DHA',
      },
    });

    item = await prisma.item.create({
      data: {
        ownerId: owner.id,
        title: 'Payment Test Camera',
        description: 'A camera for payment security testing.',
        pricePerDayMinor: 1000,
        depositMinor: 5000,
        city: 'Lahore',
        area: 'DHA',
      },
    });

    booking = await prisma.booking.create({
      data: {
        itemId: item.id,
        renterId: renter.id,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-03'),
        totalRentalMinor: 3000,
        depositMinor: 5000,
        payment: {
          create: {
            amountMinor: 8000,
          },
        },
      },
    });
  });

  it('rejects unauthenticated mock payment requests', async () => {
    const response = await request(app)
      .post('/api/v1/bookings/test-booking-id/mock-payment');

    expect(response.status).toBe(401);
  });

  it('rejects payment for a non-existent booking', async () => {
    const token = jwt.sign(
      { sub: renter.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .post(
        '/api/v1/bookings/123e4567-e89b-12d3-a456-426614174000/mock-payment',
      )
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('handles an invalid booking ID format safely', async () => {
    const token = jwt.sign(
      { sub: renter.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .post('/api/v1/bookings/invalid-id/mock-payment')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it('prevents the item owner from making payment', async () => {
    const token = jwt.sign(
      { sub: owner.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .post(`/api/v1/bookings/${booking.id}/mock-payment`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('allows the renter to complete mock payment', async () => {
    const token = jwt.sign(
      { sub: renter.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .post(`/api/v1/bookings/${booking.id}/mock-payment`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('CONFIRMED');
    expect(response.body.data.payment.status).toBe('HELD');
    expect(response.body.data.payment.provider).toBe('MOCK');
  });
});