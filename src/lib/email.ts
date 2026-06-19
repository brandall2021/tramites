import nodemailer from "nodemailer"
import { prisma } from "./prisma"

export async function sendEmail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string
  subject: string
  text: string
  replyTo?: string
}) {
  const cuenta = await prisma.cuentaEmail.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  })

  if (!cuenta) {
    throw new Error("No hay una cuenta de email activa configurada para enviar")
  }

  const transporter = nodemailer.createTransport({
    host: cuenta.smtpHost,
    port: cuenta.smtpPort,
    secure: cuenta.smtpPort === 465,
    auth: {
      user: cuenta.usuario,
      pass: cuenta.password,
    },
  })

  await transporter.sendMail({
    from: `"Gestor de Trámites FACET" <${cuenta.email}>`,
    to,
    subject,
    text,
    replyTo,
  })
}
