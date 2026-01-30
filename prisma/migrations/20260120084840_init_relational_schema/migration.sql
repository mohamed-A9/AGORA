-- CreateEnum
CREATE TYPE "MainCategory" AS ENUM ('CAFE', 'RESTAURANT', 'NIGHTLIFE_BARS', 'CLUBS_PARTY', 'EVENTS', 'ACTIVITIES_FUN');

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Morocco',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "mainCategory" "MainCategory" NOT NULL,
    "cityId" TEXT NOT NULL,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "priceLevel" INTEGER,
    "phone" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "coverImageUrl" TEXT,
    "ownerId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "numReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueMedia" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'image',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mainCategory" "MainCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuisine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cuisine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vibe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vibe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MusicType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "venueId" TEXT,
    "cityId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "priceMin" DOUBLE PRECISION,
    "priceMax" DOUBLE PRECISION,
    "coverImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueSubcategory" (
    "venueId" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,

    CONSTRAINT "VenueSubcategory_pkey" PRIMARY KEY ("venueId","subcategoryId")
);

-- CreateTable
CREATE TABLE "VenueCuisine" (
    "venueId" TEXT NOT NULL,
    "cuisineId" TEXT NOT NULL,

    CONSTRAINT "VenueCuisine_pkey" PRIMARY KEY ("venueId","cuisineId")
);

-- CreateTable
CREATE TABLE "VenueVibe" (
    "venueId" TEXT NOT NULL,
    "vibeId" TEXT NOT NULL,

    CONSTRAINT "VenueVibe_pkey" PRIMARY KEY ("venueId","vibeId")
);

-- CreateTable
CREATE TABLE "VenueMusicType" (
    "venueId" TEXT NOT NULL,
    "musicTypeId" TEXT NOT NULL,

    CONSTRAINT "VenueMusicType_pkey" PRIMARY KEY ("venueId","musicTypeId")
);

-- CreateTable
CREATE TABLE "VenuePolicy" (
    "venueId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,

    CONSTRAINT "VenuePolicy_pkey" PRIMARY KEY ("venueId","policyId")
);

-- CreateTable
CREATE TABLE "VenueFacility" (
    "venueId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "VenueFacility_pkey" PRIMARY KEY ("venueId","facilityId")
);

-- CreateTable
CREATE TABLE "VenueTag" (
    "venueId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "VenueTag_pkey" PRIMARY KEY ("venueId","tagId")
);

-- CreateTable
CREATE TABLE "EventVibe" (
    "eventId" TEXT NOT NULL,
    "vibeId" TEXT NOT NULL,

    CONSTRAINT "EventVibe_pkey" PRIMARY KEY ("eventId","vibeId")
);

-- CreateTable
CREATE TABLE "EventMusicType" (
    "eventId" TEXT NOT NULL,
    "musicTypeId" TEXT NOT NULL,

    CONSTRAINT "EventMusicType_pkey" PRIMARY KEY ("eventId","musicTypeId")
);

-- CreateTable
CREATE TABLE "EventTag" (
    "eventId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "EventTag_pkey" PRIMARY KEY ("eventId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "City"("name");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");

-- CreateIndex
CREATE INDEX "Venue_cityId_idx" ON "Venue"("cityId");

-- CreateIndex
CREATE INDEX "Venue_mainCategory_idx" ON "Venue"("mainCategory");

-- CreateIndex
CREATE INDEX "Venue_priceLevel_idx" ON "Venue"("priceLevel");

-- CreateIndex
CREATE INDEX "VenueMedia_venueId_idx" ON "VenueMedia"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_slug_key" ON "Subcategory"("slug");

-- CreateIndex
CREATE INDEX "Subcategory_mainCategory_idx" ON "Subcategory"("mainCategory");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_name_mainCategory_key" ON "Subcategory"("name", "mainCategory");

-- CreateIndex
CREATE UNIQUE INDEX "Cuisine_slug_key" ON "Cuisine"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Cuisine_name_key" ON "Cuisine"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vibe_slug_key" ON "Vibe"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MusicType_slug_key" ON "MusicType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_code_key" ON "Policy"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_code_key" ON "Facility"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_cityId_startsAt_idx" ON "Event"("cityId", "startsAt");

-- CreateIndex
CREATE INDEX "VenueSubcategory_subcategoryId_idx" ON "VenueSubcategory"("subcategoryId");

-- CreateIndex
CREATE INDEX "VenueCuisine_cuisineId_idx" ON "VenueCuisine"("cuisineId");

-- CreateIndex
CREATE INDEX "VenueVibe_vibeId_idx" ON "VenueVibe"("vibeId");

-- CreateIndex
CREATE INDEX "VenueMusicType_musicTypeId_idx" ON "VenueMusicType"("musicTypeId");

-- CreateIndex
CREATE INDEX "VenuePolicy_policyId_idx" ON "VenuePolicy"("policyId");

-- CreateIndex
CREATE INDEX "VenueFacility_facilityId_idx" ON "VenueFacility"("facilityId");

-- CreateIndex
CREATE INDEX "VenueTag_tagId_idx" ON "VenueTag"("tagId");

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMedia" ADD CONSTRAINT "VenueMedia_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueSubcategory" ADD CONSTRAINT "VenueSubcategory_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueSubcategory" ADD CONSTRAINT "VenueSubcategory_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueCuisine" ADD CONSTRAINT "VenueCuisine_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueCuisine" ADD CONSTRAINT "VenueCuisine_cuisineId_fkey" FOREIGN KEY ("cuisineId") REFERENCES "Cuisine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueVibe" ADD CONSTRAINT "VenueVibe_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueVibe" ADD CONSTRAINT "VenueVibe_vibeId_fkey" FOREIGN KEY ("vibeId") REFERENCES "Vibe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMusicType" ADD CONSTRAINT "VenueMusicType_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueMusicType" ADD CONSTRAINT "VenueMusicType_musicTypeId_fkey" FOREIGN KEY ("musicTypeId") REFERENCES "MusicType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenuePolicy" ADD CONSTRAINT "VenuePolicy_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenuePolicy" ADD CONSTRAINT "VenuePolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueFacility" ADD CONSTRAINT "VenueFacility_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueFacility" ADD CONSTRAINT "VenueFacility_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueTag" ADD CONSTRAINT "VenueTag_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueTag" ADD CONSTRAINT "VenueTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVibe" ADD CONSTRAINT "EventVibe_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVibe" ADD CONSTRAINT "EventVibe_vibeId_fkey" FOREIGN KEY ("vibeId") REFERENCES "Vibe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMusicType" ADD CONSTRAINT "EventMusicType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMusicType" ADD CONSTRAINT "EventMusicType_musicTypeId_fkey" FOREIGN KEY ("musicTypeId") REFERENCES "MusicType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTag" ADD CONSTRAINT "EventTag_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTag" ADD CONSTRAINT "EventTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
