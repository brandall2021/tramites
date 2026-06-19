import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PlantillasList } from "./plantillas-list"

export const dynamic = "force-dynamic"

export default async function AdminPlantillasPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const plantillas = await prisma.plantillaRespuesta.findMany({
    orderBy: { nombre: "asc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Plantillas de Respuesta</h1>
      <PlantillasList plantillas={plantillas} />
    </div>
  )
}
