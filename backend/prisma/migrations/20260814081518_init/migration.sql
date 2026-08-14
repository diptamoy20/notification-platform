-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobile_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sms" BOOLEAN NOT NULL DEFAULT false,
    "email_channel" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "inapp" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
