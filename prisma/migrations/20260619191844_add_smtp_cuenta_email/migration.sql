-- AlterTable
ALTER TABLE "cuentas_email" ADD COLUMN     "smtpHost" TEXT NOT NULL DEFAULT 'smtp.gmail.com',
ADD COLUMN     "smtpPort" INTEGER NOT NULL DEFAULT 465;
