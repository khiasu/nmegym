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
        <div className="modal-header" style={{ flexDirection: "column", gap: "15px", alignItems: "center", paddingBottom: "25px" }}>
          <img src="/newlogo.png" alt="NME GYM" style={{ height: "45px", objectFit: "contain" }} />
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>BOOK FREE TRIAL</h3>
            <button className="modal-close" onClick={onClose} style={{ position: "relative", top: 0, right: 0 }}>✕</button>
          </div>
        </div>
        
        {success ? (
          <div className="modal-body" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔥</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", letterSpacing: "2px" }}>BOOKING CONFIRMED</h3>
            <p style={{ color: "var(--gray)", marginTop: "10px" }}>
              We'll see you at the gym! Our team might reach out to confirm your timing.
            </p>
            <button className="btn-primary" onClick={onClose} style={{ marginTop: "24px" }}>CLOSE</button>
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
