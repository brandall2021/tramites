"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/toast"

const CAMPOS = [
  {
    clave: "OPENAI_API_KEY",
    label: "OpenAI API Key",
    descripcion: "Clave de API para GPT-4o (análisis de solicitudes y generación de respuestas)",
    type: "password",
    placeholder: "sk-...",
  },
]

export default function ConfiguracionPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    fetch("/api/admin/configuracion")
      .then((r) => r.json())
      .then((data) => setValues(data))
      .catch(() => addToast("Error al cargar configuración", "error"))
      .finally(() => setLoading(false))
  }, [addToast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        addToast("Configuración guardada", "success")
      } else {
        addToast("Error al guardar configuración", "error")
      }
    } catch {
      addToast("Error de conexión", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <div className="animate-pulse space-y-4 rounded-xl border border-stone-200 bg-white p-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div className="mb-2 h-4 w-32 rounded bg-stone-200" />
              <div className="h-10 w-full rounded bg-stone-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        <p className="text-sm text-stone-500">
          Estas claves se almacenan en la base de datos y tienen prioridad sobre las variables de entorno.
        </p>

        {CAMPOS.map((campo) => (
          <div key={campo.clave}>
            <label htmlFor={campo.clave} className="block text-sm font-medium text-stone-700">
              {campo.label}
            </label>
            <p className="mb-1.5 text-xs text-stone-400">{campo.descripcion}</p>
            <input
              id={campo.clave}
              type={campo.type}
              placeholder={campo.placeholder}
              value={values[campo.clave] || ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [campo.clave]: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
            />
          </div>
        ))}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-face px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-face-dark disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </div>
  )
}
