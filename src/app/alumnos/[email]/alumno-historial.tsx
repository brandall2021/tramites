"use client"

import { useState } from "react"
import Link from "next/link"

type SolicitudHistorial = {
  id: string
  email: string
  asunto: string
  mensaje: string
  fecha: Date
  estado: string
  tipoTramite: string | null
  prioridad: string
  leido: boolean
  analisis: { categoria: string | null; confianza: number | null } | null
  respuestas: { id: string; aprobada: boolean; texto: string }[]
  _count: { adjuntos: number }
}

export function AlumnoHistorial({
  solicitudes,
}: {
  solicitudes: SolicitudHistorial[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-amber-100 text-amber-700",
    PROCESANDO: "bg-blue-100 text-blue-700",
    COMPLETADO: "bg-green-100 text-green-700",
    RECHAZADO: "bg-red-100 text-red-700",
  }

  const prioridadColors: Record<string, string> = {
    ALTA: "bg-red-100 text-red-700",
    NORMAL: "bg-blue-100 text-blue-700",
    BAJA: "bg-stone-100 text-stone-600",
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-6 py-4">
        <h2 className="text-lg font-bold">Historial de trámites</h2>
      </div>
      <div className="divide-y divide-stone-100">
        {solicitudes.map((s) => (
          <div key={s.id}>
            <button
              onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-stone-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{s.asunto}</p>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${prioridadColors[s.prioridad] || ""}`}>
                    {s.prioridad}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${estadoColors[s.estado] || "bg-stone-100 text-stone-600"}`}>
                    {s.estado}
                  </span>
                  {s.tipoTramite && (
                    <span className="text-[10px] text-stone-400">{s.tipoTramite}</span>
                  )}
                  {s.analisis?.confianza && (
                    <span className="text-[10px] text-stone-400">
                      IA: {Math.round(s.analisis.confianza * 100)}%
                    </span>
                  )}
                  {s.respuestas.filter((r) => r.aprobada).length > 0 && (
                    <span className="text-[10px] text-green-600">✓ respondido</span>
                  )}
                  {s._count.adjuntos > 0 && (
                    <span className="text-[10px] text-stone-400">📎{s._count.adjuntos}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-stone-400">
                  {new Date(s.fecha).toLocaleDateString("es-AR")}
                </span>
                <span className="text-xs text-stone-300">{expandedId === s.id ? "▲" : "▼"}</span>
              </div>
            </button>

            {expandedId === s.id && (
              <div className="border-t border-stone-100 bg-stone-50 px-6 py-4">
                <div className="max-w-prose space-y-4">
                  <div>
                    <p className="text-xs font-medium text-stone-500 mb-1">Mensaje</p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700 line-clamp-4">
                      {s.mensaje}
                    </p>
                  </div>

                  {s.analisis && (
                    <div className="rounded-lg border border-stone-200 bg-white p-3">
                      <p className="text-xs font-medium text-stone-500">Análisis IA</p>
                      <p className="mt-0.5 text-sm">
                        Categoría: {s.analisis.categoria || "-"} &middot; Confianza: {s.analisis.confianza ? `${Math.round(s.analisis.confianza * 100)}%` : "-"}
                      </p>
                    </div>
                  )}

                  {s.respuestas.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-stone-500 mb-1">Respuestas ({s.respuestas.length})</p>
                      {s.respuestas.map((r) => (
                        <div
                          key={r.id}
                          className={`rounded-lg border p-3 mb-2 ${
                            r.aprobada ? "border-green-200 bg-green-50" : "border-stone-200 bg-white"
                          }`}
                        >
                          <p className="text-[10px] font-medium text-stone-500 mb-1">
                            {r.aprobada ? "Enviada" : "Borrador"}
                          </p>
                          <p className="whitespace-pre-wrap text-sm text-stone-700 line-clamp-3">{r.texto}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/solicitudes/${s.id}`}
                    className="inline-block rounded-lg bg-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-300"
                  >
                    Ver detalle completo →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
        {solicitudes.length === 0 && (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-stone-400">Sin trámites registrados</p>
          </div>
        )}
      </div>
    </div>
  )
}
