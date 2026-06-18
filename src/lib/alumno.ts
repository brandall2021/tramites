import { prisma } from "./prisma"

export async function getOrCreateAlumno(email: string, nombre?: string) {
  const existing = await prisma.alumno.findUnique({ where: { email } })
  if (existing) {
    if (nombre && existing.nombre !== nombre) {
      return prisma.alumno.update({ where: { email }, data: { nombre } })
    }
    return existing
  }
  return prisma.alumno.create({
    data: { email, nombre: nombre || null },
  })
}

export async function getAlumnoConHistorial(email: string) {
  return prisma.alumno.findUnique({
    where: { email },
    include: {
      solicitudes: {
        orderBy: { fecha: "desc" },
        take: 20,
      },
    },
  })
}
