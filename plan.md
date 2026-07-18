# ShareShelf MVP - Technical Plan

## 1. Product statement

ShareShelf is a mobile-first peer-to-peer marketplace for renting occasionally used household items within a city or area. Owners list idle items; renters discover, reserve, collect, and return them. The MVP proves one critical claim:

> Two strangers can complete a short-term rental with photo evidence before and after the rental to make item-condition disputes visible and reviewable.

The demo is successful when an owner can list an item, a renter can book it, both collection and return photos can be recorded, and the system returns a clear condition-comparison result.

## 2. MVP scope

### In scope

- Email/password registration and login
- Owner listing creation with one or more photos
- Browse and city/area filtering
- Listing detail and date-based booking request
- Mock payment record (no real payment gateway)
- Controlled booking lifecycle
- Pickup and return condition-photo uploads
- AI/provider-backed similarity result, with a safe fallback for local demo work
- "My bookings" view for the logged-in renter and owner

### Explicitly out of scope

- Real card payments, escrow, payouts, refunds, or KYC
- GPS, live maps, or radius search
- Ratings, chat, notifications, dispute-resolution dashboard, and admin tools
- Native mobile apps
- Training a computer-vision model

These are not missing features; they are deliberate cuts that protect the core demo.

## 3. Users and core journey

| Actor | Goal | MVP actions |
| --- | --- | --- |
| Owner | Earn from an idle item | Register, create listing, view/manage incoming booking |
| Renter | Use an item temporarily without buying it | Register, browse, choose dates, mock-pay, upload return evidence |
| System | Preserve evidence and state | Block unavailable dates, store photos, compare pickup/return evidence |

**Happy-path demo:**

1. Owner signs up and creates a drill listing with photos.
2. Renter signs up, filters by area, opens the listing, and requests two dates.
3. Backend verifies availability and creates a `PENDING_PAYMENT` booking.
4. Renter uses Mock Pay; booking becomes `CONFIRMED`.
5. At handover, a pickup photo is uploaded and booking becomes `PICKED_UP`.
6. At return, a return photo is uploaded. The comparison runs and returns a result.
7. The owner marks the item returned; booking is `COMPLETED` if there is no review flag.

## 4. Architecture

```text
[Lovable React frontend]
          |
          | HTTPS / JSON + Bearer JWT
          v
[Node.js + Express REST API] ---- [Pretrained CLIP vision model]
          |                         (image embeddings + cosine similarity)
          |
          +---- [PostgreSQL]
          |
          +---- [Cloudinary/object storage]
                    ^
                    |
             listing and condition images
```

### Responsibilities

- **Lovable / frontend:** responsive screens, form validation for user experience, API calls, image selection/upload, and status/result display. It must not decide availability or booking transitions.
- **Express backend:** authentication, authorization, validation, availability checks, booking state machine, persistence, and calls to storage/vision services.
- **PostgreSQL:** source of truth for users, listings, bookings, payments, evidence, and comparison results.
- **Cloudinary/object storage:** stores image files; PostgreSQL stores only secure URLs/public IDs and metadata.
- **Vision module:** runs a real pretrained CLIP image-embedding model and calculates cosine similarity between the pickup and return photos. It supplies evidence only; it does not make an automatic financial or dispute decision.

### Proposed repository layout

```text
ShareShelf/
  plan.md
  backend/
    src/
      app.js
      server.js
      routes/ controllers/ services/ middleware/ validators/ utils/
    prisma/ or migrations/
    tests/
  frontend/                 # generated/maintained in Lovable
    src/
      pages/ components/ services/ types/
  README.md
```

Use one backend codebase with route -> controller -> service -> database layers. Keep external-service code behind `storageService` and `visionService` so mocked local implementations can be swapped without rewriting booking logic.

## 5. Technical choices

