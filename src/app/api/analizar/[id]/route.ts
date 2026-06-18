import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"
import { registrarAuditoria } from "@/lib/audit"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const solicitud = await prisma.solicitud.findUnique({ where: { id } })
  if (!solicitud) return Response.json({ error: "No encontrada" }, { status: 404 })

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  const prompt = `Analiza la siguiente solicitud académica y clasifícala.
  
Asunto: ${solicitud.asunto}
Mensaje: ${solicitud.mensaje}
Email: ${solicitud.email}

Responde solo con JSON en este formato exacto:
{
  "tipoTramite": "CERTIFICADO" | "INSCRIPCION" | "CONSULTA" | "OTRO",
  "prioridad": "BAJA" | "NORMAL" | "ALTA",
  "confianza": 0.0-1.0,
  "resumen": "breve resumen del trámite",
  "datosExtraidos": { "campos relevantes encontrados en el texto" }
}`

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    })

    const content = message.content[0]
    let result
    if (content.type === "text") {
      result = JSON.parse(content.text)
    } else {
      throw new Error("Unexpected response type")
    }

    const analisis = await prisma.analisisIA.upsert({
      where: { solicitudId: id },
      create: {
        solicitudId: id,
        categoria: result.tipoTramite,
        confianza: result.confianza,
        resultado: result,
      },
      update: {
        categoria: result.tipoTramite,
        confianza: result.confianza,
        resultado: result,
      },
    })

    await prisma.solicitud.update({
      where: { id },
      data: {
        tipoTramite: result.tipoTramite,
        prioridad: result.prioridad,
        estado: "PROCESANDO",
      },
    })

    const respuestaIA = generarRespuestaBase(result.tipoTramite)

    await registrarAuditoria(
      "ANALISIS_IA",
      session.user.id,
      id,
      `Clasificado como ${result.tipoTramite} (confianza: ${result.confianza})`
    )

    return Response.json({ analisis, respuestaIA })
  } catch (error) {
    console.error("Error analizando con IA:", error)
    return Response.json({ error: "Error al analizar" }, { status: 500 })
  }
}

function generarRespuestaBase(tipo: string): string {
  const respuestas: Record<string, string> = {
    CERTIFICADO: `Estimado/a:

Hemos recibido su solicitud de certificado. La misma será procesada por el área de alumnos.

Número de trámite asignado automáticamente.

Saludos cordiales.`,
    INSCRIPCION: `Estimado/a:

Hemos recibido su solicitud de inscripción. Un administrativo revisará los datos y se comunicará a la brevedad.

Saludos cordiales.`,
    CONSULTA: `Estimado/a:

Gracias por su consulta. A la brevedad daremos respuesta a su solicitud.

Saludos cordiales.`,
  }

  return respuestas[tipo] || `Estimado/a:

Hemos recibido su solicitud. Será derivada al área correspondiente para su procesamiento.

Saludos cordiales.`
}
