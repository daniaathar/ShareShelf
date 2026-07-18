-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'HELD', 'RELEASED', 'FAILED');

-- CreateEnum
CREATE TYPE "EvidencePhase" AS ENUM ('PICKUP', 'RETURN');

-- CreateEnum
CREATE TYPE "ComparisonVerdict" AS ENUM ('PASS', 'REVIEW_REQUIRED', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "city" VARCHAR(80) NOT NULL,
    "area" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "price_per_day_minor" INTEGER NOT NULL,
    "deposit_minor" INTEGER NOT NULL DEFAULT 0,
    "city" VARCHAR(80) NOT NULL,
    "area" VARCHAR(80) NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_images" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "storage_public_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "renter_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_rental_minor" INTEGER NOT NULL,
    "deposit_minor" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "amount_minor" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PKR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'MOCK',
    "provider_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition_evidence" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "phase" "EvidencePhase" NOT NULL,
    "url" TEXT NOT NULL,
    "storage_public_id" TEXT NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "condition_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condition_comparisons" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "pickup_evidence_id" UUID NOT NULL,
    "return_evidence_id" UUID NOT NULL,
    "similarity_score" DECIMAL(5,4),
    "verdict" "ComparisonVerdict" NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_result_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "condition_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "items_city_area_status_idx" ON "items"("city", "area", "status");

-- CreateIndex
CREATE UNIQUE INDEX "item_images_item_id_position_key" ON "item_images"("item_id", "position");

-- CreateIndex
CREATE INDEX "bookings_item_id_start_date_end_date_idx" ON "bookings"("item_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "bookings_renter_id_status_idx" ON "bookings"("renter_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_reference_key" ON "payments"("provider_reference");

-- CreateIndex
CREATE UNIQUE INDEX "condition_evidence_booking_id_phase_key" ON "condition_evidence"("booking_id", "phase");

-- CreateIndex
CREATE UNIQUE INDEX "condition_comparisons_booking_id_key" ON "condition_comparisons"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "condition_comparisons_pickup_evidence_id_key" ON "condition_comparisons"("pickup_evidence_id");

-- CreateIndex
CREATE UNIQUE INDEX "condition_comparisons_return_evidence_id_key" ON "condition_comparisons"("return_evidence_id");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_images" ADD CONSTRAINT "item_images_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_evidence" ADD CONSTRAINT "condition_evidence_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_evidence" ADD CONSTRAINT "condition_evidence_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_comparisons" ADD CONSTRAINT "condition_comparisons_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_comparisons" ADD CONSTRAINT "condition_comparisons_pickup_evidence_id_fkey" FOREIGN KEY ("pickup_evidence_id") REFERENCES "condition_evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condition_comparisons" ADD CONSTRAINT "condition_comparisons_return_evidence_id_fkey" FOREIGN KEY ("return_evidence_id") REFERENCES "condition_evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
