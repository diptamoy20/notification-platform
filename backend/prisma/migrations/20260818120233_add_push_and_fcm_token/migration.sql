-- AlterTable
ALTER TABLE "users" ADD COLUMN     "fcm_token" TEXT,
ADD COLUMN     "push" BOOLEAN NOT NULL DEFAULT false;
