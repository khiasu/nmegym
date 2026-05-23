"use client";

import { useEffect, useState, useRef } from "react";

export default function ToastNotification({ message, onUndo, onClose, duration = 10000 }) {
  const [progress, setProgress] = useState(100);
  const onCloseRef = useRef(onClose);

  // Keep ref up to date with the latest onClose callback
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!message) return;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onCloseRef.current();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [message, duration]);

  if (!message) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "30px",
      right: "30px",
      background: "rgba(10, 10, 10, 0.95)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      padding: "15px 20px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      zIndex: 100001,
      animation: "slideUpFade 0.3s cubic-bezier(0.19, 1, 0.22, 1) forwards",
      overflow: "hidden"
    }}>
      <span style={{ color: "#fff", fontSize: "14px", fontFamily: "var(--font-inter)", fontWeight: "500" }}>
        {message}
      </span>
      
      {onUndo && (
        <button 
          onClick={onUndo}
          style={{
            background: "transparent",
            border: "1px solid var(--elite-red)",
            color: "var(--elite-red)",
            padding: "4px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: "1px",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => { e.target.style.background = "var(--elite-red)"; e.target.style.color = "#fff"; }}
          onMouseOut={(e) => { e.target.style.background = "transparent"; e.target.style.color = "var(--elite-red)"; }}
        >
          UNDO
        </button>
      )}

      {/* Progress Bar */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: "2px",
        background: "var(--elite-red)",
        width: `${progress}%`,
        transition: "width 50ms linear"
      }}></div>
    </div>
  );
}
