import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { registrarAuditoria } from "@/lib/audit"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: {
      analisis: true,
      respuestas: true,
      adjuntos: true,
      auditorias: { orderBy: { fecha: "desc" } },
    },
  })

  if (!solicitud) return Response.json({ error: "No encontrada" }, { status: 404 })

  await prisma.solicitud.update({
    where: { id },
    data: { leido: true },
  })

  return Response.json(solicitud)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const solicitud = await prisma.solicitud.update({
    where: { id },
    data: {
      ...(body.estado && { estado: body.estado }),
      ...(body.tipoTramite && { tipoTramite: body.tipoTramite }),
      ...(body.prioridad && { prioridad: body.prioridad }),
    },
  })

  await registrarAuditoria(
    "SOLICITUD_ACTUALIZADA",
    session.user.id,
    id,
    `Estado: ${solicitud.estado}`
  )

  return Response.json(solicitud)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.solicitud.delete({ where: { id } })

  await registrarAuditoria("SOLICITUD_ELIMINADA", session.user.id, id)

  return Response.json({ success: true })
}
