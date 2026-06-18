"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Solicitud = {
  id: string
  email: string
  asunto: string
  mensaje: string
  fecha: Date
  estado: string
  tipoTramite: string | null
  prioridad: string
  leido: boolean
  alumno: { nombre: string | null; email: string } | null
  analisis: { categoria: string | null; confianza: number | null } | null
  respuestas: { id: string; aprobada: boolean }[]
  _count: { adjuntos: number }
}

type Normativa = {
  id: string
  titulo: string
  tipo: string
}

const COLUMNAS = [
  { key: "PENDIENTE", label: "Pendientes", color: "border-t-amber-500" },
  { key: "PROCESANDO", label: "En Proceso", color: "border-t-blue-500" },
  { key: "COMPLETADO", label: "Completados", color: "border-t-green-500" },
  { key: "RECHAZADO", label: "Rechazados", color: "border-t-red-500" },
] as const

const PRIORIDAD_COLORS: Record<string, string> = {
  ALTA: "bg-red-100 text-red-700",
  NORMAL: "bg-blue-100 text-blue-700",
  BAJA: "bg-stone-100 text-stone-600",
}

const TIPO_COLORS: Record<string, string> = {
  CERTIFICADO: "bg-purple-100 text-purple-700",
  INSCRIPCION: "bg-indigo-100 text-indigo-700",
  CONSULTA: "bg-teal-100 text-teal-700",
  OTRO: "bg-stone-100 text-stone-600",
}

export function CrmBoard({
  solicitudes,
  normativas,
  esAdmin,
}: {
  solicitudes: Solicitud[]
  normativas: Normativa[]
  esAdmin: boolean
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroPrioridad, setFiltroPrioridad] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = solicitudes.filter((s) => {
    if (search && !s.asunto.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false
    if (filtroTipo && s.tipoTramite !== filtroTipo) return false
    if (filtroPrioridad && s.prioridad !== filtroPrioridad) return false
    return true
  })

  const selected = selectedId ? solicitudes.find((s) => s.id === selectedId) : null

  async function cambiarEstado(id: string, estado: string) {
    await fetch(`/api/solicitudes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
    router.refresh()
  }

  async function analizar(id: string) {
    await fetch(`/api/analizar/${id}`, { method: "POST" })
    router.refresh()
  }

  return (
    <div className="flex h-full gap-6">
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
          <Link
            href="/solicitudes/nueva"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Nueva solicitud
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Buscar por asunto o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
          >
            <option value="">Todos los tipos</option>
            <option value="CERTIFICADO">Certificado</option>
            <option value="INSCRIPCION">Inscripción</option>
            <option value="CONSULTA">Consulta</option>
            <option value="OTRO">Otro</option>
          </select>
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="ALTA">Alta</option>
            <option value="NORMAL">Normal</option>
            <option value="BAJA">Baja</option>
          </select>
        </div>

        <div className="grid flex-1 grid-cols-4 gap-4 overflow-hidden">
          {COLUMNAS.map((col) => {
            const items = filtered.filter((s) => s.estado === col.key)
            return (
              <div
                key={col.key}
                className={`flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white border-t-4 ${col.color}`}
              >
                <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                    {items.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-3">
                  {items.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-all hover:shadow-md ${
                        selectedId === s.id ? "border-stone-900 ring-2 ring-stone-900" : "border-stone-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight line-clamp-2">
                          {s.asunto}
                        </p>
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${PRIORIDAD_COLORS[s.prioridad] || ""}`}>
                          {s.prioridad}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-500 truncate">
                        {s.alumno?.nombre || s.email}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {s.tipoTramite && (
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TIPO_COLORS[s.tipoTramite] || ""}`}>
                            {s.tipoTramite}
                          </span>
                        )}
                        {s.analisis?.confianza && (
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                            {Math.round(s.analisis.confianza * 100)}%
                          </span>
                        )}
                        {s._count.adjuntos > 0 && (
                          <span className="text-[10px] text-stone-400">📎{s._count.adjuntos}</span>
                        )}
                      </div>
                      <p className="mt-1.5 text-[10px] text-stone-400">
                        {new Date(s.fecha).toLocaleDateString("es-AR")}
                      </p>
                    </button>
                  ))}
                  {items.length === 0 && (
                    <p className="py-8 text-center text-xs text-stone-400">Vacío</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <div className="w-96 shrink-0 overflow-y-auto rounded-xl border border-stone-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold truncate">{selected.asunto}</h2>
            <button
              onClick={() => setSelectedId(null)}
              className="text-stone-400 hover:text-stone-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs font-medium text-stone-500">Email</span>
              <p>{selected.email}</p>
            </div>
            {selected.alumno?.nombre && (
              <div>
                <span className="text-xs font-medium text-stone-500">Alumno</span>
                <p>{selected.alumno.nombre}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-medium text-stone-500">Mensaje</span>
              <p className="mt-1 whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-xs leading-relaxed">
                {selected.mensaje}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selected.estado}
                onChange={(e) => cambiarEstado(selected.id, e.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="PROCESANDO">En Proceso</option>
                <option value="COMPLETADO">Completado</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>

              {!selected.analisis && selected.estado === "PENDIENTE" && (
                <button
                  onClick={() => analizar(selected.id)}
                  className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
                >
                  Analizar IA
                </button>
              )}
            </div>

            {selected.analisis && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-medium text-stone-500">Análisis IA</p>
                <p className="mt-1 text-xs">Tipo: {selected.analisis.categoria || "-"}</p>
                {selected.analisis.confianza && (
                  <p className="text-xs">Confianza: {Math.round(selected.analisis.confianza * 100)}%</p>
                )}
              </div>
            )}

            <Link
              href={`/solicitudes/${selected.id}`}
              className="block rounded-lg bg-stone-100 px-3 py-2 text-center text-xs font-medium text-stone-700 hover:bg-stone-200"
            >
              Ver detalle completo →
            </Link>
          </div>
        </div>
      )}

      {!selected && normativas.length > 0 && (
        <div className="w-72 shrink-0 overflow-y-auto rounded-xl border border-stone-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold">Normativas</h3>
          <div className="space-y-2">
            {normativas.map((n) => (
              <div key={n.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <span className="text-[10px] font-medium text-stone-500">{n.tipo}</span>
                <p className="mt-0.5 text-xs font-medium">{n.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
