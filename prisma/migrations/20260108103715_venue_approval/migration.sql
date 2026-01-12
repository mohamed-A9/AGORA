-- CreateEnum
CREATE TYPE "VenueStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "status" "VenueStatus" NOT NULL DEFAULT 'PENDING';
