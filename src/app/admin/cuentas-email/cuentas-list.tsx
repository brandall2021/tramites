"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Cuenta = {
  id: string
  email: string
  host: string
  port: number
  usuario: string
  active: boolean
}

export function CuentasEmailList({ cuentas }: { cuentas: Cuenta[] }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/cuentas-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        host: form.get("host"),
        port: parseInt(form.get("port") as string) || 993,
        usuario: form.get("usuario"),
        password: form.get("password"),
      }),
    })

    if (res.ok) {
      setShowModal(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function toggleActiva(cuenta: Cuenta) {
    await fetch(`/api/cuentas-email/${cuenta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !cuenta.active }),
    })
    router.refresh()
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta cuenta?")) return
    await fetch(`/api/cuentas-email/${id}`, { method: "DELETE" })
    router.refresh()
  }

  async function sincronizar() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch("/api/imap/sync", { method: "POST" })
      const data = await res.json()
      setSyncResult(
        data.map((r: { cuenta: string; solicitudes: number; error?: string }) =>
          `${r.cuenta}: ${r.solicitudes} solicitudes${r.error ? ` (error: ${r.error})` : ""}`
        ).join("\n")
      )
      router.refresh()
    } catch {
      setSyncResult("Error de conexión")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Agregar cuenta
        </button>
        <button
          onClick={sincronizar}
          disabled={syncing || cuentas.length === 0}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          {syncing ? "Sincronizando..." : "Sincronizar ahora"}
        </button>
      </div>

      {syncResult && (
        <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 whitespace-pre-wrap">
          {syncResult}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left">
              <th className="px-5 py-3 font-medium text-stone-600">Email</th>
              <th className="px-5 py-3 font-medium text-stone-600">Host</th>
              <th className="px-5 py-3 font-medium text-stone-600">Puerto</th>
              <th className="px-5 py-3 font-medium text-stone-600">Estado</th>
              <th className="px-5 py-3 font-medium text-stone-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {cuentas.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-medium">{c.email}</td>
                <td className="px-5 py-3 text-stone-500">{c.host}</td>
                <td className="px-5 py-3 text-stone-500">{c.port}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {c.active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActiva(c)}
                      className="text-xs text-amber-600 hover:text-amber-800"
                    >
                      {c.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminar(c.id)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cuentas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-stone-400">
                  No hay cuentas configuradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Agregar cuenta email</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="tucorreo@gmail.com"
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Host</label>
                <input
                  name="host"
                  required
                  defaultValue="imap.gmail.com"
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Puerto</label>
                <input
                  name="port"
                  type="number"
                  defaultValue="993"
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Usuario</label>
                <input
                  name="usuario"
                  required
                  placeholder="tucorreo@gmail.com"
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Contraseña
                  <span className="ml-1 text-xs font-normal text-stone-400">
                    (para Gmail usá una contraseña de aplicación)
                  </span>
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <p className="font-medium">Para Gmail necesitás:</p>
                <ol className="mt-1 list-decimal pl-4 space-y-0.5">
                  <li>Activar IMAP en Configuración de Gmail → Ver todas las configuraciones → Reenvío y correo POP/IMAP</li>
                  <li>Crear una contraseña de aplicación en <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline">https://myaccount.google.com/apppasswords</a></li>
                  <li>Usar esa contraseña de 16 caracteres aquí</li>
                </ol>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
