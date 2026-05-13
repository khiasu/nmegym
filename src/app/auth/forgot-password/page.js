// src/app/auth/forgot-password/page.js
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = e.currentTarget.email.value;

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send reset link");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/newlogo.png" alt="NME GYM" />
        </div>

        <h1 className="auth-title">Reset Password</h1>
        
        {success ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#00ff64", marginBottom: 20 }}>✓ Check your email for a password reset link.</p>
            <Link href="/auth/login" className="auth-btn" style={{ display: "block", textDecoration: "none" }}>Back to Login</Link>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">Enter your email and we'll send you a link to reset your password.</p>
            {error && <div className="auth-error">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>Email Address</label>
                <input name="email" type="email" placeholder="you@example.com" required />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>
            </form>
          </>
        )}

        <p className="auth-note" style={{ marginTop: 20 }}>
          <Link href="/auth/login" className="gray">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
