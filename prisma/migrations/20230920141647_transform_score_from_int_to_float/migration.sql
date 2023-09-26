/*
  Warnings:

  - You are about to alter the column `score` on the `Score` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Score" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
