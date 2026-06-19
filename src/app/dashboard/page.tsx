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
  return `shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${map[estado] || "bg-stone-100 text-stone-600"}`
}

export default async function DashboardPage() {
  const session = await auth()

  const [totalSolicitudes, pendientes, hoyCount] = await Promise.all([
    prisma.solicitud.count(),
    prisma.solicitud.count({ where: { estado: "PENDIENTE" } }),
    prisma.solicitud.count({
      where: {
        fecha: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ])

  const ultimas = await prisma.solicitud.findMany({
    orderBy: { fecha: "desc" },
    take: 5,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-sm">
          <p className="text-sm text-stone-500">Total solicitudes</p>
          <p className="mt-1 text-3xl font-bold">{totalSolicitudes}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-stone-100">
            <div
              className="h-1.5 rounded-full bg-stone-900 transition-all"
              style={{ width: `${Math.min(100, (totalSolicitudes / 100) * 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-sm">
          <p className="text-sm text-stone-500">Pendientes</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{pendientes}</p>
          {totalSolicitudes > 0 && (
            <p className="mt-1 text-xs text-stone-400">
              {((pendientes / totalSolicitudes) * 100).toFixed(0)}% del total
            </p>
          )}
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-sm">
          <p className="text-sm text-stone-500">Recibidas hoy</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{hoyCount}</p>
          <p className="mt-1 text-xs text-stone-400">
            {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="font-semibold">Últimas solicitudes</h2>
          {ultimas.length > 0 && (
            <Link href="/solicitudes" className="text-xs font-medium text-stone-500 hover:text-stone-700">
              Ver todas →
            </Link>
          )}
        </div>
        {ultimas.length === 0 ? (
          <EmptyState
            icon="○"
            title="No hay solicitudes aún"
            description="Las solicitudes aparecerán aquí cuando los alumnos envíen consultas."
            action={{ label: "Ir al CRM", href: "/crm" }}
          />
        ) : (
          <div className="divide-y divide-stone-100">
            {ultimas.map((s) => (
              <Link
                key={s.id}
                href={`/solicitudes/${s.id}`}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-stone-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900">{s.asunto}</p>
                  <p className="text-xs text-stone-500">{s.email}</p>
                </div>
                <span className={estadoBadge(s.estado)}>{s.estado}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
