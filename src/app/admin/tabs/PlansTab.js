// src/app/admin/tabs/PlansTab.js
"use client";

import { useState } from "react";

export default function PlansTab({ initialPlans }) {
  const [plans, setPlans] = useState(initialPlans);
  const [editing, setEditing] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.price = parseInt(data.price);

    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: editing?.id }),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editing?.id) setPlans(plans.map(p => p.id === saved.id ? saved : p));
        else setPlans([...plans, saved]);
        setEditing(null);
      }
    } catch (err) { alert("Error saving plan."); }
  }

  return (
    <div className="admin-tab-content active">
      <div className="admin-section-card-header">
        <div>
          <h2 className="admin-page-title">MEMBERSHIP PLANS</h2>
          <p className="admin-page-sub">Adjust the pricing and features of NME GYM packages.</p>
        </div>
        <button className="admin-btn-sm" onClick={() => setEditing({})}>+ NEW PLAN</button>
      </div>

      <div className="admin-section-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Price</th>
              <th>Features</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name.toUpperCase()}</strong></td>
                <td><span style={{ color: "var(--red)", fontWeight: 800, fontSize: "16px" }}>₹{p.price}</span></td>
                <td style={{ fontSize: "11px", color: "var(--gray)", maxWidth: "300px" }}>{p.features}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="admin-btn-sm outline" onClick={() => setEditing(p)}>EDIT</button>
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
              <h3>{editing.id ? "EDIT PLAN" : "NEW PLAN"}</h3>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </header>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="admin-form-group">
                  <label className="admin-label">NAME</label>
                  <input name="name" defaultValue={editing.name} className="admin-input" required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">PRICE (₹)</label>
                  <input name="price" type="number" defaultValue={editing.price} className="admin-input" required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">PERIOD (TAG)</label>
                  <input name="period" defaultValue={editing.period} className="admin-input" required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">FEATURES (COMMA SEP)</label>
                  <textarea name="features" defaultValue={editing.features} className="admin-input" rows="3" />
                </div>
                <button type="submit" className="admin-btn-sm" style={{ width: "100%", padding: "12px", marginTop: "10px" }}>SAVE PLAN</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
