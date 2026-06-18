import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function POST() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const cuentas = await prisma.cuentaEmail.findMany({ where: { active: true } })
  const results: { cuenta: string; solicitudes: number; error?: string }[] = []

  for (const cuenta of cuentas) {
    try {
      const count = await procesarCuentaIMAP(cuenta)
      results.push({ cuenta: cuenta.email, solicitudes: count })
    } catch (err) {
      results.push({ cuenta: cuenta.email, solicitudes: 0, error: String(err) })
    }
  }

  return Response.json(results)
}

async function procesarCuentaIMAP(cuenta: { id: string; email: string; host: string; port: number; usuario: string; password: string }) {
  const { ImapFlow } = await import("imapflow")
  const { simpleParser } = await import("mailparser")

  const client = new ImapFlow({
    host: cuenta.host,
    port: cuenta.port,
    secure: true,
    auth: { user: cuenta.usuario, pass: cuenta.password },
    logger: false,
  })

  let count = 0

  try {
    await client.connect()
    const lock = await client.getMailboxLock("INBOX")

    try {
      for await (const msg of client.fetch({ seen: false }, { uid: true, envelope: true, source: true })) {
        if (!msg.source) continue
        const parsed = await simpleParser(msg.source.toString())
        const existente = await prisma.solicitud.findFirst({
          where: { emailUid: msg.uid, email: parsed.from?.value?.[0]?.address || cuenta.email },
        })

        if (!existente) {
          const emailAddr = parsed.from?.value?.[0]?.address || "desconocido@email.com"
          const { getOrCreateAlumno } = await import("@/lib/alumno")
          const alumno = await getOrCreateAlumno(emailAddr)
          await prisma.solicitud.create({
            data: {
              email: emailAddr,
              asunto: parsed.subject || "Sin asunto",
              mensaje: parsed.text || parsed.html || "Sin contenido",
              emailUid: msg.uid,
              estado: "PENDIENTE",
              alumnoId: alumno.id,
            },
          })
          count++
        }
      }
    } finally {
      lock.release()
    }

    await client.logout()
  } catch (err) {
    console.error(`Error IMAP para ${cuenta.email}:`, err)
    throw err
  }

  return count
}
