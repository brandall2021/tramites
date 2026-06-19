"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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
  analisis: {
    categoria: string | null
    confianza: number | null
    resultado: unknown
  } | null
  respuestas: {
    id: string
    texto: string
    aprobada: boolean
    fechaEnvio: Date | null
  }[]
  adjuntos: {
    id: string
    nombre: string
    tipo: string
  }[]
  auditorias: {
    id: string
    accion: string
    usuario: string | null
    detalle: string | null
    fecha: Date
  }[]
}

export function SolicitudDetail({
  solicitud,
  esAdmin,
  userId,
}: {
  solicitud: Solicitud
  esAdmin: boolean
  userId: string
}) {
  const router = useRouter()
  const [analizando, setAnalizando] = useState(false)
  const [respuestaTexto, setRespuestaTexto] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function analizarIA() {
    setAnalizando(true)
    try {
      const res = await fetch(`/api/analizar/${solicitud.id}`, { method: "POST" })
      if (res.ok) router.refresh()
    } finally {
      setAnalizando(false)
    }
  }

  const [plantillas, setPlantillas] = useState<{ id: string; nombre: string; tipo: string | null; texto: string }[]>([])
  const [showPlantillas, setShowPlantillas] = useState(false)

  async function cargarPlantillas() {
    if (plantillas.length > 0) {
      setShowPlantillas(!showPlantillas)
      return
    }
    try {
      const res = await fetch("/api/plantillas")
      if (res.ok) {
        const data = await res.json()
        setPlantillas(data)
        setShowPlantillas(true)
      }
    } catch {}
  }

  function usarPlantilla(p: { texto: string }) {
    setRespuestaTexto(p.texto)
    setShowPlantillas(false)
  }

  async function enviarRespuesta(aprobarDirecto = false) {
    if (!respuestaTexto.trim()) return
    setEnviando(true)
    try {
      await fetch(`/api/responder/${solicitud.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: respuestaTexto, aprobarDirecto }),
      })
      router.refresh()
    } finally {
      setEnviando(false)
    }
  }

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-amber-100 text-amber-700",
    PROCESANDO: "bg-blue-100 text-blue-700",
    COMPLETADO: "bg-green-100 text-green-700",
    RECHAZADO: "bg-red-100 text-red-700",
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          &larr; Volver
        </button>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{solicitud.asunto}</h1>
            <p className="mt-1 text-sm text-stone-500">{solicitud.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${estadoColors[solicitud.estado] || "bg-stone-100 text-stone-600"}`}>
              {solicitud.estado}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              solicitud.prioridad === "ALTA" ? "bg-red-100 text-red-700" :
              solicitud.prioridad === "NORMAL" ? "bg-blue-100 text-blue-700" :
              "bg-stone-100 text-stone-600"
            }`}>
              {solicitud.prioridad}
            </span>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
          {solicitud.mensaje}
        </p>

        <p className="mt-4 text-xs text-stone-400">
          {new Date(solicitud.fecha).toLocaleString("es-AR")}
        </p>
      </div>

      {solicitud.adjuntos.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold">Adjuntos</h2>
          <div className="space-y-2">
            {solicitud.adjuntos.map((a) => (
              <div key={a.id} className="flex items-center gap-2 text-sm text-stone-600">
                <span>📎</span>
                <span>{a.nombre}</span>
                <span className="text-xs text-stone-400">({a.tipo})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {solicitud.analisis && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold">Análisis IA</h2>
          <div className="space-y-2 text-sm text-stone-700">
            <p><span className="font-medium">Tipo:</span> {solicitud.analisis.categoria || "-"}</p>
            <p><span className="font-medium">Confianza:</span> {solicitud.analisis.confianza ? `${(solicitud.analisis.confianza * 100).toFixed(0)}%` : "-"}</p>
          </div>
        </div>
      )}

      {!solicitud.analisis && solicitud.estado === "PENDIENTE" && (
        <button
          onClick={analizarIA}
          disabled={analizando}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {analizando ? "Analizando..." : "Analizar con IA"}
        </button>
      )}

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold">Respuesta</h2>

        {solicitud.respuestas.length > 0 ? (
          <div className="space-y-3">
            {solicitud.respuestas.map((r) => (
              <div
                key={r.id}
                className={`rounded-lg border p-4 ${
                  r.aprobada ? "border-green-200 bg-green-50" : "border-stone-200 bg-stone-50"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className={`text-xs font-medium ${r.aprobada ? "text-green-700" : "text-stone-500"}`}>
                    {r.aprobada ? "Enviada" : "Borrador"}
                  </span>
                  {r.fechaEnvio && (
                    <span className="text-xs text-stone-400">
                      {new Date(r.fechaEnvio).toLocaleString("es-AR")}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-stone-700">{r.texto}</p>
                {!r.aprobada && esAdmin && (
                  <button
                    onClick={async () => {
                      await fetch(`/api/responder/${r.id}`, { method: "PATCH" })
                      router.refresh()
                    }}
                    className="mt-2 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Aprobar y enviar
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400">Sin respuesta aún</p>
        )}

        {solicitud.estado !== "COMPLETADO" && solicitud.estado !== "RECHAZADO" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cargarPlantillas}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
              >
                {showPlantillas ? "Ocultar plantillas" : "Usar plantilla"}
              </button>
            </div>
            {showPlantillas && plantillas.length > 0 && (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-2">
                {plantillas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => usarPlantilla(p)}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-stone-700 hover:bg-white"
                  >
                    <span className="font-medium">{p.nombre}</span>
                    {p.tipo && <span className="ml-2 text-xs text-stone-400">({p.tipo})</span>}
                  </button>
                ))}
              </div>
            )}
            <textarea
              value={respuestaTexto}
              onChange={(e) => setRespuestaTexto(e.target.value)}
              rows={5}
              placeholder="Escribir respuesta..."
              className="block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => enviarRespuesta(false)}
                disabled={enviando || !respuestaTexto.trim()}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                Guardar borrador
              </button>
              <button
                onClick={() => enviarRespuesta(true)}
                disabled={enviando || !respuestaTexto.trim()}
                className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
              >
                Enviar respuesta
              </button>
            </div>
          </div>
        )}
      </div>

      {solicitud.auditorias.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold">Historial</h2>
          <div className="space-y-2">
            {solicitud.auditorias.map((a) => (
              <div key={a.id} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 text-xs text-stone-400">
                  {new Date(a.fecha).toLocaleString("es-AR")}
                </span>
                <span className="font-medium text-stone-700">{a.accion}</span>
                {a.detalle && (
                  <span className="text-stone-500">— {a.detalle}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
