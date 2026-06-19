import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthProvider } from "@/components/session-provider"
import { ToastProvider } from "@/components/ui/toast"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/")

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar role={session.user.role} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header user={session.user} />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </AuthProvider>
  )
}
