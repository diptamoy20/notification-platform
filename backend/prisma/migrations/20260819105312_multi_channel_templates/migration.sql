-- AlterTable
ALTER TABLE "notification_templates" ADD COLUMN     "email_body" TEXT,
ADD COLUMN     "push_body" TEXT,
ADD COLUMN     "push_title" TEXT,
ADD COLUMN     "sms_body" TEXT,
ADD COLUMN     "whatsapp_body" TEXT;
