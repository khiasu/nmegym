// src/app/auth/login/page.js
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const settings = await prisma.settings.findFirst();
  
  return (
    <div className="auth-page">
      <Suspense fallback={<div className="auth-card">Loading...</div>}>
        <LoginForm settings={settings} />
      </Suspense>
    </div>
  );
}
