-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "pseudonyme" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "replay" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);
