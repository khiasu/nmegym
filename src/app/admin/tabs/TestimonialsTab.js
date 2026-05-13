"use client";
import { useState, useEffect } from "react";

export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTestis = async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (Array.isArray(data)) setTestimonials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestis();
  }, []);

  const togglePublic = async (id, current) => {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !current }),
    });
    fetchTestis();
  };

  const deleteTesti = async (id) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    fetchTestis();
  };

  if (loading) return <div className="admin-page-sub">Loading reviews...</div>;

  return (
    <div className="admin-tab-content active">
      <h3 className="admin-page-title">MEMBER REVIEWS</h3>
      <p className="admin-page-sub">Review and moderate testimonials submitted by gym members.</p>
      
      <div className="admin-section-card" style={{ marginTop: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Review Content</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No member reviews yet.</td></tr>
              ) : (
                testimonials.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 'bold' }}>{t.user.firstName} {t.user.lastName}</td>
                    <td style={{ maxWidth: '400px', whiteSpace: 'normal', lineHeight: '1.4' }}>"{t.content}"</td>
                    <td style={{ color: 'var(--red)' }}>{t.rating}★</td>
                    <td>
                      <span className={`status-badge ${t.isPublic ? 'status-active' : 'status-pending'}`}>
                        {t.isPublic ? 'PUBLIC' : 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="admin-btn-sm" 
                          onClick={() => togglePublic(t.id, t.isPublic)}
                          style={{ background: t.isPublic ? '#444' : 'var(--red)' }}
                        >
                          {t.isPublic ? 'HIDE' : 'APPROVE'}
                        </button>
                        <button className="admin-btn-sm outline" onClick={() => deleteTesti(t.id)}>DELETE</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
