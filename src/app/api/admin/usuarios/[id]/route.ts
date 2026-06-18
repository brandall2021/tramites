import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
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
  if (body.nombre) data.nombre = body.nombre
  if (body.role) data.role = body.role
  if (typeof body.activo === "boolean") data.activo = body.activo
  if (body.password) data.password = await bcrypt.hash(body.password, 10)

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, nombre: true, role: true, activo: true },
  })

  return Response.json(user)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  await prisma.user.delete({ where: { id } })

  return Response.json({ success: true })
}
