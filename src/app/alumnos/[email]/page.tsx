import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AlumnoHistorial } from "./alumno-historial"

export const dynamic = "force-dynamic"

export default async function AlumnoPage({
  params,
}: {
  params: Promise<{ email: string }>
}) {
  const session = await auth()
  if (!session) redirect("/")

  const { email } = await params
  const emailDecoded = decodeURIComponent(email)

  const alumno = await prisma.alumno.findUnique({
    where: { email: emailDecoded },
    include: {
      solicitudes: {
        orderBy: { fecha: "desc" },
        include: {
          analisis: { select: { categoria: true, confianza: true } },
          respuestas: { select: { id: true, aprobada: true, texto: true } },
          _count: { select: { adjuntos: true } },
        },
      },
    },
  })

  if (!alumno) redirect("/crm")

  const total = alumno.solicitudes.length
  const pendientes = alumno.solicitudes.filter((s) => s.estado === "PENDIENTE").length
  const completados = alumno.solicitudes.filter((s) => s.estado === "COMPLETADO").length
  const procesando = alumno.solicitudes.filter((s) => s.estado === "PROCESANDO").length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/crm" className="text-sm text-stone-500 hover:text-stone-700">&larr; Volver al CRM</Link>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{alumno.nombre || "Sin nombre"}</h1>
            <p className="mt-1 text-sm text-stone-500">{alumno.email}</p>
            {alumno.telefono && (
              <p className="mt-0.5 text-sm text-stone-500">{alumno.telefono}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-stone-100 px-3 py-2 text-center">
              <p className="text-lg font-bold">{total}</p>
              <p className="text-[10px] text-stone-500">Total</p>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-amber-700">{pendientes}</p>
              <p className="text-[10px] text-amber-600">Pendientes</p>
            </div>
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-blue-700">{procesando}</p>
              <p className="text-[10px] text-blue-600">En proceso</p>
            </div>
            <div className="rounded-lg bg-green-50 px-3 py-2 text-center">
              <p className="text-lg font-bold text-green-700">{completados}</p>
              <p className="text-[10px] text-green-600">Completados</p>
            </div>
          </div>
        </div>
      </div>

      <AlumnoHistorial solicitudes={alumno.solicitudes} />
    </div>
  )
}
