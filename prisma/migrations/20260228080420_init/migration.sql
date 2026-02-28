/*
  Warnings:

  - You are about to drop the column `restaurantId` on the `users` table. All the data in the column will be lost.
  - Made the column `storeCode` on table `restaurants` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_restaurantId_fkey";

-- AlterTable
ALTER TABLE "restaurants" ALTER COLUMN "storeCode" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "restaurantId";

-- CreateTable
CREATE TABLE "restaurant_users" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_users_restaurantId_userId_key" ON "restaurant_users"("restaurantId", "userId");

-- AddForeignKey
ALTER TABLE "restaurant_users" ADD CONSTRAINT "restaurant_users_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_users" ADD CONSTRAINT "restaurant_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
