import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthProvider } from "@/components/session-provider"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar role={session.user.role} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={session.user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}
