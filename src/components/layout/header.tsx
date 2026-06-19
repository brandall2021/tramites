"use client"

import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Header({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-stone-200 bg-white pl-16 pr-6 lg:pl-6">
      <div className="flex items-center gap-3">
        <img src="/face-logo-dark.png" alt="FACET" className="hidden h-7 w-auto object-contain sm:block" />
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="hidden text-sm text-stone-500 sm:inline">
          {user.name || user.email}
        </span>
        <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
          {user.role}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg px-2.5 py-1.5 text-sm text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
        >
          Salir
        </button>
      </div>
    </header>
  )
}
