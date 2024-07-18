-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "UnredeemedNft" (
    "email" TEXT NOT NULL,
    "nftId" INTEGER NOT NULL,
    "redeemDate" TIMESTAMP(3),

    CONSTRAINT "UnredeemedNft_pkey" PRIMARY KEY ("email","nftId")
);

-- CreateIndex
CREATE INDEX "UnredeemedNft_redeemDate_idx" ON "UnredeemedNft" USING HASH ("redeemDate");

-- CreateIndex
CREATE INDEX "User_isVerified_idx" ON "User" USING HASH ("isVerified");

-- AddForeignKey
ALTER TABLE "UnredeemedNft" ADD CONSTRAINT "UnredeemedNft_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "Nft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
