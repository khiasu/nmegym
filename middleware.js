// middleware.js — Route protection using NextAuth v5
// Runs on the Edge before every matched request

import { auth } from "./src/auth";
import { NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

// Routes that require ADMIN role
const ADMIN_PREFIXES = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

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
  if (session && session.user?.role !== "ADMIN") {
    const isAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

// Match everything except static files, API routes, and Next.js internals
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api/).*)",
  ],
};
