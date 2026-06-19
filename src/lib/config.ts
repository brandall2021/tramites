import { prisma } from "./prisma"

const cache = new Map<string, string | null>()

export async function getConfig(clave: string): Promise<string | null> {
  const envValue = process.env[clave]
  if (envValue) return envValue

  if (cache.has(clave)) return cache.get(clave) ?? null

  try {
    const c = await prisma.configuracion.findUnique({ where: { clave } })
    const val = c?.valor || null
    cache.set(clave, val)
    return val
  } catch {
    return null
  }
}

export function clearConfigCache(clave?: string) {
  if (clave) cache.delete(clave)
  else cache.clear()
}
