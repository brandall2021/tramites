import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
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

  const alumno = await prisma.alumno.upsert({
    where: { email: "alumno@universidad.edu" },
    update: {},
    create: {
      email: "alumno@universidad.edu",
      nombre: "Alumno Demo",
    },
  })

  const solicitud = await prisma.solicitud.create({
    data: {
      email: "alumno@universidad.edu",
      asunto: "Solicitud de certificado de alumno regular",
      mensaje: "Hola, necesito un certificado de alumno regular para presentar en una beca. Mi DNI es 12345678. Muchas gracias.",
      estado: "PENDIENTE",
      alumnoId: alumno.id,
    },
  })

  await prisma.auditoria.create({
    data: {
      accion: "SOLICITUD_CREADA",
      detalle: "Solicitud creada desde seed",
      solicitudId: solicitud.id,
    },
  })

  await prisma.normativa.createMany({
    data: [
      {
        titulo: "Resolución N° 123/2024 - Certificados",
        contenido: "Los certificados de alumno regular se emiten en un plazo máximo de 5 días hábiles. El estudiante debe tener matrícula vigente y presentar DNI.",
        tipo: "RESOLUCION",
      },
      {
        titulo: "Resolución N° 456/2024 - Inscripciones",
        contenido: "Las inscripciones a carreras de grado se realizan en febrero y julio de cada año. Se requiere DNI, título secundario y pago del arancel correspondiente.",
        tipo: "RESOLUCION",
      },
      {
        titulo: "Reglamento de Consultas",
        contenido: "Las consultas administrativas serán respondidas dentro de las 48 horas hábiles. Consultas urgentes deben canalizarse por mesa de entradas.",
        tipo: "REGLAMENTO",
      },
    ],
  })

  await prisma.plantillaRespuesta.createMany({
    data: [
      {
        nombre: "Cancelación de Matrícula",
        tipo: "CANCELACION",
        texto: `Estimado/a alumno/a,

Hemos recibido su solicitud de Cancelación de Matrícula.

A continuación, le detallamos los pasos a seguir:

1. Ingrese al portal AUTOGESTIÓN ALUMNOS
2. Diríjase al apartado "DOCUMENTACIÓN PARA CANCELACIÓN DE MATRÍCULA"
3. Complete la documentación requerida
4. Siga todos los pasos indicados en el sistema

Importante: Una vez iniciado el trámite, el plazo de procesamiento es de 30 a 40 días hábiles.

Para más información, puede consultar la documentación disponible en el portal o comunicarse con nuestra mesa de ayuda.

Saludos cordiales,
Departamento de Trámites Académicos`,
      },
      {
        nombre: "Legalización de Materias",
        tipo: "LEGALIZACION",
        texto: `Estimado/a alumno/a,

Hemos recibido su solicitud de Legalización de Materias.

Para realizar este trámite, siga estos pasos:

1. Ingrese al portal AUTOGESTIÓN ALUMNOS
2. Diríjase al apartado "DOCUMENTACIÓN PARA LEGALIZACIÓN DE MATERIAS"
3. Complete la documentación requerida
4. Siga todos los pasos indicados en el sistema

Importante: Este trámite aplica cuando desea cursar una carrera paralela distinta a la que actualmente realiza en nuestra institución.

El plazo de procesamiento es de 30 a 40 días hábiles.

Saludos cordiales,
Departamento de Trámites Académicos`,
      },
    ],
  })

  const configs = [
    { clave: "OPENAI_API_KEY", valor: process.env.OPENAI_API_KEY || "" },
  ]
  for (const c of configs) {
    await prisma.configuracion.upsert({
      where: { clave: c.clave },
      update: { valor: c.valor },
      create: { clave: c.clave, valor: c.valor },
    })
  }

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
