import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CuentasEmailList } from "./cuentas-list"

export const dynamic = "force-dynamic"

export default async function AdminCuentasEmailPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const cuentas = await prisma.cuentaEmail.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Cuentas de Email</h1>
      <CuentasEmailList cuentas={cuentas} />
    </div>
  )
}
