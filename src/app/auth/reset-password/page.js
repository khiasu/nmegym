// src/app/auth/reset-password/page.js
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const password = e.currentTarget.password.value;
    const confirmPassword = e.currentTarget.confirmPassword.value;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <div className="auth-page"><div className="auth-card">Invalid Link</div></div>;
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/newlogo.png" alt="NME GYM" />
        </div>

        <h1 className="auth-title">Set New Password</h1>
        
        {success ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#00ff64", marginBottom: 20 }}>✓ Password updated successfully!</p>
            <Link href="/auth/login" className="auth-btn" style={{ display: "block", textDecoration: "none" }}>Sign In Now</Link>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">Create a new secure password for your account.</p>
            {error && <div className="auth-error">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>New Password</label>
                <input name="password" type="password" placeholder="Min. 8 characters" required minLength={8} />
              </div>
              <div className="auth-field">
                <label>Confirm Password</label>
                <input name="confirmPassword" type="password" placeholder="Repeat password" required />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Password →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
