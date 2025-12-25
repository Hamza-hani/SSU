-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "modules" INTEGER NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "modulesList" JSONB NOT NULL,
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Course_level_idx" ON "Course"("level");

-- CreateIndex
CREATE INDEX "Course_category_idx" ON "Course"("category");
