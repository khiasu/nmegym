// src/components/ui/BookingModal.js
"use client";

import { useState } from "react";

export default function BookingModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Error submitting booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay open" id="bookingModal">
      <div className="modal">
        <div className="modal-header" style={{ flexDirection: "column", gap: "10px", alignItems: "center", padding: "30px 20px 20px 20px", background: "#0a0a0a", borderBottom: "1px solid #222" }}>
          <img src="/newlogo.png" alt="NME GYM" style={{ height: "40px", objectFit: "contain", marginBottom: "5px" }} />
          <div style={{ display: "flex", width: "100%", justifyContent: "center", position: "relative" }}>
            <h3 style={{ margin: 0, fontSize: "20px", letterSpacing: "1px", color: "#888" }}>TRIAL BOOKING</h3>
            <button className="modal-close" onClick={onClose} style={{ position: "absolute", top: "-5px", right: "0", background: "none", border: "none", color: "#666", fontSize: "20px" }}>✕</button>
          </div>
        </div>
        
        {success ? (
          <div className="modal-body" style={{ textAlign: "center", padding: "40px 30px", background: "#111" }}>
            <div style={{ 
              display: "inline-block",
              padding: "6px 20px",
              border: "1px solid var(--red)",
              borderRadius: "50px", // Rounded rectangle
              color: "var(--red)",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
              marginBottom: "24px",
              fontFamily: "'Barlow Condensed', sans-serif"
            }}>SUCCESS</div>

            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", letterSpacing: "3px", margin: "0 0 10px 0", color: "white" }}>
              BOOKING <span className="red">CONFIRMED</span>
            </h3>
            <div style={{ width: "30px", height: "2px", background: "var(--red)", margin: "0 auto 24px auto" }}></div>
            
            <p style={{ color: "#888", fontSize: "14px", lineHeight: "1.6", maxWidth: "280px", margin: "0 auto" }}>
              Your trial session is scheduled. We'll reach out shortly to finalize your elite experience.
            </p>

            <button 
              onClick={onClose} 
              style={{ 
                marginTop: "35px", 
                width: "100%", 
                padding: "16px",
                background: "var(--red)",
                color: "white",
                border: "none",
                borderRadius: "8px", // Simple rounded rectangle
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "18px",
                letterSpacing: "2px",
                cursor: "pointer",
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              DISMISS
            </button>
          </div>
        ) : (
          <form className="modal-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" placeholder="Your name" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" required />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" placeholder="Your age" required />
              </div>
            </div>
            <div className="form-group">
              <label>Interested In</label>
              <select name="interest" required>
                <option>Weight Training</option>
                <option>Powerlifting</option>
                <option>Functional Fitness</option>
                <option>Cardio & Endurance</option>
                <option>Personal Training</option>
                <option>General Fitness</option>
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Date</label>
              <input type="date" name="preferredDate" required />
            </div>
            <div className="form-group">
              <label>Preferred Time Slot</label>
              <select name="preferredTimeSlot" required>
                <option>Morning (6 AM — 9 AM)</option>
                <option>Mid-Morning (9 AM — 12 PM)</option>
                <option>Evening (5 PM — 8 PM)</option>
                <option>Night (8 PM — 10 PM)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Message (Optional)</label>
              <textarea name="message" rows="3" placeholder="Any specific goals or questions?"></textarea>
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", border: "none" }}>
              {loading ? "PROCESSING..." : "CONFIRM BOOKING →"}
            </button>
            
            <p style={{ textAlign: "center", fontSize: "12px", color: "var(--gray)", marginTop: "14px" }}>
              Or WhatsApp: <a href="https://wa.me/917005310568" target="_blank" rel="noopener noreferrer" style={{ color: "var(--red)" }}>+91 70053 10568</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
