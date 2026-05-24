// src/app/auth/error/page.js — Auth Error Page

export const metadata = {
  title: "Sign In Error — NME GYM",
};

import prisma from "@/lib/prisma";

const ERROR_MESSAGES = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign-in link has expired or already been used. Please request a new one.",
  Default: "An unexpected error occurred. Please try again.",
};

export default async function AuthErrorPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error ?? "Default";
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  // Fetch settings dynamically
  const settings = await prisma.settings.findFirst().catch(() => null);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src={settings?.logoUrl || "/newlogo.png"} alt="NME GYM" />
        </div>

        <div className="auth-error-icon">⚠️</div>
        <h1 className="auth-title">Sign In Error</h1>
        <p className="auth-subtitle">{message}</p>

        <a href="/auth/login" className="auth-btn" style={{ textDecoration: "none", textAlign: "center" }}>
          Try Again
        </a>
      </div>
    </div>
  );
}
