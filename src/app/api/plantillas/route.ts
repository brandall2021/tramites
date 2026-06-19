import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const plantillas = await prisma.plantillaRespuesta.findMany({
    where: { activa: true },
    orderBy: { nombre: "asc" },
  })
  return Response.json(plantillas)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const plantilla = await prisma.plantillaRespuesta.create({
    data: {
      nombre: body.nombre,
      tipo: body.tipo || null,
      texto: body.texto,
    },
  })

  return Response.json(plantilla, { status: 201 })
}
