import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ToastProvider } from "@/components/ui/toast"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Gestor de Trámites",
  description: "Sistema de gestión inteligente de trámites académicos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var t = localStorage.getItem("theme");
              if (t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                document.documentElement.classList.add("dark");
              }
            })();
          `
        }} />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
