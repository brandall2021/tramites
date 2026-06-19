export const dynamic = "force-dynamic"

import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <img
              src="/face-logo-dark.png"
              alt="FACET"
              className="mx-auto mb-6 h-auto w-72 object-contain"
            />
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
  )
}
