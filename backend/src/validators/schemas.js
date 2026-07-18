import { z } from 'zod';

const date = z.iso.date();
export const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email(), password: z.string().min(8).max(128), city: z.string().trim().min(2).max(80), area: z.string().trim().min(2).max(80).optional() });
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });
export const itemSchema = z.object({ title: z.string().trim().min(3).max(120), description: z.string().trim().min(10).max(2000), pricePerDayMinor: z.number().int().positive(), depositMinor: z.number().int().nonnegative().default(0), city: z.string().trim().min(2).max(80), area: z.string().trim().min(2).max(80), status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'ARCHIVED']).optional() });
export const bookingSchema = z.object({ startDate: date, endDate: date }).refine((value) => value.startDate <= value.endDate, { path: ['endDate'], message: 'endDate must be on or after startDate' });
export const transitionSchema = z.object({ status: z.enum(['PICKED_UP', 'RETURNED', 'COMPLETED']) });
