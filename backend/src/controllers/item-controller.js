import { prisma } from '../config/prisma.js';
import { uploadImage } from '../services/storage/cloudinary-service.js';
import { AppError } from '../utils/app-error.js';
import { itemSchema } from '../validators/schemas.js';

const include = { owner: { select: { id: true, name: true } }, images: { orderBy: { position: 'asc' } } };
export async function createItem(req, res) { const item = await prisma.item.create({ data: { ...itemSchema.parse(req.body), ownerId: req.auth.sub }, include }); res.status(201).json({ data: item }); }
export async function listItems(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const where = { status: 'AVAILABLE', ...(req.query.city ? { city: { equals: String(req.query.city), mode: 'insensitive' } } : {}), ...(req.query.area ? { area: { equals: String(req.query.area), mode: 'insensitive' } } : {}), ...(req.query.q ? { OR: [{ title: { contains: String(req.query.q), mode: 'insensitive' } }, { description: { contains: String(req.query.q), mode: 'insensitive' } }] } : {}) };
  const [items, total] = await prisma.$transaction([prisma.item.findMany({ where, include, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }), prisma.item.count({ where })]);
  res.json({ data: { items, pagination: { page, limit, total } } });
}
export async function getItem(req, res) { const item = await prisma.item.findUnique({ where: { id: req.params.itemId }, include }); if (!item) throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found'); res.json({ data: item }); }
export async function updateItem(req, res) { const item = await prisma.item.findUnique({ where: { id: req.params.itemId } }); if (!item) throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found'); if (item.ownerId !== req.auth.sub) throw new AppError(403, 'FORBIDDEN', 'Only the owner can update this item'); const updated = await prisma.item.update({ where: { id: item.id }, data: itemSchema.partial().parse(req.body), include }); res.json({ data: updated }); }
export async function deleteItem(req, res) {
  const item = await prisma.item.findUnique({
    where: { id: req.params.itemId }
  });

  if (!item) {
    throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found');
  }

  if (item.ownerId !== req.auth.sub) {
    throw new AppError(
      403,
      'FORBIDDEN',
      'Only the owner can delete this item'
    );
  }

  if (item.status === 'ARCHIVED') {
    throw new AppError(
      409,
      'ITEM_ALREADY_ARCHIVED',
      'This item has already been deleted'
    );
  }

  const archivedItem = await prisma.item.update({
    where: { id: item.id },
    data: { status: 'ARCHIVED' },
    include
  });

  res.json({
    data: archivedItem,
    message: 'Item archived successfully'
  });
}
export async function addImage(req, res) { const item = await prisma.item.findUnique({ where: { id: req.params.itemId }, include: { images: true } }); if (!item) throw new AppError(404, 'ITEM_NOT_FOUND', 'Item not found'); if (item.ownerId !== req.auth.sub) throw new AppError(403, 'FORBIDDEN', 'Only the owner can add images'); if (!req.file) throw new AppError(400, 'IMAGE_REQUIRED', 'An image file is required'); if (item.images.length >= 5) throw new AppError(409, 'IMAGE_LIMIT_REACHED', 'A listing may have at most five images'); const stored = await uploadImage(req.file, `shareshelf/items/${item.id}`); const image = await prisma.itemImage.create({ data: { itemId: item.id, ...stored, position: item.images.length } }); res.status(201).json({ data: image }); }
