// src/app/admin/tabs/MembersTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MembersTab({ members: initialMembers, plans: availablePlans, settings, requestConfirmation, executeWithUndo, showToast }) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers || []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});

  // Custom Plan Toggle
  const [isCustomPlan, setIsCustomPlan] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    planTier: availablePlans?.[0]?.name || "STARTER",
    customPlanName: "",
    customPlanPrice: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    notes: "",
    status: "ACTIVE"
  });

  const registeredMembers = members.filter(m => !m.memberships?.some(ms => ms.planTier?.toLowerCase().includes("session")));
  const dailyMembers = members.filter(m => m.memberships?.some(ms => ms.planTier?.toLowerCase().includes("session")));

  const filteredMembers = registeredMembers.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) || 
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleNotes = (id) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  async function saveMember() {
    if (!formData.firstName || !formData.phone) {
      return showToast("First Name and WhatsApp Number (Phone) are required");
    }
    
    setLoading(true);
    const payload = {
      ...formData,
      planTier: isCustomPlan ? "" : formData.planTier,
      customPlanName: isCustomPlan ? formData.customPlanName : "",
      customPlanPrice: isCustomPlan ? Number(formData.customPlanPrice) : 0
    };

    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast("Member saved successfully");
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          planTier: availablePlans?.[0]?.name || "STARTER",
          customPlanName: "",
          customPlanPrice: "",
          startDate: new Date().toISOString().split('T')[0],
          endDate: "",
          notes: "",
          status: "ACTIVE"
        });
        setIsCustomPlan(false);
        router.refresh();
        // Fetch new list of members (simplest way is reload, or just router.refresh())
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const txt = await res.text();
        showToast("Error: " + txt);
      }
    } catch (err) {
      showToast("Failed to save member");
    } finally {
      setLoading(false);
    }
  }

  function deleteMember(id) {
    const memberToRemove = members.find(m => m.id === id);
    requestConfirmation({
      title: "DELETE MEMBER",
      message: "Are you sure you want to permanently remove this member? This cannot be undone.",
      isCritical: true,
      onConfirm: async (password) => {
        executeWithUndo({
          message: "Member removed. Finalizing deletion in 7s...",
          executeFunction: async () => await executeDelete(id, password),
          revertUI: () => {
            setMembers(members.filter(m => m.id !== id));
          }
        });
      }
    });
  }

  async function executeDelete(id, password) {
    try {
      const res = await fetch(`/api/admin/members?id=${id}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }) 
      });
      if (res.ok) {
        setMembers(members.filter(m => m.id !== id));
        router.refresh();
        showToast("Member removed");
      } else {
        showToast("Failed to delete. Incorrect password or server error.");
      }
    } catch (err) {
      showToast("Failed to delete");
    }
  }

  return (
    <div className="admin-tab-content active" id="tab-members">
      <div className="admin-page-title">MEMBERS & ARCHIVES</div>
      <div className="admin-page-sub">Manage active members and historical records</div>
      
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Add Legacy or New Member Record</span>
          <button className="admin-btn-sm" onClick={saveMember} disabled={loading}>
            {loading ? "Saving..." : "Save Member"}
          </button>
        </div>
        <div className="admin-form-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          <div className="admin-form-group">
            <label className="admin-label">First Name *</label>
            <input className="admin-input" type="text" placeholder="e.g. John" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Last Name</label>
            <input className="admin-input" type="text" placeholder="e.g. Doe" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">WhatsApp No / Phone *</label>
            <input className="admin-input" type="tel" placeholder="e.g. 917005310568" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Email (Optional)</label>
            <input className="admin-input" type="email" placeholder="e.g. user@gmail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          {/* Toggle Custom Plan */}
          <div className="admin-form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <label className="admin-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "12px" }}>
              <input type="checkbox" checked={isCustomPlan} onChange={e => setIsCustomPlan(e.target.checked)} />
              <span>Use Custom Plan Details</span>
            </label>
          </div>

          {!isCustomPlan ? (
            <div className="admin-form-group">
              <label className="admin-label">Plan Tier</label>
              <select className="admin-input" value={formData.planTier} onChange={e => setFormData({...formData, planTier: e.target.value})}>
                {availablePlans?.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
                {!availablePlans?.length && <option value="STARTER">Starter</option>}
              </select>
            </div>
          ) : (
            <>
              <div className="admin-form-group">
                <label className="admin-label">Custom Plan Name</label>
                <input className="admin-input" type="text" placeholder="e.g. Special Offer 2024" value={formData.customPlanName} onChange={e => setFormData({...formData, customPlanName: e.target.value})} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Custom Plan Price (₹)</label>
                <input className="admin-input" type="number" placeholder="e.g. 800" value={formData.customPlanPrice} onChange={e => setFormData({...formData, customPlanPrice: e.target.value})} />
              </div>
            </>
          )}

          <div className="admin-form-group">
            <label className="admin-label">Start Date</label>
            <input className="admin-input" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">End Date (Optional)</label>
            <input className="admin-input" type="date" placeholder="Leave empty for 1-month auto-expiry" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Status</label>
            <select className="admin-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="admin-form-group" style={{ gridColumn: "span 2" }}>
            <label className="admin-label">Admin Notes</label>
            <textarea className="admin-input" style={{ minHeight: "38px", resize: "vertical" }} placeholder="Add details e.g. paid cash, legacy details..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">All Members ({filteredMembers.length})</span>
          <input 
            className="admin-input" 
            style={{width: "180px", padding: "6px 10px", fontSize: "12px"}} 
            placeholder="Search members..." 
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="elite-table-wrapper">
          <table className="admin-table" id="membersTable">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Contact</th><th>Plan</th><th>Joined</th><th>Expires</th><th>Status</th><th>Notes</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => {
                const membership = m.memberships?.[0];
                const plan = membership?.planTier || "N/A";
                const isActive = membership?.status === "ACTIVE";
                const joinDate = new Date(m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                const expiresDate = membership?.endDate ? new Date(membership.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "—";
                const hasNotes = !!membership?.notes;
                const isExpanded = !!expandedNotes[m.id];
                
                // WhatsApp pre-filled notification link
                const cleanPhone = (m.phone || "").replace(/\D/g, "");
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hi%20${m.firstName},%20this%20is%20NME%20Gym.%20We%20wanted%20to%20update%20you%20on%20your%20membership.` : null;

                return (
                  <>
                    <tr key={m.id}>
                      <td><span style={{fontFamily: 'monospace', color: 'var(--red)', fontSize: '11px'}}>{m.memberId || '—'}</span></td>
                      <td><strong>{m.firstName} {m.lastName}</strong></td>
                      <td>
                        {m.email ? <span style={{fontSize: "11px"}}>{m.email}</span> : <span style={{fontSize: "11px", color: "gray", fontStyle: "italic"}}>No email</span>}
                        <br />
                        {waLink ? (
                          <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontSize: "11px", fontWeight: "bold", textDecoration: "underline" }}>
                            {m.phone}
                          </a>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: "11px" }}>{m.phone || "—"}</span>
                        )}
                      </td>
                      <td>{plan}</td>
                      <td>{joinDate}</td>
                      <td>{expiresDate}</td>
                      <td>
                        <span className={`status-badge ${membership?.status === "ACTIVE" ? 'status-active' : 'status-expired'}`}>
                          {membership?.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        {hasNotes ? (
                          <button onClick={() => toggleNotes(m.id)} className="admin-btn-sm" style={{ padding: "2px 6px", fontSize: "10px", background: isExpanded ? "var(--red)" : "transparent", border: "1px solid var(--red)" }}>
                            {isExpanded ? "Hide" : "View"}
                          </button>
                        ) : (
                          <span style={{ opacity: 0.3 }}>—</span>
                        )}
                      </td>
                      <td>
                        <button className="admin-toggle-btn" onClick={() => deleteMember(m.id)}>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </td>
                    </tr>
                    {isExpanded && hasNotes && (
                      <tr key={`${m.id}-notes`} style={{ background: "rgba(255,255,255,0.02)" }}>
                        <td colSpan="9" style={{ padding: "12px 24px", fontSize: "13px", color: "#ccc", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <strong>Notes:</strong> {membership.notes}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DAILY SESSION PASS RECORDS */}
      <div className="admin-section-card" style={{ marginTop: "30px" }}>
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Daily Session Pass Records ({dailyMembers.length})</span>
        </div>
        <div className="elite-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Contact</th><th>Pass Price</th><th>Date Visited</th><th>Expiry</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {dailyMembers.map(m => {
                const membership = m.memberships?.[0];
                const isActive = membership?.status === "ACTIVE" && new Date(membership.endDate) > new Date();
                const joinDate = new Date(m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const expiresDate = membership?.endDate ? new Date(membership.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";
                
                const cleanPhone = (m.phone || "").replace(/\D/g, "");
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hi%20${m.firstName},%20this%20is%20NME%20Gym.` : null;

                return (
                  <tr key={m.id}>
                    <td><strong>{m.firstName} {m.lastName}</strong></td>
                    <td>
                      {m.email ? <span style={{fontSize: "11px"}}>{m.email}</span> : <span style={{fontSize: "11px", color: "gray", fontStyle: "italic"}}>No email</span>}
                      <br />
                      {waLink ? (
                        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontSize: "11px", fontWeight: "bold", textDecoration: "underline" }}>
                          {m.phone}
                        </a>
                      ) : (
                        <span style={{ opacity: 0.5, fontSize: "11px" }}>{m.phone || "—"}</span>
                      )}
                    </td>
                    <td><span style={{ fontWeight: 700, color: "var(--red)" }}>₹{settings?.payPerSessionPrice || 200}</span></td>
                    <td>{joinDate}</td>
                    <td>{expiresDate}</td>
                    <td>
                      <span className={`status-badge ${isActive ? 'status-active' : 'status-expired'}`}>
                        {isActive ? 'Active Today' : 'Expired'}
                      </span>
                    </td>
                    <td>
                      <button className="admin-toggle-btn" onClick={() => deleteMember(m.id)}>
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {dailyMembers.length === 0 && (
                <tr><td colSpan="7" style={{textAlign: "center", padding: "20px", color: "var(--gray)"}}>No daily session pass records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
