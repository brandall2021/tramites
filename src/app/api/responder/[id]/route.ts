import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { registrarAuditoria } from "@/lib/audit"
import { sendEmail } from "@/lib/email"

async function enviarEmailRespuesta(respuestaId: string) {
  const respuesta = await prisma.respuesta.findUnique({
    where: { id: respuestaId },
    include: { solicitud: { select: { email: true, asunto: true } } },
  })
  if (!respuesta) throw new Error("Respuesta no encontrada")

  await sendEmail({
    to: respuesta.solicitud.email,
    subject: `Re: ${respuesta.solicitud.asunto}`,
    text: respuesta.texto,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const respuesta = await prisma.respuesta.create({
    data: {
      solicitudId: id,
      texto: body.texto,
      aprobada: body.aprobarDirecto || false,
      ...(body.aprobarDirecto && {
        aprobadaPor: session.user.id,
        fechaEnvio: new Date(),
      }),
    },
  })

  if (body.aprobarDirecto) {
    try {
      await enviarEmailRespuesta(respuesta.id)
    } catch (err) {
      await prisma.respuesta.update({
        where: { id: respuesta.id },
        data: { aprobada: false, aprobadaPor: null, fechaEnvio: null },
      })
      return Response.json({ error: `Error al enviar email: ${(err as Error).message}` }, { status: 502 })
    }

    await prisma.solicitud.update({
      where: { id },
      data: { estado: "COMPLETADO" },
    })
  }

  await registrarAuditoria(
    body.aprobarDirecto ? "RESPUESTA_ENVIADA" : "RESPUESTA_BORRADOR",
    session.user.id,
    id,
    "Respuesta generada"
  )

  return Response.json(respuesta, { status: 201 })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const respuesta = await prisma.respuesta.update({
    where: { id },
    data: {
      aprobada: true,
      aprobadaPor: session.user.id,
      fechaEnvio: new Date(),
    },
  })

  const solicitud = await prisma.respuesta.findUnique({
    where: { id },
    select: { solicitudId: true },
  })

  if (solicitud) {
    try {
      await enviarEmailRespuesta(respuesta.id)
    } catch (err) {
      await prisma.respuesta.update({
        where: { id },
        data: { aprobada: false, aprobadaPor: null, fechaEnvio: null },
      })
      return Response.json({ error: `Error al enviar email: ${(err as Error).message}` }, { status: 502 })
    }

    await prisma.solicitud.update({
      where: { id: solicitud.solicitudId },
      data: { estado: "COMPLETADO" },
    })

    await registrarAuditoria(
      "RESPUESTA_APROBADA",
      session.user.id,
      solicitud.solicitudId,
      "Respuesta aprobada y enviada por admin"
    )
  }

  return Response.json(respuesta)
}
