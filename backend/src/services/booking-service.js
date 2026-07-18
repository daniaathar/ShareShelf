import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { ACTIVE_BOOKING_STATUSES, OWNER_TRANSITIONS } from '../constants/booking.js';
import { AppError } from '../utils/app-error.js';
import { daysInclusive } from '../utils/dates.js';

const bookingInclude = { item: { include: { owner: { select: { id: true, name: true } }, images: true } }, renter: { select: { id: true, name: true, email: true } }, payment: true, evidence: true, comparison: true };
export async function createBooking(itemId, renterId, input) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (!item || item.status !== 'AVAILABLE') throw new AppError(404, 'ITEM_NOT_AVAILABLE', 'This item is not available');
    if (item.ownerId === renterId) throw new AppError(403, 'SELF_BOOKING_FORBIDDEN', 'You cannot book your own item');
    const startDate = new Date(`${input.startDate}T00:00:00.000Z`); const endDate = new Date(`${input.endDate}T00:00:00.000Z`);
    const overlap = await tx.booking.findFirst({ where: { itemId, status: { in: ACTIVE_BOOKING_STATUSES }, startDate: { lte: endDate }, endDate: { gte: startDate } } });
    if (overlap) throw new AppError(409, 'DATES_UNAVAILABLE', 'The selected dates are not available');
    const totalRentalMinor = daysInclusive(startDate, endDate) * item.pricePerDayMinor;
    return tx.booking.create({ data: { itemId, renterId, startDate, endDate, totalRentalMinor, depositMinor: item.depositMinor, payment: { create: { amountMinor: totalRentalMinor + item.depositMinor } } }, include: bookingInclude });
  }, { isolationLevel: 'Serializable' });
}
export async function getBookingForParticipant(id, userId) {
  const booking = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });
  if (!booking) throw new AppError(404, 'BOOKING_NOT_FOUND', 'Booking not found');
  if (booking.renterId !== userId && booking.item.ownerId !== userId) throw new AppError(403, 'FORBIDDEN', 'You cannot access this booking');
  return booking;
}
export async function mockPay(id, userId) {
  const booking = await getBookingForParticipant(id, userId);
  if (booking.renterId !== userId) throw new AppError(403, 'FORBIDDEN', 'Only the renter can pay');
  if (booking.status !== 'PENDING_PAYMENT') throw new AppError(409, 'INVALID_BOOKING_STATE', 'Payment is only available for pending bookings');
  return prisma.booking.update({ where: { id }, data: { status: 'CONFIRMED', payment: { update: { status: 'HELD', providerReference: `mock_${crypto.randomUUID()}` } } }, include: bookingInclude });
}
export async function transitionBooking(id, userId, target) {
  const booking = await getBookingForParticipant(id, userId);
  if (booking.item.ownerId !== userId) throw new AppError(403, 'FORBIDDEN', 'Only the item owner can update booking status');
  if (!OWNER_TRANSITIONS[booking.status]?.includes(target)) throw new AppError(409, 'INVALID_BOOKING_STATE', `Cannot move from ${booking.status} to ${target}`);
  if (target === 'PICKED_UP' && !booking.evidence.some((entry) => entry.phase === 'PICKUP')) throw new AppError(409, 'PICKUP_EVIDENCE_REQUIRED', 'Pickup evidence must be uploaded first');
  if (target === 'RETURNED' && !booking.evidence.some((entry) => entry.phase === 'RETURN')) throw new AppError(409, 'RETURN_EVIDENCE_REQUIRED', 'Return evidence must be uploaded first');
  if (target === 'COMPLETED' && booking.comparison?.verdict !== 'PASS') throw new AppError(409, 'COMPARISON_PASS_REQUIRED', 'Only a passing comparison can complete this booking');
  return prisma.booking.update({ where: { id }, data: { status: target, ...(target === 'COMPLETED' ? { payment: { update: { status: 'RELEASED' } } } : {}) }, include: bookingInclude });
}
