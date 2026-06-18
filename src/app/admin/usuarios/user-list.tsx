"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  nombre: string
  role: string
  activo: boolean
  createdAt: Date
}

export function UserList({ users }: { users: User[] }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const data: Record<string, unknown> = {
      email: form.get("email"),
      nombre: form.get("nombre"),
      role: form.get("role"),
    }

    if (form.get("password")) {
      data.password = form.get("password")
    }

    const url = editUser
      ? `/api/admin/usuarios/${editUser.id}`
      : "/api/admin/usuarios"

    const res = await fetch(url, {
      method: editUser ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setShowModal(false)
      setEditUser(null)
      router.refresh()
    }
    setLoading(false)
  }

  async function toggleActivo(user: User) {
    await fetch(`/api/admin/usuarios/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !user.activo }),
    })
    router.refresh()
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar usuario?")) return
    await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => {
          setEditUser(null)
          setShowModal(true)
        }}
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
      >
        Nuevo usuario
      </button>

      <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-left">
              <th className="px-5 py-3 font-medium text-stone-600">Nombre</th>
              <th className="px-5 py-3 font-medium text-stone-600">Email</th>
              <th className="px-5 py-3 font-medium text-stone-600">Rol</th>
              <th className="px-5 py-3 font-medium text-stone-600">Estado</th>
              <th className="px-5 py-3 font-medium text-stone-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-stone-50">
                <td className="px-5 py-3 font-medium">{u.nombre}</td>
                <td className="px-5 py-3 text-stone-500">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    u.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditUser(u)
                        setShowModal(true)
                      }}
                      className="text-xs text-stone-500 hover:text-stone-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(u)}
                      className="text-xs text-amber-600 hover:text-amber-800"
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminar(u.id)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">
              {editUser ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Nombre</label>
                <input
                  name="nombre"
                  defaultValue={editUser?.nombre || ""}
                  required
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editUser?.email || ""}
                  required
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Contraseña {editUser && "(dejar vacío para no cambiar)"}
                </label>
                <input
                  name="password"
                  type="password"
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Rol</label>
                <select
                  name="role"
                  defaultValue={editUser?.role || "EMPLEADO"}
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm shadow-xs focus:border-stone-500 focus:outline-hidden focus:ring-1 focus:ring-stone-500"
                >
                  <option value="EMPLEADO">Empleado</option>
                  <option value="ADMIN">Admin</option>
                </select>
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
    </>
  )
}
