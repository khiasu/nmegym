// src/app/admin/tabs/PlansTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlansTab({ initialPlans, settings, setSettings, requestConfirmation, executeWithUndo, showToast }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans || []);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSaveAdmissionFee() {
    executeWithUndo({
      message: "Admission fee updated. Syncing in 7s...",
      executeFunction: async () => {
        try {
          const res = await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
          });
          if (res.ok) router.refresh();
        } catch (err) { showToast("Sync failed."); }
      },
      revertUI: () => {
        // No local state change needed here as we just want to show the toast
      }
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!editing.name || !editing.price) return showToast("Name and Price are required.");
    
    executeWithUndo({
      message: editing.id ? "Plan changes saved. Updating database in 7s..." : "New plan created. Syncing in 7s...",
      executeFunction: async () => {
        try {
          const res = await fetch("/api/admin/plans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editing),
          });
          if (res.ok) router.refresh();
        } catch (err) { showToast("Database sync failed."); }
      },
      revertUI: () => {
        // Optimistic UI
        if (editing.id) setPlans(plans.map(p => p.id === editing.id ? editing : p));
        else setPlans([...plans, { ...editing, id: 'temp-' + Date.now() }]);
        setEditing(null);
      }
    });
  }

  async function handleDelete(id) {
    const planToRemove = plans.find(p => p.id === id);
    requestConfirmation({
      title: "DELETE PLAN",
      message: "Are you sure you want to remove this membership plan?",
      onConfirm: async () => {
        executeWithUndo({
          message: "Plan removed. Deleting from database in 7s...",
          executeFunction: async () => {
             await fetch(`/api/admin/plans?id=${id}`, { method: "DELETE" });
             router.refresh();
          },
          revertUI: () => {
            setPlans(plans.filter(p => p.id !== id));
          }
        });
      }
    });
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

      <div className="admin-section-card" style={{ marginBottom: '25px', borderLeft: '4px solid var(--red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <label className="admin-label" style={{ marginBottom: '5px', display: 'block' }}>ONE-TIME ADMISSION FEE (₹)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                className="admin-input" 
                value={settings.admissionFee || 1000} 
                onChange={(e) => setSettings({...settings, admissionFee: parseInt(e.target.value) || 0})}
                style={{ maxWidth: '200px', margin: 0 }}
              />
              <button className="admin-btn-sm" onClick={handleSaveAdmissionFee}>UPDATE FEE</button>
            </div>
          </div>
          <div style={{ flex: 2, background: 'rgba(255,255,255,0.03)', padding: '12px 15px', borderRadius: '6px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: '#888', lineHeight: '1.4' }}>
              <strong style={{ color: 'var(--red)' }}>NOTE:</strong> This fee is automatically added to the total for all new member registrations. It does not affect plan renewals for existing members.
            </p>
          </div>
        </div>
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
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button className="admin-btn-sm outline" onClick={() => setEditing(p)}>EDIT</button>
                    <button className="admin-btn-sm outline" style={{ color: "var(--red)" }} onClick={() => handleDelete(p.id)}>DEL</button>
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
