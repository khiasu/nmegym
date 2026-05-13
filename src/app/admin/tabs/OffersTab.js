// src/app/admin/tabs/OffersTab.js
"use client";

import { useState } from "react";

export default function OffersTab({ initialOffers }) {
  const [offers, setOffers] = useState(initialOffers);
  const [editing, setEditing] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.isActive = formData.get("isActive") === "on";
    if (data.discount) data.discount = parseInt(data.discount);

    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: editing?.id }),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editing?.id) setOffers(offers.map(o => o.id === saved.id ? saved : o));
        else setOffers([saved, ...offers]);
        setEditing(null);
      }
    } catch (err) { alert("Error saving offer."); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete offer?")) return;
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
      if (res.ok) setOffers(offers.filter(o => o.id !== id));
    } catch (err) { alert("Error deleting offer."); }
  }

  return (
    <div className="admin-tab-content active">
      <div className="admin-section-card-header">
        <div>
          <h2 className="admin-page-title">PROMO OFFERS</h2>
          <p className="admin-page-sub">Manage the red banner badges shown on the homepage.</p>
        </div>
        <button className="admin-btn-sm" onClick={() => setEditing({ isActive: true })}>+ NEW OFFER</button>
      </div>

      <div className="admin-section-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Offer Title</th>
              <th>Badge</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id}>
                <td><strong>{o.title}</strong></td>
                <td><span className="pb-tag">{o.badge}</span></td>
                <td>
                  <span className={`status-badge ${o.isActive ? "status-active" : "status-expired"}`}>
                    {o.isActive ? "VISIBLE" : "HIDDEN"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button className="admin-btn-sm outline" onClick={() => setEditing(o)}>EDIT</button>
                    <button className="admin-btn-sm outline" style={{ color: "var(--red)" }} onClick={() => handleDelete(o.id)}>DEL</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: "400px" }}>
            <header className="modal-header">
              <h3>{editing.id ? "EDIT OFFER" : "NEW OFFER"}</h3>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </header>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="admin-form-group">
                  <label className="admin-label">TITLE</label>
                  <input name="title" defaultValue={editing.title} className="admin-input" required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">BADGE TEXT</label>
                  <input name="badge" defaultValue={editing.badge} className="admin-input" required />
                </div>
                <div className="admin-form-group" style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
                  <input type="checkbox" name="isActive" defaultChecked={editing.isActive} id="isActive" />
                  <label htmlFor="isActive" style={{ margin: 0, fontSize: "11px", letterSpacing: "1px", color: "white" }}>ACTIVE ON SITE</label>
                </div>
                <button type="submit" className="admin-btn-sm" style={{ width: "100%", padding: "12px", marginTop: "10px" }}>SAVE OFFER</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
