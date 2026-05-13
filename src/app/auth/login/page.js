"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setFormError("Invalid email or password");
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setFormError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <img src="/newlogo.png" alt="NME GYM" />
      </div>

      <h1 className="auth-title">Member Sign In</h1>
      <p className="auth-subtitle">Enter your credentials to access your dashboard.</p>

      {(formError || error) && (
        <div className="auth-error">
          {formError || (error === "CredentialsSignin" ? "Invalid email or password" : "Authentication failed")}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
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
          {loading ? "Signing in..." : "Sign In →"}
        </button>
      </form>

      <p className="auth-note">
        Don't have an account?{" "}
        <Link href="/auth/register" style={{ color: "var(--red)", fontWeight: 600 }}>
          Register Now
        </Link>
      </p>
      
      <p className="auth-note" style={{ marginTop: 10 }}>
        <Link href="/" className="gray">← Back to Home</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <Suspense fallback={<div className="auth-card">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