| Concern | MVP choice | Reason |
| --- | --- | --- |
| API | Node.js, Express, REST, JSON | Fast to build and easy to demo/test with Postman |
| Database | PostgreSQL | Fits relationships and transaction-safe date-conflict checks |
| Data access | Prisma ORM (or parameterized `pg`) | Migrations and schema safety; choose one, not both |
| Authentication | bcrypt password hashes + JWT | Small, understandable MVP auth boundary |
| Image storage | Cloudinary | Managed uploads without operating a file server |
| Vision | `@huggingface/transformers` with `Xenova/clip-vit-base-patch32` | Runs a real pretrained CLIP model in the backend; no custom training required |
| Payments | database-backed mock payment | Demonstrates business flow without handling money |

## 6. Data model and contracts

All IDs are UUID strings. All timestamps are ISO 8601 UTC strings. Dates are `YYYY-MM-DD`. Money is stored as integer minor units (for example, `250000` = PKR 2,500.00) to avoid floating-point errors.

### Enums

```text
ItemStatus: AVAILABLE | UNAVAILABLE | ARCHIVED
BookingStatus: PENDING_PAYMENT | CONFIRMED | PICKED_UP | RETURNED | COMPLETED | CANCELLED
PaymentStatus: PENDING | HELD | RELEASED | FAILED
EvidencePhase: PICKUP | RETURN
ComparisonVerdict: PASS | REVIEW_REQUIRED | UNAVAILABLE
```

### Tables

#### `users`

| Field | Type / rules |
| --- | --- |
| id | UUID, primary key |
| name | varchar(80), required |
| email | varchar(255), required, unique, lowercase |
| password_hash | varchar, required; never returned by API |
| city | varchar(80), required |
| area | varchar(80), nullable |
| created_at / updated_at | timestamptz |

#### `items`

| Field | Type / rules |
| --- | --- |
| id | UUID, primary key |
| owner_id | UUID, FK `users.id`, required |
| title | varchar(120), required |
| description | text, required, max 2,000 chars |
| price_per_day_minor | integer, required, greater than 0 |
| deposit_minor | integer, required, zero or more |
| city / area | varchar(80), required |
| status | `ItemStatus`, default `AVAILABLE` |
| created_at / updated_at | timestamptz |

#### `item_images`

`id`, `item_id` (FK), `url`, `storage_public_id`, `position` (0-based), `created_at`. Enforce unique `(item_id, position)` and allow 1-5 images per listing in application validation.

#### `bookings`

| Field | Type / rules |
| --- | --- |
| id | UUID, primary key |
| item_id | UUID, FK, required |
| renter_id | UUID, FK, required; must not equal item owner |
| start_date / end_date | date, required; `start_date <= end_date` |
| total_rental_minor | integer, calculated server-side |
| deposit_minor | integer, snapshot from listing at booking time |
| status | `BookingStatus`, default `PENDING_PAYMENT` |
| created_at / updated_at | timestamptz |

An item cannot have overlapping active bookings. The service checks overlap before insert and the operation runs in a database transaction. An active booking is `PENDING_PAYMENT`, `CONFIRMED`, `PICKED_UP`, `RETURNED`, or `COMPLETED`; cancelled bookings do not block dates.

#### `payments`

`id`, `booking_id` (unique FK), `amount_minor`, `currency` (`PKR` for MVP), `status`, `provider` (`MOCK`), `provider_reference`, `created_at`, `updated_at`.

#### `condition_evidence`

`id`, `booking_id` (FK), `phase`, `url`, `storage_public_id`, `uploaded_by_id` (FK users), `created_at`. Require one image per phase for the MVP; the schema permits more later. A unique `(booking_id, phase)` ensures one canonical photo per phase.

#### `condition_comparisons`

`id`, `booking_id` (unique FK), `pickup_evidence_id`, `return_evidence_id`, `similarity_score` (decimal 0-1, nullable), `verdict`, `provider`, `provider_result_json` (JSONB, nullable), `created_at`.

### Important relationship rules

