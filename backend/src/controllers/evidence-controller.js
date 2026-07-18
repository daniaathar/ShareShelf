import { prisma } from '../config/prisma.js';
import { getBookingForParticipant } from '../services/booking-service.js';
import { uploadImage } from '../services/storage/cloudinary-service.js';
import { compareImages } from '../services/vision/clip-service.js';
import { AppError } from '../utils/app-error.js';

const currentEvidence = (booking, phase) => booking.evidence.find((entry) => entry.phase === phase);
export async function upload(req, res) {
  const phase = req.params.phase.toUpperCase();
  if (!['PICKUP', 'RETURN'].includes(phase)) throw new AppError(404, 'EVIDENCE_PHASE_NOT_FOUND', 'Evidence phase not found');
  const booking = await getBookingForParticipant(req.params.bookingId, req.auth.sub);
  const requiredStatus = phase === 'PICKUP' ? 'CONFIRMED' : 'PICKED_UP';
  if (booking.status !== requiredStatus) throw new AppError(409, 'INVALID_BOOKING_STATE', `${phase} evidence requires ${requiredStatus} status`);
  if (!req.file) throw new AppError(400, 'IMAGE_REQUIRED', 'An image file is required');
  if (currentEvidence(booking, phase)) throw new AppError(409, 'EVIDENCE_EXISTS', `${phase} evidence already exists`);
  const stored = await uploadImage(req.file, `shareshelf/bookings/${booking.id}/${phase.toLowerCase()}`);
  const evidence = await prisma.conditionEvidence.create({ data: { bookingId: booking.id, phase, uploadedById: req.auth.sub, ...stored } });
  if (phase === 'PICKUP') return res.status(201).json({ data: { evidence } });
  const pickup = currentEvidence(booking, 'PICKUP');
  try {
    const result = await compareImages(pickup.url, evidence.url); const verdict = result.similarityScore >= 0.70 ? 'PASS' : 'REVIEW_REQUIRED';
    const comparison = await prisma.conditionComparison.create({ data: { bookingId: booking.id, pickupEvidenceId: pickup.id, returnEvidenceId: evidence.id, similarityScore: result.similarityScore, verdict, provider: result.provider, providerResultJson: result.rawResult } });
    return res.status(201).json({ data: { evidence, comparison } });
  } catch (error) {
    const comparison = await prisma.conditionComparison.create({ data: { bookingId: booking.id, pickupEvidenceId: pickup.id, returnEvidenceId: evidence.id, verdict: 'UNAVAILABLE', provider: 'unavailable', providerResultJson: { message: error.message } } });
    return res.status(201).json({ data: { evidence, comparison } });
  }
}
export async function comparison(req, res) { const booking = await getBookingForParticipant(req.params.bookingId, req.auth.sub); if (!booking.comparison) throw new AppError(404, 'COMPARISON_NOT_FOUND', 'Comparison has not been created'); res.json({ data: booking.comparison }); }
