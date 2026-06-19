"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/toast"
import { EmptyState } from "@/components/ui/empty-state"

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
  const [editingCuenta, setEditingCuenta] = useState<Cuenta | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const { addToast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    try {
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
        addToast("Cuenta agregada", "success")
        router.refresh()
      } else {
        addToast("Error al agregar cuenta", "error")
      }
    } catch {
      addToast("Error de conexión", "error")
    }
    setLoading(false)
  }

  async function toggleActiva(cuenta: Cuenta) {
    try {
      const res = await fetch(`/api/cuentas-email/${cuenta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !cuenta.active }),
      })
      if (res.ok) {
        addToast(cuenta.active ? "Cuenta desactivada" : "Cuenta activada", "success")
        router.refresh()
      }
    } catch {
      addToast("Error al cambiar estado", "error")
    }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta cuenta?")) return
    try {
      const res = await fetch(`/api/cuentas-email/${id}`, { method: "DELETE" })
      if (res.ok) {
        addToast("Cuenta eliminada", "success")
        router.refresh()
      }
    } catch {
      addToast("Error al eliminar", "error")
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEditLoading(true)

    const form = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {
      email: form.get("email"),
      host: form.get("host"),
      port: parseInt(form.get("port") as string) || 993,
      usuario: form.get("usuario"),
    }
    const password = form.get("password") as string
    if (password) body.password = password

    try {
      const res = await fetch(`/api/cuentas-email/${editingCuenta!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setEditingCuenta(null)
        addToast("Cuenta actualizada", "success")
        router.refresh()
      } else {
        addToast("Error al actualizar", "error")
      }
    } catch {
      addToast("Error de conexión", "error")
    }
    setEditLoading(false)
  }

  async function sincronizar() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch("/api/imap/sync", { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const resultText = data.map(
        (r: { cuenta: string; solicitudes: number; error?: string }) =>
          `${r.cuenta}: ${r.solicitudes} solicitudes${r.error ? ` (error: ${r.error})` : ""}`
      ).join("\n")
      setSyncResult(resultText)
      addToast("Sincronización completada", "success")
      router.refresh()
    } catch {
      setSyncResult("Error de conexión")
      addToast("Error al sincronizar", "error")
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

      {cuentas.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white">
          <EmptyState
            icon="◎"
            title="No hay cuentas configuradas"
            description="Agregá una cuenta de Gmail para sincronizar solicitudes automáticamente."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="overflow-x-auto">
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
                          onClick={() => setEditingCuenta(c)}
                          className="text-xs text-stone-600 hover:text-stone-800"
                        >
                          Editar
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
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {editingCuenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Editar cuenta email</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={editingCuenta.email}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Host</label>
                <input
                  name="host"
                  required
                  defaultValue={editingCuenta.host}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Puerto</label>
                <input
                  name="port"
                  type="number"
                  defaultValue={editingCuenta.port}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Usuario</label>
                <input
                  name="usuario"
                  required
                  defaultValue={editingCuenta.usuario}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Contraseña
                  <span className="ml-1 text-xs font-normal text-stone-400">
                    (dejá vacío para no cambiar)
                  </span>
                </label>
                <input
                  name="password"
                  type="password"
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCuenta(null)}
                  className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
                >
                  {editLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
