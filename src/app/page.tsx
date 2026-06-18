export const dynamic = "force-dynamic"

import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Gestor de Trámites
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Iniciar sesión
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
