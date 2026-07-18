import { prisma } from '../config/prisma.js';
import { createBooking, getBookingForParticipant, mockPay, transitionBooking } from '../services/booking-service.js';
import { bookingSchema, transitionSchema } from '../validators/schemas.js';

export async function create(req, res) { const booking = await createBooking(req.params.itemId, req.auth.sub, bookingSchema.parse(req.body)); res.status(201).json({ data: booking }); }
export async function list(req, res) { const role = req.query.role === 'owner' ? 'owner' : 'renter'; const status = req.query.status; const where = role === 'owner' ? { item: { ownerId: req.auth.sub } } : { renterId: req.auth.sub }; if (status) where.status = status; const bookings = await prisma.booking.findMany({ where, include: { item: { include: { images: { take: 1, orderBy: { position: 'asc' } } } }, payment: true, comparison: true }, orderBy: { createdAt: 'desc' } }); res.json({ data: { bookings } }); }
export async function get(req, res) { res.json({ data: await getBookingForParticipant(req.params.bookingId, req.auth.sub) }); }
export async function pay(req, res) { res.json({ data: await mockPay(req.params.bookingId, req.auth.sub) }); }
export async function transition(req, res) { res.json({ data: await transitionBooking(req.params.bookingId, req.auth.sub, transitionSchema.parse(req.body).status) }); }
