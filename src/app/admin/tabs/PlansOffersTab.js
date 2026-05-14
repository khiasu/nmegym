// src/app/admin/tabs/PlansOffersTab.js
"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

export default function PlansOffersTab({ plans: initialPlans, offers: initialOffers, requestConfirmation }) {
  const [plans, setPlans] = useState(initialPlans || []);
  const [offers, setOffers] = useState(initialOffers || []);
  const [newOffer, setNewOffer] = useState({ title: "", badge: "", discount: "", promoImage: "", description: "" });

  async function savePlan(id) {
    const plan = plans.find(p => p.id === id);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      if (res.ok) alert("Plan updated!");
    } catch (err) { alert("Error updating plan."); }
  }

  async function handleAddOffer() {
    if (!newOffer.title) return alert("Title is required.");
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newOffer, isActive: true, discount: parseInt(newOffer.discount) || null }),
      });
      if (res.ok) {
        const saved = await res.json();
        setOffers([saved, ...offers]);
        alert("Offer created!");
        setNewOffer({ title: "", badge: "", discount: "", promoImage: "", description: "" });
      }
    } catch (err) { alert("Error adding offer."); }
  }

  function deleteOffer(id) {
    if (!requestConfirmation) {
      if (!confirm("Delete this offer?")) return;
      return executeDelete(id);
    }
    requestConfirmation({
      title: "DELETE PROMOTION",
      message: "Are you sure you want to delete this promotional offer?",
      isCritical: false,
      onConfirm: async () => {
        await executeDelete(id);
      }
    });
  }

  async function executeDelete(id) {
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
      if (res.ok) setOffers(offers.filter(o => o.id !== id));
    } catch (err) { alert("Error deleting offer."); }
  }

  return (
    <div className="admin-tab-content active" id="tab-plans">
      <div className="admin-page-title">PLANS & OFFERS</div>
      <div className="admin-page-sub">Manage membership pricing and seasonal promotions</div>
      
      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Membership Plans</span></div>
        <div style={{overflowX: "auto"}}>
          <table className="admin-table">
            <thead>
              <tr><th>Plan</th><th>Price (₹)</th><th>Period</th><th>Features</th><th>Action</th></tr>
            </thead>
            <tbody id="plansAdminBody">
              {plans.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name.toUpperCase()}</strong></td>
                  <td>
                    <input 
                      type="number" 
                      className="admin-input-sm" 
                      value={p.price} 
                      onChange={(e) => setPlans(plans.map(plan => plan.id === p.id ? { ...plan, price: parseInt(e.target.value) } : plan))} 
                      style={{ width: "80px", padding: "4px", background: "#0d0d0d", color: "#fff", border: "1px solid var(--border)" }}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="admin-input-sm" 
                      value={p.period} 
                      onChange={(e) => setPlans(plans.map(plan => plan.id === p.id ? { ...plan, period: e.target.value } : plan))} 
                      style={{ width: "100px", padding: "4px", background: "#0d0d0d", color: "#fff", border: "1px solid var(--border)" }}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="admin-input-sm" 
                      value={p.features} 
                      onChange={(e) => setPlans(plans.map(plan => plan.id === p.id ? { ...plan, features: e.target.value } : plan))} 
                      style={{ width: "100%", minWidth: "100px", maxWidth: "200px", padding: "4px", background: "#0d0d0d", color: "#fff", border: "1px solid var(--border)" }}
                    />
                  </td>
                  <td><button className="admin-btn-sm" onClick={() => savePlan(p.id)}>Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">New Special Offer</span>
          <button className="admin-btn-sm" onClick={handleAddOffer}>Create Offer</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label className="admin-label">Offer Title</label><input className="admin-input" type="text" placeholder="e.g. Christmas Blast" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Badge Text</label><input className="admin-input" type="text" placeholder="e.g. 20% OFF" value={newOffer.badge} onChange={e => setNewOffer({...newOffer, badge: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Discount %</label><input className="admin-input" type="number" placeholder="20" value={newOffer.discount} onChange={e => setNewOffer({...newOffer, discount: e.target.value})} /></div>
          <div className="admin-form-group">
            <label className="admin-label">Promo Image</label>
            <div style={{display:"flex", gap:"10px"}}>
              <input className="admin-input" type="text" placeholder="https://..." value={newOffer.promoImage} onChange={e => setNewOffer({...newOffer, promoImage: e.target.value})} />
              <CldUploadWidget uploadPreset="nmegym_preset" onSuccess={(res) => setNewOffer({ ...newOffer, promoImage: res.info.secure_url })}>
                {({ open }) => (<button className="admin-btn-sm outline" onClick={() => open()}>Upload</button>)}
              </CldUploadWidget>
            </div>
          </div>
          <div className="admin-form-group" style={{gridColumn: "span 2"}}><label className="admin-label">Description</label><input className="admin-input" type="text" placeholder="Detailed offer description..." value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} /></div>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Active Promotions</span></div>
        <table className="admin-table">
          <thead><tr><th>Title</th><th>Badge</th><th>Discount</th><th>Status</th><th>Action</th></tr></thead>
          <tbody id="offersAdminBody">
            {offers.map(o => (
              <tr key={o.id}>
                <td>{o.title}</td>
                <td><span className="status-badge status-active">{o.badge || '—'}</span></td>
                <td>{o.discount ? `${o.discount}%` : '—'}</td>
                <td>{o.isActive ? 'Active' : 'Hidden'}</td>
                <td>
                  <button className="admin-toggle-btn" onClick={() => deleteOffer(o.id)}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
