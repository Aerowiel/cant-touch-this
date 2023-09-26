/*
  Warnings:

  - Added the required column `key` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "pseudonyme" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "elaspedTimeInSeconds" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Score" ("createdAt", "elaspedTimeInSeconds", "id", "pseudonyme", "score") SELECT "createdAt", "elaspedTimeInSeconds", "id", "pseudonyme", "score" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
