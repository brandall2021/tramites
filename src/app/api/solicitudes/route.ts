import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"
import { registrarAuditoria } from "@/lib/audit"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const estado = searchParams.get("estado")
  const q = searchParams.get("q")

  const where: Record<string, unknown> = {}
  if (estado) where.estado = estado
  if (q) {
    where.OR = [
      { asunto: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ]
  }

  const solicitudes = await prisma.solicitud.findMany({
    where,
    orderBy: { fecha: "desc" },
    include: {
      analisis: true,
      respuestas: true,
      _count: { select: { adjuntos: true } },
    },
  })

  return Response.json(solicitudes)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const solicitud = await prisma.solicitud.create({
    data: {
      email: body.email,
      asunto: body.asunto,
      mensaje: body.mensaje,
      estado: "PENDIENTE",
    },
  })

  await registrarAuditoria(
    "SOLICITUD_CREADA",
    session.user.id,
    solicitud.id,
    `Solicitud creada manualmente: ${body.asunto}`
  )

  return Response.json(solicitud, { status: 201 })
}
