import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

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
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Total solicitudes</p>
          <p className="mt-1 text-3xl font-bold">{totalSolicitudes}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Pendientes</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{pendientes}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Hoy</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{hoyCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-4">
          <h2 className="font-semibold">Últimas solicitudes</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {ultimas.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.asunto}</p>
                <p className="text-xs text-stone-500">{s.email}</p>
              </div>
              <span className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                s.estado === "PENDIENTE" ? "bg-amber-100 text-amber-700" :
                s.estado === "PROCESANDO" ? "bg-blue-100 text-blue-700" :
                s.estado === "COMPLETADO" ? "bg-green-100 text-green-700" :
                "bg-red-100 text-red-700"
              }`}>
                {s.estado}
              </span>
            </div>
          ))}
          {ultimas.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-stone-400">
              No hay solicitudes aún
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
