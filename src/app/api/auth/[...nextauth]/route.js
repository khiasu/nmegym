// src/app/api/auth/[...nextauth]/route.js
// NextAuth v5 catch-all route handler for App Router
// This single file handles all /api/auth/* requests (signin, callback, signout, etc.)

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
