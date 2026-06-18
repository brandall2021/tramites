import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10)
  const empleadoPassword = await bcrypt.hash("empleado123", 10)

  await prisma.user.upsert({
    where: { email: "admin@tramites.edu" },
    update: {},
    create: {
      email: "admin@tramites.edu",
      nombre: "Admin Principal",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  await prisma.user.upsert({
    where: { email: "empleado@tramites.edu" },
    update: {},
    create: {
      email: "empleado@tramites.edu",
      nombre: "Empleado Demo",
      password: empleadoPassword,
      role: "EMPLEADO",
    },
  })

  const solicitud = await prisma.solicitud.create({
    data: {
      email: "alumno@universidad.edu",
      asunto: "Solicitud de certificado de alumno regular",
      mensaje: "Hola, necesito un certificado de alumno regular para presentar en una beca. Mi DNI es 12345678. Muchas gracias.",
      estado: "PENDIENTE",
    },
  })

  await prisma.auditoria.create({
    data: {
      accion: "SOLICITUD_CREADA",
      detalle: "Solicitud creada desde seed",
      solicitudId: solicitud.id,
    },
  })

  console.log("Seed completado")
  console.log("  Admin: admin@tramites.edu / admin123")
  console.log("  Empleado: empleado@tramites.edu / empleado123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
