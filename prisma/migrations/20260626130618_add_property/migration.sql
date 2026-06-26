-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "operation" "Operation" NOT NULL,
    "propertyType" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "areaM2" INTEGER,
    "coverPhotoUrl" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_operation_idx" ON "Property"("operation");

-- CreateIndex
CREATE INDEX "Property_zone_idx" ON "Property"("zone");
