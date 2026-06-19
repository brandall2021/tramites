import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { email } = await params
  const emailDecoded = decodeURIComponent(email)

  const alumno = await prisma.alumno.findUnique({
    where: { email: emailDecoded },
    include: {
      solicitudes: {
        orderBy: { fecha: "desc" },
        take: 50,
        include: {
          analisis: { select: { categoria: true, confianza: true } },
          respuestas: { select: { id: true, aprobada: true, texto: true } },
          _count: { select: { adjuntos: true } },
        },
      },
    },
  })

  if (!alumno) return Response.json({ error: "Alumno no encontrado" }, { status: 404 })

  return Response.json(alumno)
}
