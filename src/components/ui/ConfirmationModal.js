"use client";

import { useState } from "react";

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  isCritical, 
  onConfirm, 
  onCancel, 
  loading 
}) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isCritical && !password) {
      alert("Admin password is required for this operation.");
      return;
    }
    onConfirm(password);
    setPassword("");
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 99999
    }}>
      <div className="elite-card" style={{
        padding: "20px",
        width: "90%",
        maxWidth: "350px",
        textAlign: "center",
        animation: "slideDownFade 0.2s ease-out forwards",
        margin: 0
      }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "var(--elite-red)", marginBottom: "10px", letterSpacing: "1px" }}>
          {title || "CONFIRM ACTION"}
        </h3>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginBottom: "20px", lineHeight: "1.4" }}>
          {message || "Are you sure you want to proceed?"}
        </p>

        {isCritical && (
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "10px", color: "var(--elite-red)", marginBottom: "5px", textAlign: "left" }}>
              AUTHORIZATION REQUIRED (ADMIN PASSWORD)
            </label>
            <input 
              type="password" 
              className="admin-input" 
              placeholder="Enter Admin Password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", borderColor: "var(--elite-red)" }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            className="admin-btn-sm outline" 
            style={{ flex: 1, borderColor: "rgba(255,255,255,0.2)", color: "#fff" }} 
            onClick={onCancel}
            disabled={loading}
          >
            CANCEL
          </button>
          <button 
            className="admin-btn-sm" 
            style={{ flex: 1, background: "var(--elite-red)", borderColor: "var(--elite-red)" }} 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "PROCESSING..." : "CONFIRM"}
          </button>
        </div>
      </div>
    </div>
  );
}
