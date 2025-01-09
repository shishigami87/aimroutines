-- CreateTable
CREATE TABLE "RoutineBenchmark" (
    "url" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineBenchmark_pkey" PRIMARY KEY ("routineId","userId")
);

-- AddForeignKey
ALTER TABLE "RoutineBenchmark" ADD CONSTRAINT "RoutineBenchmark_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineBenchmark" ADD CONSTRAINT "RoutineBenchmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
