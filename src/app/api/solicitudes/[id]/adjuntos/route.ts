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

  const solicitud = await prisma.solicitud.findUnique({ where: { id } })
  if (!solicitud) return Response.json({ error: "Solicitud no encontrada" }, { status: 404 })

  const adjunto = await prisma.adjunto.create({
    data: {
      solicitudId: id,
      nombre: body.nombre,
      tipo: body.tipo,
      datos: body.datos,
    },
  })

  await registrarAuditoria(
    "ADJUNTO_AGREGADO",
    session.user.id,
    id,
    `Archivo adjunto: ${body.nombre}`
  )

  return Response.json(adjunto, { status: 201 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const adjuntoId = searchParams.get("adjuntoId")
  if (!adjuntoId) return Response.json({ error: "adjuntoId requerido" }, { status: 400 })

  const adjunto = await prisma.adjunto.findUnique({ where: { id: adjuntoId } })
  if (!adjunto) return Response.json({ error: "Adjunto no encontrado" }, { status: 404 })

  await prisma.adjunto.delete({ where: { id: adjuntoId } })

  await registrarAuditoria(
    "ADJUNTO_ELIMINADO",
    session.user.id,
    adjunto.solicitudId,
    `Archivo eliminado: ${adjunto.nombre}`
  )

  return Response.json({ success: true })
}
