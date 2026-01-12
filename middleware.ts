import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // ✅ zones protégées
  const isProtected =
    path === "/home" ||
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/business") ||
    path.startsWith("/profile");

  // ✅ pas connecté -> login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ admin only
  if (path.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ business only (ADMIN autorisé)
  if (path.startsWith("/business") && token?.role !== "BUSINESS" && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ si BUSINESS tape /dashboard -> business dashboard
  if (path.startsWith("/dashboard") && token?.role === "BUSINESS") {
    return NextResponse.redirect(new URL("/business/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/dashboard/:path*", "/admin/:path*", "/business/:path*", "/profile/:path*"],
};
