import { prisma } from "./prisma"

export async function registrarAuditoria(
  accion: string,
  usuario?: string,
  solicitudId?: string,
  detalle?: string
) {
  await prisma.auditoria.create({
    data: { accion, usuario, solicitudId, detalle },
  })
}
