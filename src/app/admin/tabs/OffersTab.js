// src/app/admin/tabs/OffersTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OffersTab({ initialOffers, requestConfirmation, executeWithUndo, showToast }) {
  const router = useRouter();
  const [offers, setOffers] = useState(initialOffers || []);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!editing.title || !editing.badge) return showToast("Title and Badge are required.");
    
    executeWithUndo({
      message: editing.id ? "Offer updated. Syncing in 7s..." : "New offer created. Syncing in 7s...",
      executeFunction: async () => {
        try {
          const res = await fetch("/api/admin/offers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editing),
          });
          if (res.ok) router.refresh();
        } catch (err) { showToast("Sync failed."); }
      },
      revertUI: () => {
        if (editing.id) setOffers(offers.map(o => o.id === editing.id ? editing : o));
        else setOffers([{...editing, id: 'temp-' + Date.now()}, ...offers]);
        setEditing(null);
      }
    });
  }

  async function handleDelete(id) {
    const offerToRemove = offers.find(o => o.id === id);
    requestConfirmation({
      title: "DELETE OFFER",
      message: "Are you sure you want to remove this promotional offer?",
      onConfirm: async () => {
        executeWithUndo({
          message: "Offer removed. Deleting from database in 7s...",
          executeFunction: async () => {
            await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
            router.refresh();
          },
          revertUI: () => {
            setOffers(offers.filter(o => o.id !== id));
          }
        });
      }
    });
  }

  return (
    <div className="admin-tab-content active">
      <div className="admin-section-card-header">
        <div>
          <h2 className="admin-page-title">PROMO OFFERS</h2>
          <p className="admin-page-sub">Manage the red banner badges shown on the homepage.</p>
        </div>
        <button className="admin-btn-sm" onClick={() => setEditing({ title: "", badge: "", promoCode: "", discount: 0, isActive: true })}>+ NEW OFFER</button>
      </div>

      <div className="admin-section-card">
        <div className="elite-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Offer Title</th>
                <th>Code</th>
                <th>Discount</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.title}</strong></td>
                  <td><code style={{ color: "var(--red)", background: "rgba(232,0,29,0.1)", padding: "2px 6px", borderRadius: "4px" }}>{o.promoCode || "—"}</code></td>
                  <td><span style={{ fontWeight: 700 }}>{o.discount ? `${o.discount}%` : "—"}</span></td>
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
      </div>

      {editing && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: "450px" }}>
            <header className="modal-header">
              <h3>{editing.id ? "EDIT OFFER" : "NEW OFFER"}</h3>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </header>
            <div className="modal-body">
              <form onSubmit={handleSave}>

                <div className="admin-form-group">
                  <label className="admin-label">TITLE</label>
                  <input 
                    name="title" 
                    value={editing.title} 
                    onChange={e => setEditing({...editing, title: e.target.value})}
                    className="admin-input" 
                    required 
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">BADGE TEXT (Banners)</label>
                  <input 
                    name="badge" 
                    value={editing.badge} 
                    onChange={e => setEditing({...editing, badge: e.target.value})}
                    className="admin-input" 
                    required 
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div className="admin-form-group">
                    <label className="admin-label">PROMO CODE</label>
                    <input 
                      name="promoCode" 
                      value={editing.promoCode || ""} 
                      onChange={e => setEditing({...editing, promoCode: e.target.value})}
                      className="admin-input" 
                      placeholder="e.g. NME10" 
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">DISCOUNT %</label>
                    <input 
                      type="number" 
                      name="discount" 
                      value={editing.discount || ""} 
                      onChange={e => setEditing({...editing, discount: parseInt(e.target.value) || 0})}
                      className="admin-input" 
                      placeholder="10" 
                    />
                  </div>
                </div>
                <div className="admin-form-group" style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0" }}>
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={editing.isActive} 
                    onChange={e => setEditing({...editing, isActive: e.target.checked})}
                    id="isActive" 
                  />
                  <label htmlFor="isActive" style={{ margin: 0, fontSize: "11px", letterSpacing: "1px", color: "white" }}>ACTIVE ON SITE</label>
                </div>
                <button type="submit" className="admin-btn-sm" disabled={saving} style={{ width: "100%", padding: "12px", marginTop: "10px" }}>
                  {saving ? "SAVING..." : "SAVE OFFER"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
