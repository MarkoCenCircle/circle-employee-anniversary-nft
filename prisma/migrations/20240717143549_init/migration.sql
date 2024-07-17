/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `User` table. All the data in the column will be lost.
  - Added the required column `circleWalletId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employmentStartDate` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "startDate",
DROP COLUMN "title",
ADD COLUMN     "circleWalletId" UUID NOT NULL,
ADD COLUMN     "employmentStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "position" TEXT;

-- CreateTable
CREATE TABLE "Nft" (
    "id" SERIAL NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "Nft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nft_tokenAddress_tokenId_key" ON "Nft"("tokenAddress", "tokenId");
