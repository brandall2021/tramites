import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const hashedPassword = await bcrypt.hash(body.password, 10)

  const user = await prisma.user.create({
    data: {
      email: body.email,
      nombre: body.nombre,
      password: hashedPassword,
      role: body.role || "EMPLEADO",
    },
  })

  return Response.json({ id: user.id, email: user.email, nombre: user.nombre, role: user.role }, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const users = await prisma.user.findMany({
    select: { id: true, email: true, nombre: true, role: true, activo: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(users)
}
