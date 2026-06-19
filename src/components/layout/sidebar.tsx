"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/crm", label: "CRM", icon: "◇" },
  { href: "/solicitudes", label: "Solicitudes", icon: "○" },
]

const ADMIN_ITEMS = [
  { href: "/admin/solicitudes", label: "Todas las solicitudes", icon: "□" },
  { href: "/admin/cuentas-email", label: "Cuentas Email", icon: "◎" },
  { href: "/admin/plantillas", label: "Plantillas", icon: "▽" },
  { href: "/admin/configuracion", label: "Configuración", icon: "⚙" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "△" },
]

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-3 top-3 z-50 flex size-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 shadow-sm lg:hidden"
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
      >
        <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0`}
      >
        <div className="flex h-14 items-center border-b border-stone-200 px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/face-logo-dark.png" alt="FACET" className="h-8 w-auto object-contain" />
            <span className="text-xs font-bold tracking-tight text-stone-600">Trámites</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            General
          </p>
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
              onClick={() => setMobileOpen(false)}
            />
          ))}
          {role === "ADMIN" && (
            <>
              <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                Administración
              </p>
              {ADMIN_ITEMS.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(item.href)}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </>
          )}
        </nav>
        <div className="border-t border-stone-200 px-5 py-3">
          <p className="text-[10px] text-stone-400">Gestor de Trámites v0.1</p>
        </div>
      </aside>
    </>
  )
}

function SidebarLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string
  label: string
  icon: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
        active
          ? "bg-face font-medium text-white"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      <span className={`text-xs ${active ? "text-white" : "text-stone-400"}`}>{icon}</span>
      {label}
    </Link>
  )
}
