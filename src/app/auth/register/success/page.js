"use client";
// src/app/auth/register/success/page.js

import { useState, useEffect } from "react";
import Link from "next/link";

export default function JoinSuccessPage() {
  const [waUrl, setWaUrl] = useState(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const url = localStorage.getItem("nme_pending_whatsapp_url");
    if (url) {
      setWaUrl(url);
    } else {
      setClicked(true);
    }
  }, []);

  const handleWaClick = () => {
    localStorage.removeItem("nme_pending_whatsapp_url");
    setClicked(true);
    window.open(waUrl, "_blank");
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: "center", padding: 40, maxWidth: 500 }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
        <h1 className="auth-title">Request Submitted!</h1>
        <p className="auth-subtitle">
          Your payment screenshot has been sent for verification.
        </p>
        
        {waUrl && !clicked ? (
          <div style={{ background: "rgba(37,211,102,0.1)", border: "1px dashed #25D366", padding: 25, borderRadius: 12, margin: "30px 0", textAlign: "center" }}>
            <h3 style={{ fontSize: 16, marginBottom: 10, color: "white" }}>⚠️ Action Required</h3>
            <p style={{ fontSize: 13, color: "#ccc", marginBottom: 20 }}>
              To complete your registration, you must notify the admin via WhatsApp. Click the button below to send your details.
            </p>
            <button 
              onClick={handleWaClick}
              style={{
                display: 'inline-block',
                background: '#25D366',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(37,211,102,0.3)',
                width: '100%'
              }}
            >
              💬 Notify Admin via WhatsApp
            </button>
          </div>
        ) : (
          <>
            <div style={{ background: "#111", border: "1px solid #222", padding: 25, borderRadius: 12, margin: "30px 0", textAlign: "left" }}>
              <h3 style={{ fontSize: 16, marginBottom: 10, color: "white" }}>What happens next?</h3>
              <ol style={{ fontSize: 14, color: "#888", paddingLeft: 20, lineHeight: 1.8 }}>
                <li>Admin will manually verify your payment screenshot.</li>
                <li>Once verified, an account will be created for you.</li>
                <li>You will receive your <strong>Member ID</strong> and <strong>Temporary Password</strong> via email.</li>
                <li>Check your inbox (and spam folder) within the next 12-24 hours.</li>
              </ol>
            </div>

            <Link href="/" className="btn-primary" style={{ display: "inline-block", textDecoration: "none", width: '100%', textAlign: 'center' }}>
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
