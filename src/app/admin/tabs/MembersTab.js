// src/app/admin/tabs/MembersTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MembersTab({ members: initialMembers, plans: availablePlans, settings, requestConfirmation, executeWithUndo, showToast }) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers || []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    planTier: availablePlans?.[0]?.name || "STARTER",
    startDate: new Date().toISOString().split('T')[0]
  });

  const registeredMembers = members.filter(m => !m.memberships?.some(ms => ms.planTier?.toLowerCase().includes("session")));
  const dailyMembers = members.filter(m => m.memberships?.some(ms => ms.planTier?.toLowerCase().includes("session")));

  const filteredMembers = registeredMembers.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) || 
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function saveMember() {
    if (!formData.firstName || !formData.email) return showToast("First Name and Email are required");
    
    executeWithUndo({
      message: "New member added. Syncing with database in 7s...",
      executeFunction: async () => {
        try {
          const res = await fetch("/api/admin/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          });
          if (res.ok) {
            router.refresh();
          }
        } catch (err) {
          showToast("Failed to sync member to database");
        }
      },
      revertUI: () => {
        // Optimistic UI update
        const tempMember = { ...formData, id: 'temp-' + Date.now(), createdAt: new Date().toISOString(), memberships: [{ planTier: formData.planTier, status: "ACTIVE", endDate: null }] };
        setMembers([tempMember, ...members]);
        setFormData({ firstName: "", lastName: "", phone: "", email: "", planTier: "STARTER", startDate: new Date().toISOString().split('T')[0] });
      }
    });
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
      <div className="admin-page-title">MEMBERS</div>
      <div className="admin-page-sub">Manage all registered members</div>
      
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Add New Member</span>
          <button className="admin-btn-sm" onClick={saveMember} disabled={loading}>
            {loading ? "Saving..." : "Save Member"}
          </button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label className="admin-label">First Name</label>
            <input className="admin-input" type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Last Name</label>
            <input className="admin-input" type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input className="admin-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Phone</label>
            <input className="admin-input" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Plan Tier</label>
            <select className="admin-input" value={formData.planTier} onChange={e => setFormData({...formData, planTier: e.target.value})}>
              {availablePlans?.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
              {!availablePlans?.length && <option value="STARTER">Starter</option>}
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Start Date</label>
            <input className="admin-input" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
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
              <tr><th>ID</th><th>Name</th><th>Contact</th><th>Plan</th><th>Joined</th><th>Expires</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => {
                const membership = m.memberships?.[0];
                const plan = membership?.planTier || "N/A";
                const isActive = membership?.status === "ACTIVE";
                const joinDate = new Date(m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                const expiresDate = membership?.endDate ? new Date(membership.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : "—";
                return (
                  <tr key={m.id}>
                    <td><span style={{fontFamily: 'monospace', color: 'var(--red)', fontSize: '11px'}}>{m.memberId || '—'}</span></td>
                    <td><strong>{m.firstName} {m.lastName}</strong></td>
                    <td><span style={{fontSize: "11px"}}>{m.email}</span><br /><span style={{ opacity: 0.5, fontSize: "11px" }}>{m.phone}</span></td>
                    <td>{plan}</td>
                    <td>{joinDate}</td>
                    <td>{expiresDate}</td>
                    <td>
                      <span className={`status-badge ${isActive ? 'status-active' : 'status-expired'}`}>
                        {isActive ? 'Active' : 'Expired'}
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
                const plan = membership?.planTier || "Pay Per Session";
                const isActive = membership?.status === "ACTIVE" && new Date(membership.endDate) > new Date();
                const joinDate = new Date(m.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                const expiresDate = membership?.endDate ? new Date(membership.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";
                return (
                  <tr key={m.id}>
                    <td><strong>{m.firstName} {m.lastName}</strong></td>
                    <td><span style={{fontSize: "11px"}}>{m.email}</span><br /><span style={{ opacity: 0.5, fontSize: "11px" }}>{m.phone}</span></td>
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
