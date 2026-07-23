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

describe('Booking Transition Security', () => {
  let owner;
  let renter;
  let item;
  let booking;

  beforeEach(async () => {
    owner = await prisma.user.create({
      data: {
        name: 'Transition Owner',
        email: `transition-owner-${Date.now()}-${Math.random()}@test.com`,
        passwordHash: 'hashed-password',
        city: 'Lahore',
        area: 'DHA',
      },
    });

    renter = await prisma.user.create({
      data: {
        name: 'Transition Renter',
        email: `transition-renter-${Date.now()}-${Math.random()}@test.com`,
        passwordHash: 'hashed-password',
        city: 'Lahore',
        area: 'DHA',
      },
    });

    item = await prisma.item.create({
      data: {
        ownerId: owner.id,
        title: 'Transition Test Camera',
        description: 'A camera for transition testing.',
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
        status: 'CONFIRMED',
        startDate: new Date('2026-09-10'),
        endDate: new Date('2026-09-12'),
        totalRentalMinor: 3000,
        depositMinor: 5000,
        payment: {
          create: {
            amountMinor: 8000,
            status: 'HELD',
          },
        },
      },
    });
  });

  it('prevents the renter from changing booking status', async () => {
    const token = jwt.sign(
      { sub: renter.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .post(`/api/v1/bookings/${booking.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PICKED_UP' });

    expect(response.status).toBe(403);
  });

  it('rejects an invalid booking state transition', async () => {
    const token = jwt.sign(
      { sub: owner.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .post(`/api/v1/bookings/${booking.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'COMPLETED' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('INVALID_BOOKING_STATE');
  });

  it('requires pickup evidence before marking a booking picked up', async () => {
    const token = jwt.sign(
      { sub: owner.id },
      env.jwtSecret,
    );

    const response = await request(app)
      .post(`/api/v1/bookings/${booking.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PICKED_UP' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('PICKUP_EVIDENCE_REQUIRED');
  });
});