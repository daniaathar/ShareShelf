# ShareShelf backend

The backend is a Node.js/Express REST API with PostgreSQL/Prisma persistence, Cloudinary image storage, and a real pretrained CLIP image comparison service.

## What is implemented

- JWT registration, login, and current-user endpoint
- Owner-created listings, browse/search filters, listing updates, and image uploads
- Server-calculated booking totals, overlap checks, mock payment, and controlled booking transitions
- Pickup and return image evidence, persisted comparison results, and pretrained CLIP cosine similarity

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, and Cloudinary credentials.
2. Install dependencies: `pnpm install`.
3. Generate the Prisma client: `pnpm db:generate`.
4. Create the database tables: `pnpm db:migrate -- --name init`.
5. Run the API: `pnpm dev`.

The health endpoint is `GET http://localhost:4000/api/v1/health`.

## Vision workflow

With `VISION_MODE=live`, the backend loads `Xenova/clip-vit-base-patch32` on first startup. For every return upload it creates embeddings for the pickup and return images, calculates cosine similarity, and records `PASS` for scores of at least `0.70`; lower scores receive `REVIEW_REQUIRED`.

`VISION_MODE=mock` is only for offline automated testing. It must not be used as an unlabeled demo result.

## Main endpoints

- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/me`
- `POST|GET /api/v1/items`, `GET|PATCH /api/v1/items/:itemId`
- `POST /api/v1/items/:itemId/images` (multipart field: `image`)
- `POST /api/v1/items/:itemId/bookings`, `GET /api/v1/bookings`
- `POST /api/v1/bookings/:bookingId/mock-payment`
- `POST /api/v1/bookings/:bookingId/evidence/pickup|return` (multipart field: `image`)
- `POST /api/v1/bookings/:bookingId/transition`
- `GET /api/v1/bookings/:bookingId/comparison`
