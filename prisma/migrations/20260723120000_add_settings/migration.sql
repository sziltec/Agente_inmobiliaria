-- CreateEnum
CREATE TYPE "ConversationRuntime" AS ENUM ('GEMINI', 'HERMES');

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "messengerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "instagramEnabled" BOOLEAN NOT NULL DEFAULT true,
    "runtime" "ConversationRuntime" NOT NULL DEFAULT 'GEMINI',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
