-- CreateTable
CREATE TABLE "Playlist" (
    "title" TEXT NOT NULL DEFAULT 'Normal',
    "reference" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("title","routineId")
);

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Copy old rows
INSERT INTO "Playlist" ("routineId", "reference")
SELECT "id", "reference" FROM "Routine";

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_reference_key" ON "Playlist"("reference");

-- DropIndex
DROP INDEX "Routine_reference_key";

-- AlterTable
ALTER TABLE "Routine" DROP COLUMN "reference";