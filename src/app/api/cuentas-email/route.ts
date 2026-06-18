import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const cuentas = await prisma.cuentaEmail.findMany()
  return Response.json(cuentas)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const cuenta = await prisma.cuentaEmail.create({
    data: {
      email: body.email,
      host: body.host,
      port: body.port || 993,
      usuario: body.usuario,
      password: body.password,
    },
  })

  return Response.json(cuenta, { status: 201 })
}
