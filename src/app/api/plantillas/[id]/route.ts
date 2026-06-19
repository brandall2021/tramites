import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  const data: Record<string, unknown> = {}
  if (body.nombre) data.nombre = body.nombre
  if (body.tipo !== undefined) data.tipo = body.tipo
  if (body.texto) data.texto = body.texto
  if (typeof body.activa === "boolean") data.activa = body.activa

  const plantilla = await prisma.plantillaRespuesta.update({
    where: { id },
    data,
  })

  return Response.json(plantilla)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.plantillaRespuesta.delete({ where: { id } })

  return Response.json({ success: true })
}
