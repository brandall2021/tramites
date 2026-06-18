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
  if (body.email) data.email = body.email
  if (body.host) data.host = body.host
  if (body.port) data.port = body.port
  if (body.usuario) data.usuario = body.usuario
  if (body.password) data.password = body.password
  if (typeof body.active === "boolean") data.active = body.active

  const cuenta = await prisma.cuentaEmail.update({
    where: { id },
    data,
  })

  return Response.json(cuenta)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.cuentaEmail.delete({ where: { id } })

  return Response.json({ success: true })
}
