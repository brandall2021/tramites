"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function NuevaSolicitudPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const { addToast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const adjuntos = []
    for (const file of files) {
      const datos = await readFileAsBase64(file)
      adjuntos.push({ nombre: file.name, tipo: file.type, datos })
    }

    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          asunto: form.get("asunto"),
          mensaje: form.get("mensaje"),
          adjuntos: adjuntos.length ? adjuntos : undefined,
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

  function eliminarArchivo(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i))
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
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Archivos adjuntos
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="mt-1 block w-full text-sm text-stone-500 file:mr-4 file:rounded-lg file:border-0 file:bg-face file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-face-dark"
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                  <span>📎 {f.name}</span>
                  <span className="text-xs text-stone-400">({(f.size / 1024).toFixed(0)} KB)</span>
                  <button
                    type="button"
                    onClick={() => eliminarArchivo(i)}
                    className="ml-auto text-xs text-red-600 hover:text-red-800"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
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
