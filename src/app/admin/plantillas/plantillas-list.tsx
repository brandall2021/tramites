"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"
import { EmptyState } from "@/components/ui/empty-state"

type Plantilla = {
  id: string
  nombre: string
  tipo: string | null
  texto: string
  activa: boolean
}

export function PlantillasList({ plantillas }: { plantillas: Plantilla[] }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Plantilla | null>(null)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const body = {
      nombre: form.get("nombre"),
      tipo: form.get("tipo"),
      texto: form.get("texto"),
    }

    const url = editing
      ? `/api/plantillas/${editing.id}`
      : "/api/plantillas"
    const method = editing ? "PATCH" : "POST"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowModal(false)
        setEditing(null)
        addToast(editing ? "Plantilla actualizada" : "Plantilla creada", "success")
        router.refresh()
      } else {
        addToast("Error al guardar plantilla", "error")
      }
    } catch {
      addToast("Error de conexión", "error")
    }
    setLoading(false)
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta plantilla?")) return
    try {
      const res = await fetch(`/api/plantillas/${id}`, { method: "DELETE" })
      if (res.ok) {
        addToast("Plantilla eliminada", "success")
        router.refresh()
      }
    } catch {
      addToast("Error al eliminar", "error")
    }
  }

  function openEdit(p: Plantilla) {
    setEditing(p)
    setShowModal(true)
  }

  function openCreate() {
    setEditing(null)
    setShowModal(true)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={openCreate}
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
      >
        Nueva plantilla
      </button>

      {plantillas.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white">
          <EmptyState
            icon="▽"
            title="No hay plantillas configuradas"
            description="Creá plantillas para agilizar la redacción de respuestas frecuentes."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <th className="px-5 py-3 font-medium text-stone-600">Nombre</th>
                  <th className="px-5 py-3 font-medium text-stone-600">Tipo</th>
                  <th className="px-5 py-3 font-medium text-stone-600">Estado</th>
                  <th className="px-5 py-3 font-medium text-stone-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {plantillas.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 font-medium">{p.nombre}</td>
                    <td className="px-5 py-3 text-stone-500">{p.tipo || <span className="text-stone-300">—</span>}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.activa ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {p.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs text-stone-600 hover:text-stone-800"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminar(p.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">
              {editing ? "Editar plantilla" : "Nueva plantilla"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Nombre</label>
                <input
                  name="nombre"
                  required
                  defaultValue={editing?.nombre || ""}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Tipo</label>
                <select
                  name="tipo"
                  defaultValue={editing?.tipo || ""}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                >
                  <option value="">Sin tipo</option>
                  <option value="CANCELACION">Cancelación de Matrícula</option>
                  <option value="LEGALIZACION">Legalización de Materias</option>
                  <option value="CERTIFICADO">Certificado</option>
                  <option value="INSCRIPCION">Inscripción</option>
                  <option value="CONSULTA">Consulta</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Texto</label>
                <textarea
                  name="texto"
                  required
                  rows={8}
                  defaultValue={editing?.texto || ""}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditing(null) }}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
