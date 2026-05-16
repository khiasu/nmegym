"use client";
// src/app/auth/register/JoinForm.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";

export default function JoinForm({ settings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!screenshotUrl) {
      setError("Please upload your payment screenshot");
      return;
    }
    
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.screenshotUrl = screenshotUrl;

    try {
      const res = await fetch("/api/auth/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        router.push("/auth/register/success");
      } else {
        setError(result.error || "Submission failed");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <img src={settings?.logoUrl || "/newlogo.png"} alt={settings?.gymName || "NME GYM"} />
        </div>

        <h1 className="auth-title">Join {settings?.gymName || "NME GYM"}</h1>
        <p className="auth-subtitle">Pay fees via UPI and upload screenshot to get your Member ID.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            <div className="auth-field">
              <label>First Name</label>
              <input name="firstName" type="text" placeholder="John" required />
            </div>
            <div className="auth-field">
              <label>Last Name</label>
              <input name="lastName" type="text" placeholder="Doe" required />
            </div>
          </div>

          <div className="auth-field">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="john@example.com" required />
          </div>

          <div className="auth-field">
            <label>Phone Number</label>
            <input name="phone" type="tel" placeholder="+91 XXXXX XXXXX" required />
          </div>

          <div className="auth-field">
            <label>Select Plan</label>
            <select name="plan" required>
              <option value="MONTHLY">Monthly — ₹999</option>
              <option value="3_MONTHS">3 Months — ₹2,499</option>
              <option value="6_MONTHS">6 Months — ₹4,499</option>
              <option value="ANNUAL">1 Year — ₹7,999</option>
            </select>
          </div>

          <div className="payment-guide" style={{ background: "#1a1a1a", padding: 15, borderRadius: 8, margin: "10px 0" }}>
            <p style={{ fontSize: 12, margin: 0 }}>Pay to UPI ID: <strong style={{ color: "white" }}>{settings?.upiId || "nmegym@upi"}</strong></p>
            <p style={{ fontSize: 11, color: "#888", marginTop: 5 }}>After payment, upload the screenshot below.</p>
          </div>

          <div className="auth-field">
            <label>Payment Screenshot</label>
            {!screenshotUrl ? (
              <CldUploadWidget 
                uploadPreset="nmegym_preset"
                onSuccess={(result) => setScreenshotUrl(result.info.secure_url)}
              >
                {({ open }) => (
                  <button type="button" className="btn-upload" onClick={() => open()} style={{ width: "100%", padding: 12, background: "#333", color: "white", border: "1px dashed #555", borderRadius: 6, cursor: "pointer" }}>
                    Upload Screenshot
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <div style={{ color: "#00ff64", fontSize: 14, textAlign: "center", padding: 10, border: "1px solid #00ff64", borderRadius: 6 }}>
                ✓ Screenshot Uploaded
              </div>
            )}
          </div>

          <div className="auth-field" style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10 }}>
            <input 
              type="checkbox" 
              id="terms" 
              required 
              style={{ width: "auto", marginTop: 4, cursor: "pointer" }}
            />
            <label htmlFor="terms" style={{ fontSize: 13, color: "#888", cursor: "pointer", userSelect: "none" }}>
              I agree to the <Link href="/legal" target="_blank" style={{ color: "var(--red)", textDecoration: "underline" }}>Terms and Conditions</Link> and <Link href="/legal" target="_blank" style={{ color: "var(--red)", textDecoration: "underline" }}>Refund Policy</Link> of {settings?.gymName || "NME GYM"}.
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? "Submitting..." : "Submit Join Request →"}
          </button>
        </form>

        <p className="auth-note">
          Already a member? <Link href="/auth/login" style={{ color: "var(--red)" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
