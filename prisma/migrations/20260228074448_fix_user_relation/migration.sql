/*
  Warnings:

  - You are about to drop the `restaurant_users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `restaurantId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "restaurant_users" DROP CONSTRAINT "restaurant_users_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "restaurant_users" DROP CONSTRAINT "restaurant_users_userId_fkey";

-- AlterTable
ALTER TABLE "restaurants" ALTER COLUMN "storeCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "restaurantId" TEXT NOT NULL;

-- DropTable
DROP TABLE "restaurant_users";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("storeCode") ON DELETE CASCADE ON UPDATE CASCADE;
