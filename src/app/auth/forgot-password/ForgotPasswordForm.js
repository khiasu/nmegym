"use client";
// src/app/auth/forgot-password/ForgotPasswordForm.js

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm({ settings }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password reset instructions sent to your email.");
      } else {
        setError(data.error || "Something went wrong");
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
          <img src={settings?.logoUrl || "/newlogo.png"} alt={settings?.gymName || "NME GYM"} />
        </div>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Enter your email and we'll send you instructions to reset your password.</p>
        
        {message && <div style={{ background: "rgba(0,255,100,0.1)", border: "1px solid rgba(0,255,100,0.3)", color: "#00ff64", padding: 12, borderRadius: 8, width: "100%", textAlign: "center", fontSize: 14 }}>{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              required 
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link →"}
          </button>
        </form>

        <p className="auth-note">
          Remembered? <Link href="/auth/login" style={{ color: "var(--red)" }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
