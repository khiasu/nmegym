// src/app/admin/members/[id]/MemberProfileClient.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MemberProfileClient({ member, plans, settings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isCustomPlan, setIsCustomPlan] = useState(false);
  const [actionType, setActionType] = useState("correct"); // "correct" or "renew"
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [savedCreds, setSavedCreds] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleResetCredentials() {
    try {
      const res = await fetch("/api/admin/reset-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.id })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCreds(data);
        setShowCredsModal(true);
      } else {
        const txt = await res.text();
        alert("Error resetting credentials: " + txt);
      }
    } catch (err) {
      alert("Failed to reset credentials");
    }
  }

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

  const [formData, setFormData] = useState({
    planTier: plans?.[0]?.name || "STARTER",
    customPlanName: "",
    customPlanPrice: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    notes: "",
    status: "ACTIVE"
  });

  const [memberData, setMemberData] = useState(member);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const latestMembership = memberData.memberships[0];
  const isActive = latestMembership?.status === "ACTIVE";
  const joinDate = latestMembership?.startDate
    ? new Date(latestMembership.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : "—";

  // WhatsApp Link generation
  const cleanPhone = (member.phone || "").replace(/\D/g, "");
  const gymName = settings?.gymName || "NME GYM";

  function buildWhatsAppLink() {
    if (!cleanPhone) return null;
    const statusText = isActive ? "ACTIVE" : "EXPIRED";
    const expiresDate = latestMembership?.endDate
      ? new Date(latestMembership.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : "N/A";
    const planName = latestMembership?.planTier || "N/A";

    let message = `Hi ${member.firstName}, this is an update from ${gymName}.\n\n`;
    message += `*Your Membership Details:*\n`;
    message += `Member ID: ${member.memberId || "N/A"}\n`;
    message += `Status: ${statusText}\n`;
    message += `Plan: ${planName}\n`;
    if (isActive) {
      message += `Valid Until: ${expiresDate}\n\n`;
    } else {
      message += `Expired On: ${expiresDate}\n\n`;
      message += `Please renew your membership to continue your fitness journey!\n\n`;
    }
    message += `Let's grind! 🏋️‍♂️`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  const waLink = buildWhatsAppLink();

  function toggleEditForm() {
    if (showEditForm) {
      setShowEditForm(false);
      setFormData({
        planTier: plans?.[0]?.name || "STARTER",
        customPlanName: "",
        customPlanPrice: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        notes: "",
        status: "ACTIVE"
      });
      setIsCustomPlan(false);
      setActionType("correct");
    } else {
      setShowEditForm(true);
      if (latestMembership) {
        const customPlanMatch = latestMembership.planTier?.match(/^(.*)\s\(₹(\d+)\)$/);
        const isCustom = !!customPlanMatch;
        setIsCustomPlan(isCustom);
        
        setFormData({
          planTier: isCustom ? (plans?.[0]?.name || "STARTER") : latestMembership.planTier,
          customPlanName: isCustom ? customPlanMatch[1] : "",
          customPlanPrice: isCustom ? customPlanMatch[2] : "",
          startDate: latestMembership.startDate ? new Date(latestMembership.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          endDate: latestMembership.endDate ? new Date(latestMembership.endDate).toISOString().split('T')[0] : "",
          notes: latestMembership.notes || "",
          status: latestMembership.status || "ACTIVE"
        });
        setActionType("correct");
      }
    }
  }

  async function handlePlanUpdate() {
    setLoading(true);
    try {
      const payload = {
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        email: member.email,
        planTier: isCustomPlan ? "" : formData.planTier,
        customPlanName: isCustomPlan ? formData.customPlanName : "",
        customPlanPrice: isCustomPlan ? Number(formData.customPlanPrice) : 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes,
        status: formData.status,
      };

      let res;
      if (actionType === "correct" && latestMembership) {
        res = await fetch("/api/admin/members", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            membershipId: latestMembership.id
          })
        });
      } else {
        res = await fetch("/api/admin/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setShowEditForm(false);
        setFormData({
          planTier: plans?.[0]?.name || "STARTER",
          customPlanName: "",
          customPlanPrice: "",
          startDate: new Date().toISOString().split('T')[0],
          endDate: "",
          notes: "",
          status: "ACTIVE"
        });
        setIsCustomPlan(false);
        setActionType("correct");
        window.location.reload();
      } else {
        const txt = await res.text();
        alert("Error: " + txt);
      }
    } catch (err) {
      alert("Failed to update plan");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteHistory(membershipId) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/membership-history?id=${membershipId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        // Remove from local state immediately
        setMemberData(prev => ({
          ...prev,
          memberships: prev.memberships.filter(ms => ms.id !== membershipId),
        }));
        setDeleteConfirm(null);
        router.refresh();
      } else {
        const txt = await res.text();
        alert("Error: " + txt);
      }
    } catch (err) {
      alert("Failed to delete history record");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <div className="admin-page-title">MEMBER PROFILE</div>
          <div className="admin-page-sub">Detailed history and records for {member.firstName} {member.lastName}</div>
        </div>
        <Link
          href="/admin?tab=members"
          className="admin-btn-sm outline"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}
        >
          ← Back to Members
        </Link>
      </div>

      <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "30px" }}>
        {/* Profile Card */}
        <div className="admin-section-card" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ color: "white", fontSize: "24px", margin: "0 0 5px 0" }}>{member.firstName} {member.lastName}</h2>
              <div style={{ color: "var(--red)", fontFamily: "monospace", fontSize: "16px", fontWeight: "bold" }}>
                {member.memberId || "No ID"}
              </div>
            </div>
            <span className={`status-badge ${isActive ? 'status-active' : 'status-expired'}`} style={{ fontSize: "14px", padding: "6px 12px" }}>
              {isActive ? 'ACTIVE' : 'EXPIRED'}
            </span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "gray", fontSize: "12px", textTransform: "uppercase" }}>Phone</span>
                <span style={{ color: "white", fontSize: "14px" }}>{member.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "gray", fontSize: "12px", textTransform: "uppercase" }}>Email</span>
                <span style={{ color: "white", fontSize: "14px" }}>{member.email || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "gray", fontSize: "12px", textTransform: "uppercase" }}>Member Since</span>
                <span style={{ color: "white", fontSize: "14px" }}>{joinDate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "gray", fontSize: "12px", textTransform: "uppercase" }}>Total Renewals</span>
                <span style={{ color: "white", fontSize: "14px" }}>{memberData.memberships.length}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "auto", flexWrap: "wrap" }}>
            {waLink ? (
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
                  padding: "12px",
                  flex: 1,
                }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.364a9.92 9.92 0 0 0 4.804 1.232h.006c5.505 0 9.99-4.478 9.99-9.985a9.97 9.97 0 0 0-2.927-7.062A9.92 9.92 0 0 0 12.012 2zm5.772 14.195c-.32.9-1.84 1.76-2.54 1.87-.6.09-1.38.16-3.89-.87-3.21-1.32-5.24-4.57-5.4-4.78-.17-.22-1.35-1.78-1.35-3.4 0-1.62.83-2.42 1.13-2.73.25-.26.66-.38.96-.38.1 0 .21 0 .3.01.27.01.41.03.6.48.24.58.83 2.01.9 2.16.07.15.12.33.02.53-.1.2-.15.33-.3.49-.15.17-.32.38-.45.51-.15.15-.31.32-.13.63.18.3.8 1.32 1.72 2.14 1.19 1.06 2.19 1.39 2.5 1.54.31.15.49.12.68-.09.19-.22.82-.95 1.04-1.28.22-.33.44-.27.75-.15.31.12 1.96.93 2.3 1.09.34.16.57.24.65.38.09.14.09.81-.23 1.71z"/>
                </svg>
                SEND VIA WHATSAPP
              </a>
            ) : (
              <div style={{ padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", textAlign: "center", color: "gray", fontSize: "12px", flex: 1 }}>
                No valid WhatsApp number
              </div>
            )}
             <button
              className="admin-btn-sm"
              style={{ background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.3)", color: "#00c8ff", padding: "12px", flex: 1 }}
              onClick={toggleEditForm}
            >
              {showEditForm ? "✕ CANCEL" : "✎ EDIT PLAN"}
            </button>
            <button
              className="admin-btn-sm"
              style={{ background: "rgba(255,190,0,0.1)", border: "1px solid rgba(255,190,0,0.3)", color: "#ffbe00", padding: "12px", flex: 1 }}
              onClick={() => {
                if(confirm("Are you sure you want to reset this member's login credentials? This will generate a new temporary password and force them to change it on their next login.")) {
                  handleResetCredentials();
                }
              }}
            >
              🔑 RESET CREDS
            </button>
          </div>
        </div>

        {/* Current Membership Snapshot */}
        <div className="admin-section-card">
          <div className="admin-section-card-header">
            <span className="admin-section-card-title">Latest Membership</span>
          </div>
          {latestMembership ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "gray", textTransform: "uppercase" }}>Plan Tier</div>
                <div style={{ fontSize: "20px", color: "white", fontWeight: "bold" }}>{latestMembership.planTier}</div>
              </div>
              <div style={{ display: "flex", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "gray", textTransform: "uppercase" }}>Start Date</div>
                  <div style={{ fontSize: "15px", color: "white" }}>
                    {latestMembership.startDate ? new Date(latestMembership.startDate).toLocaleDateString('en-GB') : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "gray", textTransform: "uppercase" }}>End Date</div>
                  <div style={{ fontSize: "15px", color: isActive ? "#00ff64" : "var(--red)", fontWeight: "bold" }}>
                    {latestMembership.endDate ? new Date(latestMembership.endDate).toLocaleDateString('en-GB') : "—"}
                  </div>
                </div>
              </div>
              {latestMembership.notes && (
                <div style={{ marginTop: "10px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", borderLeft: "3px solid var(--red)" }}>
                  <div style={{ fontSize: "11px", color: "gray", marginBottom: "4px" }}>NOTES</div>
                  <div style={{ fontSize: "13px", color: "#ccc" }}>{latestMembership.notes}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: "gray", fontSize: "14px", fontStyle: "italic" }}>No membership records found.</div>
          )}
        </div>
      </div>

      {/* PLAN EDIT / RENEW FORM */}
      {showEditForm && (
        <div className="admin-section-card" style={{ marginBottom: "30px", borderColor: "rgba(0,200,255,0.2)", background: "linear-gradient(135deg, rgba(0,200,255,0.03) 0%, transparent 100%)" }}>
          <div className="admin-section-card-header">
            <span className="admin-section-card-title">
              {actionType === "correct" ? "Correct Membership Details" : "Renew / Purchase Plan"}
            </span>
            <button className="admin-btn-sm" onClick={handlePlanUpdate} disabled={loading} style={{ background: "var(--red)", borderColor: "var(--red)" }}>
              {loading ? "Saving..." : (actionType === "correct" ? "Save Corrections" : "Save New Plan Record")}
            </button>
          </div>
          
          <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "white", fontSize: "14px" }}>
                <input 
                  type="radio" 
                  name="actionType" 
                  value="correct" 
                  checked={actionType === "correct"} 
                  onChange={() => setActionType("correct")} 
                />
                <span>Correct Current Plan (In-place Update)</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "white", fontSize: "14px" }}>
                <input 
                  type="radio" 
                  name="actionType" 
                  value="renew" 
                  checked={actionType === "renew"} 
                  onChange={() => setActionType("renew")} 
                />
                <span>Renew / Start New Membership (New History Entry)</span>
              </label>
            </div>
            <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
              {actionType === "correct" ? (
                <>This will <strong style={{ color: "white" }}>update the current membership record</strong> directly. Use this to fix dates, correct typos, or change current plan details without creating duplicate history entries.</>
              ) : (
                <>This will create a <strong style={{ color: "white" }}>new membership history record</strong>. The current active plan will be marked as EXPIRED and archived.</>
              )}
            </p>
          </div>

          <div className="admin-form-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
            {/* Toggle Custom Plan */}
            <div className="admin-form-group" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <label className="admin-label" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginTop: "12px" }}>
                <input type="checkbox" checked={isCustomPlan} onChange={e => setIsCustomPlan(e.target.checked)} />
                <span>Use Custom Plan</span>
              </label>
            </div>

            {!isCustomPlan ? (
              <div className="admin-form-group">
                <label className="admin-label">Plan Tier</label>
                <select className="admin-input" value={formData.planTier} onChange={e => setFormData({...formData, planTier: e.target.value})}>
                  {plans?.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  {!plans?.length && <option value="STARTER">Starter</option>}
                </select>
              </div>
            ) : (
              <>
                <div className="admin-form-group">
                  <label className="admin-label">Custom Plan Name</label>
                  <input className="admin-input" type="text" placeholder="e.g. Special Offer" value={formData.customPlanName} onChange={e => setFormData({...formData, customPlanName: e.target.value})} />
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
              <label className="admin-label">End Date</label>
              <input className="admin-input" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
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
              <textarea className="admin-input" style={{ minHeight: "38px", resize: "vertical" }} placeholder="e.g. Changed from 1-month to 3-month plan, paid cash difference..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>
        </div>
      )}

      {/* Complete Membership History */}
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Complete Membership History</span>
          <span style={{ fontSize: "12px", color: "gray" }}>{memberData.memberships.length} Records</span>
        </div>

        {memberData.memberships.length > 0 ? (
          <div className="elite-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Plan Tier</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Recorded On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {memberData.memberships.map((ms, index) => {
                  const isCurrent = index === 0;
                  const isOnlyActive = isCurrent && ms.status === "ACTIVE" && memberData.memberships.filter(m => m.status === "ACTIVE").length <= 1;
                  return (
                    <tr key={ms.id} style={{ background: isCurrent ? "rgba(232,0,29,0.05)" : "transparent" }}>
                      <td>
                        <strong>{ms.planTier}</strong>
                        {isCurrent && <span style={{ marginLeft: "8px", fontSize: "10px", background: "var(--red)", color: "white", padding: "2px 6px", borderRadius: "10px" }}>LATEST</span>}
                      </td>
                      <td>{ms.startDate ? new Date(ms.startDate).toLocaleDateString('en-GB') : "—"}</td>
                      <td>{ms.endDate ? new Date(ms.endDate).toLocaleDateString('en-GB') : "—"}</td>
                      <td>
                        <span className={`status-badge ${ms.status === "ACTIVE" ? 'status-active' : 'status-expired'}`}>
                          {ms.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={ms.notes || ""}>
                        {ms.notes || <span style={{ opacity: 0.3 }}>—</span>}
                      </td>
                      <td style={{ color: "gray", fontSize: "12px" }}>
                        {new Date(ms.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        {isOnlyActive ? (
                          <span style={{ fontSize: "10px", color: "gray", fontStyle: "italic" }}>Protected</span>
                        ) : (
                          <button
                            className="admin-toggle-btn"
                            title="Delete this history record"
                            onClick={() => setDeleteConfirm(ms.id)}
                            style={{ padding: "4px" }}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "30px", textAlign: "center", color: "gray" }}>
            No membership history available for this member.
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
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
            maxWidth: "420px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            background: "rgba(20,20,20,0.95)",
            animation: "slideDownFade 0.2s ease-out forwards",
          }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: "white", marginBottom: "10px", letterSpacing: "1.5px" }}>
              DELETE HISTORY RECORD
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "24px", lineHeight: "1.5" }}>
              Are you sure you want to delete this membership history record? This action cannot be undone. The member account and other records will not be affected.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                className="admin-btn-sm outline"
                style={{ padding: "10px 20px", borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                CANCEL
              </button>
              <button
                className="admin-btn-sm"
                style={{ padding: "10px 20px", background: "var(--red)", borderColor: "var(--red)", color: "white", fontWeight: "bold" }}
                onClick={() => handleDeleteHistory(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? "DELETING..." : "DELETE RECORD"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              CREDENTIALS RESET SUCCESSFULLY
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>
              The member's login credentials have been reset. Share their details below:
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
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", display: "block" }}>New Temporary Password</span>
                <strong style={{ fontFamily: "monospace", fontSize: "15px", color: "#25D366", letterSpacing: "1px" }}>
                  {savedCreds.initialPassword}
                </strong>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(() => {
                const cleanPhone = (savedCreds.phone || "").replace(/\D/g, "");
                const gymName = settings?.gymName || "NME GYM";
                const loginUrl = `${window.location.origin}/auth/login`;
                
                const waMessage = `Hi ${savedCreds.firstName}, your login credentials at ${gymName} have been reset.\n\nLogin credentials:\nMember ID: ${savedCreds.memberId}\nNew Temporary Password: ${savedCreds.initialPassword}\n\nYou can sign in at ${loginUrl} and change your password on first login.\n\nLet's grind! 🏋️‍♂️`;

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
    </>
  );
}
