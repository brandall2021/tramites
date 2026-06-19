import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { EmptyState } from "@/components/ui/empty-state"

export const dynamic = "force-dynamic"

const estadoBadge = (estado: string) => {
  const map: Record<string, string> = {
    PENDIENTE: "bg-amber-100 text-amber-700",
    PROCESANDO: "bg-blue-100 text-blue-700",
    COMPLETADO: "bg-green-100 text-green-700",
    RECHAZADO: "bg-red-100 text-red-700",
  }
  return `inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[estado] || "bg-stone-100 text-stone-600"}`
}

const prioridadBadge = (p: string) => {
  const map: Record<string, string> = {
    ALTA: "bg-red-100 text-red-700",
    NORMAL: "bg-blue-100 text-blue-700",
    BAJA: "bg-stone-100 text-stone-600",
  }
  return `inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[p] || "bg-stone-100 text-stone-600"}`
}

export default async function SolicitudesPage() {
  const session = await auth()
  const solicitudes = await prisma.solicitud.findMany({
    orderBy: { fecha: "desc" },
    include: {
      analisis: true,
      _count: { select: { adjuntos: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Solicitudes</h1>
        <Link
          href="/solicitudes/nueva"
          className="rounded-lg bg-face px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-face-dark"
        >
          Nueva solicitud
        </Link>
      </div>

      {solicitudes.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white">
          <EmptyState
            icon="○"
            title="No hay solicitudes"
            description="Las solicitudes aparecerán aquí cuando los alumnos envíen consultas o cuando las sincronices desde el correo electrónico."
            action={{ label: "Crear primera solicitud", href: "/solicitudes/nueva" }}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <th className="px-5 py-3 font-medium text-stone-600">Email</th>
                  <th className="px-5 py-3 font-medium text-stone-600">Asunto</th>
                  <th className="px-5 py-3 font-medium text-stone-600">Tipo</th>
                  <th className="px-5 py-3 font-medium text-stone-600">Estado</th>
                  <th className="px-5 py-3 font-medium text-stone-600">Prioridad</th>
                  <th className="px-5 py-3 font-medium text-stone-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {solicitudes.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <Link href={`/solicitudes/${s.id}`} className="block text-stone-700">
                        {s.email}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/solicitudes/${s.id}`} className="block font-medium text-stone-900">
                        {s.asunto}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-stone-500">
                      {s.tipoTramite || <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={estadoBadge(s.estado)}>{s.estado}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={prioridadBadge(s.prioridad)}>{s.prioridad}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-stone-500">
                      {new Date(s.fecha).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
