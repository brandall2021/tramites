"use client"

import { signOut } from "next-auth/react"

export function Header({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-stone-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-stone-500">
          {user.name || user.email}
        </span>
        <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
          {user.role}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm text-stone-500 hover:text-stone-700"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
