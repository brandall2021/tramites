import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminSolicitudesPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const solicitudes = await prisma.solicitud.findMany({
    orderBy: { fecha: "desc" },
    include: {
      analisis: true,
      _count: { select: { adjuntos: true } },
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Todas las solicitudes</h1>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
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
                <td className="px-5 py-3">{s.email}</td>
                <td className="px-5 py-3 font-medium text-stone-900">{s.asunto}</td>
                <td className="px-5 py-3 text-stone-500">{s.tipoTramite || "-"}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.estado === "PENDIENTE" ? "bg-amber-100 text-amber-700" :
                    s.estado === "PROCESANDO" ? "bg-blue-100 text-blue-700" :
                    s.estado === "COMPLETADO" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {s.estado}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.prioridad === "ALTA" ? "bg-red-100 text-red-700" :
                    s.prioridad === "NORMAL" ? "bg-blue-100 text-blue-700" :
                    "bg-stone-100 text-stone-600"
                  }`}>
                    {s.prioridad}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-stone-500">
                  {new Date(s.fecha).toLocaleDateString("es-AR", {
                    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
