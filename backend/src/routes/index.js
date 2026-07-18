import express from 'express';
import multer from 'multer';
import * as auth from '../controllers/auth-controller.js';
import * as items from '../controllers/item-controller.js';
import * as bookings from '../controllers/booking-controller.js';
import * as evidence from '../controllers/evidence-controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/async-handler.js';
import { AppError } from '../utils/app-error.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(file.mimetype.startsWith('image/') ? null : new AppError(400, 'INVALID_IMAGE', 'Only image files are accepted'), file.mimetype.startsWith('image/')) });
router.get('/health', (_req, res) => res.json({ data: { status: 'ok' } }));
router.post('/auth/register', asyncHandler(auth.register)); router.post('/auth/login', asyncHandler(auth.login)); router.get('/me', requireAuth, asyncHandler(auth.me));
router.get('/items', asyncHandler(items.listItems)); router.get('/items/:itemId', asyncHandler(items.getItem)); router.post('/items', requireAuth, asyncHandler(items.createItem)); router.patch('/items/:itemId', requireAuth, asyncHandler(items.updateItem)); router.post('/items/:itemId/images', requireAuth, upload.single('image'), asyncHandler(items.addImage));
router.post('/items/:itemId/bookings', requireAuth, asyncHandler(bookings.create)); router.get('/bookings', requireAuth, asyncHandler(bookings.list)); router.get('/bookings/:bookingId', requireAuth, asyncHandler(bookings.get)); router.post('/bookings/:bookingId/mock-payment', requireAuth, asyncHandler(bookings.pay)); router.post('/bookings/:bookingId/transition', requireAuth, asyncHandler(bookings.transition));
router.post('/bookings/:bookingId/evidence/:phase', requireAuth, upload.single('image'), asyncHandler(evidence.upload)); router.get('/bookings/:bookingId/comparison', requireAuth, asyncHandler(evidence.comparison));
export default router;
