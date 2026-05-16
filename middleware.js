// middleware.js
import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Match everything except static files, images, and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
