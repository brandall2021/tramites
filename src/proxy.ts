import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function proxy(request: Request) {
  const session = await auth()
  const { pathname } = new URL(request.url)

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/solicitudes") || pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (pathname.startsWith("/admin") && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}
