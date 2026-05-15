// src/app/admin/tabs/PlansTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlansTab({ initialPlans, requestConfirmation, executeWithUndo }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans || []);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!editing.name || !editing.price) return alert("Name and Price are required.");
    
    setSaving(true);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        const saved = await res.json();
        if (editing.id) setPlans(plans.map(p => p.id === saved.id ? saved : p));
        else setPlans([...plans, saved]);
        router.refresh();
        setEditing(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save plan.");
      }
    } catch (err) { 
      alert("Error saving plan."); 
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-tab-content active">
      <div className="admin-section-card-header">
        <div>
          <h2 className="admin-page-title">MEMBERSHIP PLANS</h2>
          <p className="admin-page-sub">Adjust the pricing and features of NME GYM packages.</p>
        </div>
        <button className="admin-btn-sm" onClick={() => setEditing({ name: "", price: 0, period: "month", badge: "" })}>+ NEW PLAN</button>
      </div>

      <div className="admin-section-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Badge</th>
              <th>Price</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name.toUpperCase()}</strong></td>
                <td><span className="status-badge" style={{background: "rgba(255,255,255,0.05)", color: "white"}}>{p.badge || "—"}</span></td>
                <td><span style={{ color: "var(--red)", fontWeight: 800, fontSize: "16px" }}>₹{p.price}</span></td>
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
                  <label className="admin-label">NAME (DURATION)</label>
                  <input 
                    name="name" 
                    value={editing.name} 
                    onChange={e => setEditing({...editing, name: e.target.value})}
                    className="admin-input" 
                    placeholder="e.g. 3 Months"
                    required 
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">BADGE (LABEL)</label>
                  <input 
                    name="badge" 
                    value={editing.badge || ""} 
                    onChange={e => setEditing({...editing, badge: e.target.value})}
                    className="admin-input" 
                    placeholder="e.g. BEST VALUE" 
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">PRICE (₹)</label>
                  <input 
                    name="price" 
                    type="number" 
                    value={editing.price} 
                    onChange={e => setEditing({...editing, price: parseInt(e.target.value) || 0})}
                    className="admin-input" 
                    required 
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">PERIOD (SUBTEXT)</label>
                  <input 
                    name="period" 
                    value={editing.period} 
                    onChange={e => setEditing({...editing, period: e.target.value})}
                    className="admin-input" 
                    placeholder="e.g. per month"
                    required 
                  />
                </div>
                <button type="submit" className="admin-btn-sm" disabled={saving} style={{ width: "100%", padding: "12px", marginTop: "10px" }}>
                  {saving ? "SAVING..." : "SAVE PLAN"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
