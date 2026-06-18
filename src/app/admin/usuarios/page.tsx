import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { UserList } from "./user-list"

export const dynamic = "force-dynamic"

export default async function AdminUsuariosPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      nombre: true,
      role: true,
      activo: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
      <UserList users={users} />
    </div>
  )
}
