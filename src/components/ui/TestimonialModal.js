"use client";
import { useState } from "react";

export default function TestimonialModal({ isOpen, onClose }) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, rating }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setContent("");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay open`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>SHARE YOUR STORY</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ color: 'var(--red)', fontSize: '48px', marginBottom: '10px' }}>✓</div>
              <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '24px' }}>SUBMITTED!</h4>
              <p style={{ color: 'var(--gray)', fontSize: '14px', marginTop: '10px' }}>Your review is waiting for moderation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>YOUR EXPERIENCE</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tell us how NME Gym changed your life..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ width: '100%', background: 'var(--black)', border: '1px solid var(--border)', color: 'white', padding: '12px' }}
                />
              </div>
              <div className="form-group">
                <label>RATING</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)}
                  style={{ width: '100%', background: 'var(--black)', border: '1px solid var(--border)', color: 'white', padding: '12px' }}
                >
                  <option value="5">5 Stars (Excellent)</option>
                  <option value="4">4 Stars (Great)</option>
                  <option value="3">3 Stars (Good)</option>
                  <option value="2">2 Stars (Fair)</option>
                  <option value="1">1 Star (Poor)</option>
                </select>
              </div>
              {error && <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '10px' }}>{error}</p>}
              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "SUBMITTING..." : "POST TESTIMONIAL"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
