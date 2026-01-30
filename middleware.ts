import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ============================================
// RATE LIMITING (In-memory for Edge Runtime)
// ============================================
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, endpoint: string, maxRequests: number, windowMs: number) {
  const key = `${endpoint}:${ip}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  // Cleanup old entries periodically
  if (rateLimitStore.size > 5000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
  }

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(key, record);
    return { allowed: true, remaining: maxRequests - 1 };
  }

  record.count++;
  rateLimitStore.set(key, record);

  if (record.count > maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  return { allowed: true, remaining: maxRequests - record.count };
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const ip = getClientIp(req);

  // ============================================
  // RATE LIMITING for Sensitive Endpoints
  // ============================================

  // Auth endpoints - strict rate limiting
  if (path.startsWith('/api/auth')) {
    const limit = checkRateLimit(ip, 'auth', 20, 60 * 1000); // 20 requests per minute
    if (!limit.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      );
    }
  }

  // Signup - very strict
  if (path === '/api/auth/signup' || path === '/signup') {
    const limit = checkRateLimit(ip, 'signup', 5, 60 * 60 * 1000); // 5 per hour
    if (!limit.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many signup attempts. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // API routes - moderate rate limiting
  if (path.startsWith('/api/') && !path.startsWith('/api/auth')) {
    const limit = checkRateLimit(ip, 'api', 100, 60 * 1000); // 100 per minute
    if (!limit.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded. Please slow down.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // ============================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ✅ Protected zones
  const isProtected =
    (path === "/home" ||
      path.startsWith("/dashboard") ||
      path.startsWith("/admin") ||
      path.startsWith("/business") ||
      path.startsWith("/profile")) &&
    path !== "/business/about";

  // ✅ Not logged in -> redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Admin only
  if (path.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ Business only (ADMIN also allowed)
  if (path.startsWith("/business") && path !== "/business/about" && token?.role !== "BUSINESS" && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ If BUSINESS user hits /dashboard -> redirect to business dashboard
  if (path.startsWith("/dashboard") && token?.role === "BUSINESS") {
    return NextResponse.redirect(new URL("/business/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/dashboard/:path*",
    "/admin/:path*",
    "/business/:path*",
    "/profile/:path*",
    "/api/:path*",  // Add API routes for rate limiting
    "/signup",
    "/login",
  ],
};
