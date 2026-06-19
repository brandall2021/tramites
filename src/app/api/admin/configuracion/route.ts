import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const configs = await prisma.configuracion.findMany({
    orderBy: { clave: "asc" },
  })

  const result: Record<string, string> = {}
  for (const c of configs) {
    result[c.clave] = c.valor
  }

  return NextResponse.json(result)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json() as Record<string, string>

  const updates: { clave: string; valor: string }[] = []
  for (const [clave, valor] of Object.entries(body)) {
    updates.push({ clave, valor: String(valor) })
  }

  for (const u of updates) {
    await prisma.configuracion.upsert({
      where: { clave: u.clave },
      update: { valor: u.valor },
      create: { clave: u.clave, valor: u.valor },
    })
  }

  return NextResponse.json({ ok: true })
}
