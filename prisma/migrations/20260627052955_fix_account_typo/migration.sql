/*
  Warnings:

  - You are about to drop the column `providerAccoutId` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[provider,providerAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `providerAccountId` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Account_provider_providerAccoutId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "providerAccoutId",
ADD COLUMN     "providerAccountId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
