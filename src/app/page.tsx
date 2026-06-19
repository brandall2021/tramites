export const dynamic = "force-dynamic"

import { LoginForm } from "./login-form"
import { ToastProvider } from "@/components/ui/toast"

export default function LoginPage() {
  return (
    <ToastProvider>
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-stone-900 text-white text-sm font-bold tracking-tight">
              GT
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Gestor de Trámites
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Sistema de gestión académica
            </p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <LoginForm />
          </div>
          <p className="mt-6 text-center text-xs text-stone-400">
            &copy; {new Date().getFullYear()} &mdash; FACET
          </p>
        </div>
      </div>
    </ToastProvider>
  )
}