- Only the item owner may edit or archive their listing.
- Only an authenticated renter may create a booking, and never for their own item.
- Only the owner or renter on a booking may read it.
- Only a booking participant can upload evidence; the server also checks that the upload phase matches the current status.
- URLs are treated as untrusted input: accept only storage-service upload results or validated Cloudinary URLs.

## 7. API design

Base URL: `/api/v1`. Requests and responses use JSON except multipart image upload. A protected endpoint requires `Authorization: Bearer <accessToken>`.

### Standard response envelopes

```json
{ "data": { } }
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "endDate must be on or after startDate",
    "fields": { "endDate": "Invalid date range" }
  }
}
```

Use `400` for malformed requests, `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict (unavailable dates or invalid state transition), and `500` only for unexpected errors. Never return stack traces or password hashes.

### Authentication

| Method + path | Request body | Success response |
| --- | --- | --- |
| `POST /auth/register` | `{name,email,password,city,area?}` | `201 {data:{user,accessToken}}` |
| `POST /auth/login` | `{email,password}` | `200 {data:{user,accessToken}}` |
| `GET /me` | - | `200 {data:{user}}` |

`user` contract: `{id,name,email,city,area,createdAt}`. Password must be at least 8 characters in the MVP.

### Listings

| Method + path | Purpose |
| --- | --- |
| `POST /items` | Create a listing (owner only) |
| `GET /items?city=&area=&q=&page=1&limit=12` | Browse available listings |
| `GET /items/:itemId` | Listing detail including images and owner public profile |
| `PATCH /items/:itemId` | Owner updates title, description, price, deposit, city/area, or status |
| `POST /items/:itemId/images` | Owner uploads one image using multipart field `image` |

Create-item request:

```json
{
  "title": "Bosch impact drill",
  "description": "Includes two drill bits and carrying case.",
  "pricePerDayMinor": 80000,
  "depositMinor": 300000,
  "city": "Lahore",
  "area": "DHA Phase 5"
}
```

Item response:

```json
{
  "data": {
    "id": "uuid",
    "owner": { "id": "uuid", "name": "Ayesha" },
    "title": "Bosch impact drill",
    "description": "Includes two drill bits and carrying case.",
    "pricePerDayMinor": 80000,
    "depositMinor": 300000,
    "city": "Lahore",
    "area": "DHA Phase 5",
    "status": "AVAILABLE",
    "images": [{ "id": "uuid", "url": "https://...", "position": 0 }]
  }
}
```

### Bookings and mock payments

| Method + path | Purpose |
| --- | --- |
| `POST /items/:itemId/bookings` | Create booking request after server availability check |
| `GET /bookings?role=renter|owner&status=` | Authenticated user's bookings |
| `GET /bookings/:bookingId` | Booking detail for owner or renter |
| `POST /bookings/:bookingId/mock-payment` | Move `PENDING_PAYMENT` booking to `CONFIRMED` |
| `POST /bookings/:bookingId/cancel` | Renter cancels before pickup; owner may cancel before pickup |
| `POST /bookings/:bookingId/transition` | Owner triggers the permitted lifecycle transition |

Create-booking request and response:

```json
{ "startDate": "2026-07-18", "endDate": "2026-07-20" }
```

```json
{
  "data": {
    "id": "uuid",
    "itemId": "uuid",
    "renterId": "uuid",
    "startDate": "2026-07-18",
    "endDate": "2026-07-20",
    "rentalDays": 3,
    "totalRentalMinor": 240000,
    "depositMinor": 300000,
    "status": "PENDING_PAYMENT",
    "payment": { "status": "PENDING", "currency": "PKR" }
  }
}
```

The total is always calculated on the backend: `(number of inclusive calendar days x item.price_per_day_minor)`. The frontend may show an estimate but must accept the server result as final.

Transition request: `{ "status": "PICKED_UP" }` or `{ "status": "RETURNED" }`. No client may set arbitrary status values.

### Condition evidence and comparison

| Method + path | Purpose |
| --- | --- |
| `POST /bookings/:bookingId/evidence/pickup` | Upload canonical pickup image (multipart `image`) |
| `POST /bookings/:bookingId/evidence/return` | Upload canonical return image and run comparison |
| `GET /bookings/:bookingId/comparison` | Read comparison result for booking participants |

Return-evidence response:

```json
{
  "data": {
    "evidence": { "id": "uuid", "phase": "RETURN", "url": "https://..." },
    "comparison": {
      "similarityScore": 0.94,
      "verdict": "PASS",
      "message": "94% visual similarity; no review flag raised."
    }
  }
}
```

### Pretrained vision-model contract

The backend loads the pretrained CLIP model once at startup, then the `visionService.compare(pickupImageUrl, returnImageUrl)` adapter:

1. Downloads/reads each canonical evidence image.
2. Generates a normalized image embedding for each image with CLIP.
3. Calculates cosine similarity between the two embedding vectors.
4. Persists the score, model name, threshold version, and verdict.

CLIP has already been trained on image-text pairs; ShareShelf does **not** train or fine-tune it. Its work in this MVP is genuine inference: converting evidence photos into numerical visual representations and comparing them. Hugging Face's Transformers.js supports pretrained models in JavaScript, including zero-shot image classification workloads, which makes it a practical Node-based choice for this backend. [Hugging Face Transformers.js documentation](https://huggingface.co/docs/transformers.js/en/index)

The adapter returns:

```ts
{ similarityScore: number | null; provider: string; rawResult?: object }
```

Verdict policy is transparent and configurable: score `>= 0.70` -> `PASS`; score `< 0.70` -> `REVIEW_REQUIRED`; unavailable/failed inference -> `UNAVAILABLE`. The displayed message must say this is a visual similarity signal, not a guarantee that no damage exists.

The live pretrained model is the normal demo path. `VISION_MODE=mock` is allowed only for automated tests or an explicit offline fallback; the UI must label it as simulated and it must never be presented as AI output. Before the demo, preload the model and test it using two matching images and one clearly different image so first-download delays do not interrupt the presentation.

## 8. Booking state machine

```text
PENDING_PAYMENT --mock payment--> CONFIRMED --pickup evidence + owner action--> PICKED_UP
PICKED_UP --return evidence + owner action--> RETURNED --comparison PASS--> COMPLETED
PENDING_PAYMENT / CONFIRMED --cancel--> CANCELLED
RETURNED --comparison REVIEW_REQUIRED or UNAVAILABLE--> RETURNED (shown for manual review)
```

Transition safeguards:

- Mock payment only runs from `PENDING_PAYMENT`.
- Pickup evidence can only be uploaded for `CONFIRMED` bookings.
- Return evidence can only be uploaded for `PICKED_UP` bookings.
- `COMPLETED` requires return evidence and a `PASS` comparison.
- Invalid transitions return `409 INVALID_BOOKING_STATE`.

## 9. Implementation phases

Do not start frontend implementation until Phase 1 contracts are written, reviewed, and manually tested.

### Phase 0 - project setup (30-60 minutes)

- Create repository folders and `.env.example`.
- Add `README.md` with local-run commands and selected stack.
- Decide whether PostgreSQL is local, Neon, Supabase, or Railway; record the chosen connection source.
- Create a Postman/Bruno collection named `ShareShelf MVP API`.

**Done when:** server health check returns `200`, database connects, and secrets are not committed.

### Phase 1 - backend contracts and foundation (first priority)

- Create schema/migrations for all tables and enums above.
- Add validation, centralized errors, auth middleware, and JWT issue/verification.
- Implement/register test: register, login, `GET /me`.
- Implement/test: create, list, and get item; use seeded users/items.
- Write actual OpenAPI or Postman examples from the contracts in section 7.

**Done when:** a terminal/Postman user can register, authenticate, create an item, and retrieve it with documented responses.

### Phase 2 - booking domain (backend)

- Implement availability query and transactional booking creation.
- Implement booking list/detail and mock payment.
- Enforce the state machine and authorization rules.
- Add tests for overlapping dates, self-booking, unauthorized access, and invalid transition.

**Done when:** the API prevents two active bookings over the same dates and exposes correct totals/statuses.

### Phase 3 - storage and pretrained AI evidence (backend)

- Add Cloudinary upload service with file type/size limits.
- Implement listing-image and evidence endpoints.
- Add the CLIP model loader, embedding extraction, cosine-similarity utility, and persisted comparison record.
- Add a model warm-up script that downloads/loads weights before the demo.
- Test a matching image pair, a different-item pair, an inference failure, a PASS result, and a REVIEW_REQUIRED result.

**Done when:** pickup/return evidence can be uploaded, the pretrained CLIP model runs, and a stored comparison result is returned safely.

### Phase 4 - frontend in Lovable

Give Lovable the section 7 contracts and a base API URL, rather than asking it to invent backend behavior. Build in this order:

1. Login/register and saved JWT session.
2. Listing grid with city/area filter and item detail page.
3. Create listing form and image upload.
4. Booking date picker, server error display, and mock-payment confirmation.
5. My Bookings status timeline.
6. Pickup/return upload screens and comparison result card.

**Done when:** the browser can complete the happy path using only documented API responses.

### Phase 5 - integration, demo seed, and quality pass

- Seed 3-5 realistic listings, two users (owner/renter), and optional completed booking.
- Verify every API endpoint from the collection.
- Test on a mobile-width browser viewport.
- Add loading, empty, validation, forbidden, unavailable-date, failed-upload, and expired-session states.
- Perform two complete demo rehearsals with a clean database or predictable seed reset.

**Done when:** the demo journey works without manual database edits or unexplained steps.

## 10. Acceptance checklist

- [ ] Passwords are hashed; secrets are only in environment variables.
- [ ] All protected APIs reject missing/invalid JWTs.
- [ ] A user cannot modify another owner's item or read an unrelated booking.
- [ ] Booking total and availability are calculated on the server.
- [ ] Conflicting active dates return `409`, not a duplicate booking.
- [ ] Uploads accept only image MIME types and defined size limits.
- [ ] Pickup and return images are persisted separately and linked to the booking.
- [ ] Vision failures create an honest `UNAVAILABLE` result rather than a fabricated score.
- [ ] The UI shows evidence/result status and handles API errors clearly.
- [ ] `README.md` explains setup, environment variables, seed command, and the demo path.

## 11. Environment variables

```text
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
VISION_MODE=mock
VISION_MODEL=Xenova/clip-vit-base-patch32
```

Never put these values in frontend source, screenshots, commits, or the plan's example requests.

## 12. Demo script (2-3 minutes)

1. Show a pre-seeded owner listing in Lahore/DHA Phase 5.
2. Log in as renter, filter to the area, open the drill, and book three dates.
3. Click Mock Pay and show `CONFIRMED` in My Bookings.
4. Upload pickup and return condition images; show the stored result card.
5. Explain the result and state clearly that real payment and human dispute handling are planned next - not silently simulated.

## 13. Known risks and mitigations

| Risk | Mitigation |
| --- | --- |
| First model load is slow or unavailable | Warm up/cache the pretrained model before the demo; reserve mock mode for clearly labeled offline testing only |
| Double booking under simultaneous requests | Transactional availability check plus a conflict test |
| Image upload slows development | Prove listing uploads first; use a single canonical photo per evidence phase |
| Scope expands before core flow works | Treat every out-of-scope feature as a post-demo backlog item |
| Frontend/backend contract drift | Maintain the API collection/OpenAPI examples as the shared source of truth |

## 14. What comes after the MVP

Real payments (e.g. marketplace/escrow-compliant provider), multiple evidence angles, manual dispute review, verified user identity, ratings, notifications, and location radius search are the next product increments. They should begin only after the MVP demonstrates that the booking and evidence flow is understandable and reliable.
