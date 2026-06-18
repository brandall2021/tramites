import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { registrarAuditoria } from "@/lib/audit"

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
  const body = await request.json()

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
    await prisma.solicitud.update({
      where: { id: solicitud.solicitudId },
      data: { estado: "COMPLETADO" },
    })

    await registrarAuditoria(
      "RESPUESTA_APROBADA",
      session.user.id,
      solicitud.solicitudId,
      "Respuesta aprobada por admin"
    )
  }

  return Response.json(respuesta)
}
