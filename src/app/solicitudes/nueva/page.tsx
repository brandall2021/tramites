"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

export default function NuevaSolicitudPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          asunto: form.get("asunto"),
          mensaje: form.get("mensaje"),
        }),
      })

      if (res.ok) {
        addToast("Solicitud creada", "success")
        router.push("/solicitudes")
        router.refresh()
      } else {
        addToast("Error al crear solicitud", "error")
      }
    } catch {
      addToast("Error de conexión", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nueva solicitud</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">
            Email del solicitante
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="asunto" className="block text-sm font-medium text-stone-700">
            Asunto
          </label>
          <input
            id="asunto"
            name="asunto"
            required
            className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <div>
          <label htmlFor="mensaje" className="block text-sm font-medium text-stone-700">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows={6}
            required
            className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-face px-4 py-2 text-sm font-medium text-white hover:bg-face-dark disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Crear solicitud"}
        </button>
      </form>
    </div>
  )
}
