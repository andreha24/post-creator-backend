/*
  Warnings:

  - You are about to drop the column `is_published` on the `posts` table. All the data in the column will be lost.
  - Added the required column `platform` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "is_published",
ADD COLUMN     "platform" TEXT NOT NULL;
