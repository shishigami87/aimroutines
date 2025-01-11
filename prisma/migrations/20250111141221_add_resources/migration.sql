-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('CROSSHAIR', 'THEME', 'SOUND');

-- CreateTable
CREATE TABLE "Resource" (
    "hash" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "ResourceLiked" (
    "resourceHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceLiked_pkey" PRIMARY KEY ("resourceHash","userId")
);

-- CreateTable
CREATE TABLE "ResourceLikedTwitch" (
    "resourceHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceLikedTwitch_pkey" PRIMARY KEY ("resourceHash","userId")
);

-- AddForeignKey
ALTER TABLE "ResourceLiked" ADD CONSTRAINT "ResourceLiked_resourceHash_fkey" FOREIGN KEY ("resourceHash") REFERENCES "Resource"("hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLiked" ADD CONSTRAINT "ResourceLiked_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceLikedTwitch" ADD CONSTRAINT "ResourceLikedTwitch_resourceHash_fkey" FOREIGN KEY ("resourceHash") REFERENCES "Resource"("hash") ON DELETE RESTRICT ON UPDATE CASCADE;
