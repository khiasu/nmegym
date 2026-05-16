"use client";
// src/app/auth/login/LoginForm.js

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm({ settings }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const isAdmin = callbackUrl.includes("/admin");
  const error = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      // Safety timeout: if login takes > 8s, reset the button so user can try again
      const timer = setTimeout(() => {
        setLoading(false);
        setFormError("Verification is taking longer than expected. Please check your connection and try again.");
      }, 8000);

      // Use redirect: true (default) to let next-auth handle the redirect robustly
      await signIn("credentials", {
        email,
        password,
        callbackUrl,
      });
      
      clearTimeout(timer);
      // Note: With redirect: true, this code may not be reached if successful
    } catch (err) {
      console.error("Login error:", err);
      setFormError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <img src={settings?.logoUrl || "/newlogo.png"} alt={settings?.gymName || "NME GYM"} />
      </div>

      <h1 className="auth-title">{isAdmin ? "Admin Access" : "Member Sign In"}</h1>
      <p className="auth-subtitle">
        {isAdmin ? "NME GYM Restricted Access Portal" : "Enter your credentials to access your dashboard."}
      </p>

      {(formError || error) && (
        <div className="auth-error">
          {formError || (error === "CredentialsSignin" ? "Invalid email or password" : "Authentication failed")}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email">{isAdmin ? "Admin Email / ID" : "Email Address"}</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder={isAdmin ? "admin@nmegym.in" : "you@example.com"}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="auth-field" style={{ textAlign: "right", marginTop: -10, marginBottom: 15 }}>
          <Link href="/auth/forgot-password" style={{ fontSize: 13, color: "#888" }}>
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Verifying..." : isAdmin ? "Access Portal →" : "Sign In →"}
        </button>
      </form>

      {!isAdmin && (
        <p className="auth-note">
          Don't have an account?{" "}
          <Link href="/auth/register" style={{ color: "var(--red)", fontWeight: 600 }}>
            Register Now
          </Link>
        </p>
      )}
      
      <p className="auth-note" style={{ marginTop: 10 }}>
        <Link href="/" className="gray">← Back to Home</Link>
      </p>
    </div>
  );
}
