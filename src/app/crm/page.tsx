import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CrmBoard } from "./crm-board"

export const dynamic = "force-dynamic"

export default async function CrmPage() {
  const session = await auth()
  if (!session) redirect("/")

  const solicitudes = await prisma.solicitud.findMany({
    orderBy: { fecha: "desc" },
    include: {
      alumno: { select: { nombre: true, email: true } },
      analisis: { select: { categoria: true, confianza: true } },
      respuestas: { select: { id: true, aprobada: true } },
      _count: { select: { adjuntos: true } },
    },
  })

  const normativas = await prisma.normativa.findMany({
    where: { activa: true },
    select: { id: true, titulo: true, tipo: true },
  })

  return (
    <CrmBoard
      solicitudes={solicitudes}
      normativas={normativas}
      esAdmin={session.user.role === "ADMIN"}
    />
  )
}
