"use client";

export default function AlertModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100000
    }}>
      <div className="elite-card" style={{
        padding: "20px",
        width: "90%",
        maxWidth: "320px",
        textAlign: "center",
        animation: "slideDownFade 0.2s ease-out forwards",
        margin: 0
      }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "var(--elite-red)", marginBottom: "10px", letterSpacing: "1px" }}>
          NOTICE
        </h3>
        
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", marginBottom: "20px", lineHeight: "1.4" }}>
          {message}
        </p>

        <button 
          className="admin-btn-sm outline" 
          style={{ width: "100%" }} 
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
