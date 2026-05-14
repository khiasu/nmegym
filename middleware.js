// middleware.js — Route protection using extremely lightweight next-auth/jwt
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

// Routes that require ADMIN role
const ADMIN_PREFIXES = ["/admin"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Use getToken instead of NextAuth() to avoid Vercel Edge 1MB limit
  const session = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET 
  });

  // Not logged in — trying to access a protected route
  if (!session) {
    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    if (isProtected) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Logged in but not admin — trying to access admin routes
  if (session && session.role !== "ADMIN") {
    const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

// Match everything except static files, API routes, and Next.js internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/).*)",
  ],
};
