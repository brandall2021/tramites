import Link from "next/link"

export function Sidebar({ role }: { role: string }) {
  return (
    <aside className="flex w-56 flex-col border-r border-stone-200 bg-white">
      <div className="flex h-14 items-center border-b border-stone-200 px-5">
        <Link href="/dashboard" className="text-sm font-bold tracking-tight">
          Gestor Trámites
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        <SidebarLink href="/dashboard" label="Dashboard" />
        <SidebarLink href="/crm" label="CRM" />
        <SidebarLink href="/solicitudes" label="Solicitudes" />
        {role === "ADMIN" && (
          <>
            <SidebarLink href="/admin/solicitudes" label="Todas las solicitudes" />
            <SidebarLink href="/admin/cuentas-email" label="Cuentas Email" />
            <SidebarLink href="/admin/usuarios" label="Usuarios" />
          </>
        )}
      </nav>
    </aside>
  )
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
    >
      {label}
    </Link>
  )
}
