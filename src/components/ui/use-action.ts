"use client"

import { useState } from "react"
import { useToast } from "./toast"

type ActionOptions = {
  loading?: string
  success?: string
  error?: string
}

export function useAction() {
  const { addToast, removeToast } = useToast()
  const [loading, setLoading] = useState(false)

  async function run<T>(
    fn: () => Promise<T>,
    opts?: ActionOptions
  ): Promise<T | undefined> {
    setLoading(true)
    let toastId: string | null = null
    if (opts?.loading) {
      toastId = addToast(opts.loading, "loading")
    }
    try {
      const result = await fn()
      if (toastId) removeToast(toastId)
      if (opts?.success) addToast(opts.success, "success")
      return result
    } catch {
      if (toastId) removeToast(toastId)
      addToast(opts?.error || "Ocurrió un error", "error")
      return undefined
    } finally {
      setLoading(false)
    }
  }

  return { run, loading }
}
