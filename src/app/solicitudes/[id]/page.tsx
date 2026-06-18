import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { SolicitudDetail } from "./solicitud-detail"

export const dynamic = "force-dynamic"

export default async function SolicitudDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) return notFound()

  const { id } = await params
  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: {
      analisis: true,
      respuestas: true,
      adjuntos: true,
      auditorias: { orderBy: { fecha: "desc" } },
    },
  })

  if (!solicitud) return notFound()

  return <SolicitudDetail solicitud={solicitud} esAdmin={session.user.role === "ADMIN"} userId={session.user.id} />
}
