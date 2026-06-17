// src/app/admin/tabs/MembersTab.js
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function MembersTab({ members: initialMembers, plans: availablePlans, settings, requestConfirmation, executeWithUndo, showToast }) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers || []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [sortKey, setSortKey] = useState("joined");
  const [sortDir, setSortDir] = useState("desc");

  // Custom Plan Toggle
  const [isCustomPlan, setIsCustomPlan] = useState(false);
  
  // Credentials Modal States
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [savedCreds, setSavedCreds] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSendEmailCreds() {
    if (!savedCreds || !savedCreds.email) return;
    setEmailSending(true);
    setEmailSent(false);
    try {
      const res = await fetch("/api/admin/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: savedCreds.email,
          name: `${savedCreds.firstName} ${savedCreds.lastName || ""}`.trim(),
          memberId: savedCreds.memberId,
          password: savedCreds.initialPassword
        })
      });
      if (res.ok) {
        setEmailSent(true);
      } else {
        alert("Failed to send email credentials");
      }
    } catch (err) {
      alert("Error sending email credentials");
    } finally {
      setEmailSending(false);
    }
  }

  function handleCopyCreds() {
    if (!savedCreds) return;
    const loginUrl = `${window.location.origin}/auth/login`;
    const text = `Hi ${savedCreds.firstName}, your account at ${settings?.gymName || "NME GYM"} is active.\n\nLogin URL: ${loginUrl}\nUsername (Member ID/Email/Phone): ${savedCreds.memberId}\nTemporary Password: ${savedCreds.initialPassword || "(already set)"}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  
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

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "id" ? "asc" : "desc");
    }
  }

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    const msA = a.memberships?.[0];
    const msB = b.memberships?.[0];

    switch (sortKey) {
      case "name":
        return dir * (`${a.firstName} ${a.lastName}`).localeCompare(`${b.firstName} ${b.lastName}`);
      case "id":
        return dir * (a.memberId || "").localeCompare(b.memberId || "");
      case "plan":
        return dir * (msA?.planTier || "").localeCompare(msB?.planTier || "");
      case "joined":
        return dir * ((msA?.startDate ? new Date(msA.startDate).getTime() : 0) - (msB?.startDate ? new Date(msB.startDate).getTime() : 0));
      case "expires":
        return dir * ((msA?.endDate ? new Date(msA.endDate).getTime() : 0) - (msB?.endDate ? new Date(msB.endDate).getTime() : 0));
      case "status": {
        const order = { ACTIVE: 0, EXPIRED: 1, CANCELLED: 2, PENDING: 3 };
        return dir * ((order[msA?.status] ?? 4) - (order[msB?.status] ?? 4));
      }
      default:
        return 0;
    }
  });

  const SortArrow = ({ col }) => {
    if (sortKey !== col) return <span style={{ opacity: 0.25, marginLeft: "4px", fontSize: "10px" }}>⇅</span>;
    return <span style={{ marginLeft: "4px", fontSize: "10px", color: "var(--red)" }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

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
        const data = await res.json();
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
        
        // Show credentials modal instead of auto-reloading immediately
        setSavedCreds(data);
        setShowCredsModal(true);
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
        setMembers(prev => prev.filter(m => m.id !== id));
        router.refresh();
        showToast("Member removed");
      } else {
        let errorMsg = "Failed to delete member.";
        try {
          const data = await res.json();
          if (data.error) errorMsg = data.error;
        } catch (_) {
          // response wasn't JSON, use status-based message
          if (res.status === 403) errorMsg = "Invalid admin password.";
        }
        showToast(errorMsg);
      }
    } catch (err) {
      showToast("Network error. Failed to delete member.");
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
              <tr>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("id")}>ID<SortArrow col="id" /></th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("name")}>Name<SortArrow col="name" /></th>
                <th>Contact</th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("plan")}>Plan<SortArrow col="plan" /></th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("joined")}>Joined<SortArrow col="joined" /></th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("expires")}>Expires<SortArrow col="expires" /></th>
                <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => handleSort("status")}>Status<SortArrow col="status" /></th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map(m => {
                const membership = m.memberships?.[0];
                const plan = membership?.planTier || "N/A";
                const isActive = membership?.status === "ACTIVE";
                const joinDate = membership?.startDate ? new Date(membership.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";
                const expiresDate = membership?.endDate ? new Date(membership.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";
                const hasNotes = !!membership?.notes;
                const isExpanded = !!expandedNotes[m.id];
                
                // WhatsApp pre-filled notification link
                const cleanPhone = (m.phone || "").replace(/\D/g, "");
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hi%20${m.firstName},%20this%20is%20NME%20Gym.%20We%20wanted%20to%20update%20you%20on%20your%20membership.` : null;

                return (
                  <React.Fragment key={m.id}>
                    <tr>
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
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button 
                            className="admin-btn-sm" 
                            style={{ padding: "4px 8px", fontSize: "10px", background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.3)", color: "#00c8ff" }}
                            onClick={() => router.push(`/admin/members/${m.id}`)}
                          >
                            Profile
                          </button>
                          <button className="admin-toggle-btn" onClick={() => deleteMember(m.id)}>
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && hasNotes && (
                      <tr key={`${m.id}-notes`} style={{ background: "rgba(255,255,255,0.02)" }}>
                        <td colSpan="9" style={{ padding: "12px 24px", fontSize: "13px", color: "#ccc", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <strong>Notes:</strong> {membership.notes}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
                const joinDate = membership?.startDate ? new Date(membership.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—";
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

      {/* CREDENTIALS SHARE MODAL */}
      {showCredsModal && savedCreds && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999
        }}>
          <div className="elite-card" style={{
            padding: "30px",
            width: "90%",
            maxWidth: "450px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            background: "rgba(20,20,20,0.95)",
            animation: "slideDownFade 0.2s ease-out forwards",
            margin: 0
          }}>
            <div style={{ fontSize: "40px", color: "#25D366", marginBottom: "15px" }}>✓</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", color: "white", marginBottom: "10px", letterSpacing: "1.5px" }}>
              MEMBER SAVED SUCCESSFULLY
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>
              The member has been added/updated. Share their login details below:
            </p>

            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "left",
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", display: "block" }}>Name</span>
                <strong style={{ fontSize: "14px", color: "white" }}>{savedCreds.firstName} {savedCreds.lastName || ""}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", display: "block" }}>Member ID</span>
                  <span style={{ fontFamily: "monospace", fontSize: "14px", color: "var(--red)", fontWeight: "bold" }}>
                    {savedCreds.memberId || "—"}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", display: "block" }}>Phone</span>
                  <span style={{ fontSize: "13px", color: "white" }}>{savedCreds.phone}</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", display: "block" }}>Initial Password</span>
                {savedCreds.initialPassword ? (
                  <strong style={{ fontFamily: "monospace", fontSize: "15px", color: "#25D366", letterSpacing: "1px" }}>
                    {savedCreds.initialPassword}
                  </strong>
                ) : (
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                    Password already set or session pass member.
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(() => {
                const cleanPhone = (savedCreds.phone || "").replace(/\D/g, "");
                const gymName = settings?.gymName || "NME GYM";
                const loginUrl = `${window.location.origin}/auth/login`;
                
                const waMessage = savedCreds.initialPassword 
                  ? `Hi ${savedCreds.firstName}, welcome to ${gymName}! Your account has been set up.\n\nLogin credentials:\nMember ID: ${savedCreds.memberId}\nInitial Password: ${savedCreds.initialPassword}\n\nYou can sign in at ${loginUrl} to manage your membership and change your password.\n\nLet's grind! 🏋️‍♂️`
                  : `Hi ${savedCreds.firstName}, your account at ${gymName} is active.\n\nLogin credentials:\nMember ID: ${savedCreds.memberId || "your phone number"}\n\nYou can sign in at ${loginUrl} to access your dashboard.\n\nLet's grind! 🏋️‍♂️`;

                const encodedMessage = encodeURIComponent(waMessage);
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedMessage}` : null;

                if (!waLink) return null;

                return (
                  <a 
                    href={waLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="admin-btn-sm" 
                    style={{ 
                      background: "#25D366", 
                      borderColor: "#25D366", 
                      color: "white", 
                      fontWeight: "bold",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px"
                    }}
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.364a9.92 9.92 0 0 0 4.804 1.232h.006c5.505 0 9.99-4.478 9.99-9.985a9.97 9.97 0 0 0-2.927-7.062A9.92 9.92 0 0 0 12.012 2zm5.772 14.195c-.32.9-1.84 1.76-2.54 1.87-.6.09-1.38.16-3.89-.87-3.21-1.32-5.24-4.57-5.4-4.78-.17-.22-1.35-1.78-1.35-3.4 0-1.62.83-2.42 1.13-2.73.25-.26.66-.38.96-.38.1 0 .21 0 .3.01.27.01.41.03.6.48.24.58.83 2.01.9 2.16.07.15.12.33.02.53-.1.2-.15.33-.3.49-.15.17-.32.38-.45.51-.15.15-.31.32-.13.63.18.3.8 1.32 1.72 2.14 1.19 1.06 2.19 1.39 2.5 1.54.31.15.49.12.68-.09.19-.22.82-.95 1.04-1.28.22-.33.44-.27.75-.15.31.12 1.96.93 2.3 1.09.34.16.57.24.65.38.09.14.09.81-.23 1.71z"/>
                    </svg>
                    SEND VIA WHATSAPP
                  </a>
                );
              })()}

              {savedCreds.email ? (
                <button
                  onClick={handleSendEmailCreds}
                  disabled={emailSending || emailSent}
                  className="admin-btn-sm"
                  style={{
                    background: emailSent ? "rgba(0, 200, 255, 0.2)" : "rgba(232,0,29,0.1)",
                    border: "1px solid rgba(232,0,29,0.3)",
                    color: emailSent ? "#00c8ff" : "white",
                    padding: "12px",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  {emailSending ? "SENDING EMAIL..." : emailSent ? "✓ EMAIL SENT" : "✉ SEND VIA EMAIL"}
                </button>
              ) : (
                <div style={{ padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", fontSize: "11px", color: "gray" }}>
                  No email address available to send credentials.
                </div>
              )}

              <button
                onClick={handleCopyCreds}
                className="admin-btn-sm"
                style={{
                  background: copied ? "rgba(0, 255, 100, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: copied ? "#00ff64" : "white",
                  padding: "12px",
                  fontWeight: "bold"
                }}
              >
                {copied ? "✓ CREDENTIALS COPIED" : "📋 COPY CREDENTIALS (FOR SMS)"}
              </button>

              <button 
                className="admin-btn-sm outline" 
                style={{ 
                  borderColor: "rgba(255,255,255,0.2)", 
                  color: "#fff",
                  padding: "10px",
                  marginTop: "12px"
                }} 
                onClick={() => {
                  setShowCredsModal(false);
                  setEmailSent(false);
                  setCopied(false);
                  window.location.reload();
                }}
              >
                CLOSE & REFRESH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
