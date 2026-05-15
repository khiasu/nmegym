// src/app/admin/tabs/RegistrationsTab.js
// Dedicated tab for NEW MEMBER registrations (first-timers)
// Shows pending registration requests with full user details + screenshot
// Upon verification: auto-generates member ID + initial password → sends welcome email
"use client";

import { useState } from "react";

export default function RegistrationsTab({ newRegistrations: initialRegs, requestConfirmation, executeWithUndo }) {
  const [registrations, setRegistrations] = useState(initialRegs || []);
  const [processing, setProcessing] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  async function handleAction(paymentId, status) {
    const isVerify = status === "VERIFIED";
    
    if (!requestConfirmation || !executeWithUndo) {
      await executeAction(paymentId, status);
      return;
    }

    requestConfirmation({
      title: isVerify ? "APPROVE REGISTRATION" : "REJECT REGISTRATION",
      message: isVerify 
        ? "Approve this new member? A member ID, initial password, and welcome email will be automatically generated and sent."
        : "Reject this registration? The applicant will need to re-submit their payment.",
      isCritical: !isVerify,
      onConfirm: async () => {
        executeWithUndo({
          message: isVerify ? "Registration approved." : "Registration rejected.",
          revertUI: () => setRegistrations(prev => prev.filter(r => r.id !== paymentId)),
          executeFunction: async () => await executeAction(paymentId, status)
        });
      }
    });
  }

  async function executeAction(paymentId, status) {
    setProcessing(paymentId);
    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`Registration ${status}: ${data.memberId || ''}`);
        if (status === "VERIFIED" && data.userPhone) {
          const loginUrl = `${window.location.origin}/auth/login`;
          const text = data.isNewMember
            ? `Welcome to NME GYM, ${data.userName}! 🎉\n\nYour payment of ₹${data.amount} for the ${data.planName || 'Monthly'} plan is verified and your membership is ACTIVE.\n\n*Your Login Credentials:*\nMember ID: ${data.memberId}\nInitial Password: ${data.initialPassword}\n\nPlease login here to access your dashboard: ${loginUrl}`
            : `Hello ${data.userName}! 🎉\n\nYour payment of ₹${data.amount} for the ${data.planName || 'Monthly'} plan has been successfully verified!\n\nYour membership is now ACTIVE. You can check your dashboard here: ${loginUrl}`;
          
          const waUrl = `https://wa.me/${data.userPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
          if (window.confirm("Registration verified successfully! Would you like to send the welcome details via WhatsApp to the member now?")) {
            window.open(waUrl, "_blank");
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Action failed.");
      }
    } catch (err) {
      alert("Action failed. Check console for details.");
      console.error(err);
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="admin-tab-content active" id="tab-registrations">
      <div className="admin-page-title">NEW REGISTRATIONS</div>
      <div className="admin-page-sub">Review and approve first-time member registrations</div>
      
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-val" style={{color: "#00c8ff"}}>{registrations.length}</div>
          <div className="admin-stat-label">Pending Approval</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-val">0</div>
          <div className="admin-stat-label">Approved Today</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-val">0</div>
          <div className="admin-stat-label">Rejected</div>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="admin-section-card" style={{
        borderColor: "rgba(232,0,29,0.3)", 
        background: "linear-gradient(90deg, rgba(232,0,29,0.05) 0%, transparent 100%)",
        display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px"
      }}>
        <div style={{
          background: "rgba(232,0,29,0.1)", color: "var(--red)", 
          width: "40px", height: "40px", borderRadius: "8px", 
          display: "flex", alignItems: "center", justifyContent: "center", 
          fontSize: "18px", flexShrink: 0
        }}>
          💡
        </div>
        <p style={{color: "#ccc", fontSize: "13px", lineHeight: "1.5", margin: 0}}>
          When you approve a registration, the system automatically generates a <strong style={{color: "white"}}>Member ID</strong> and <strong style={{color: "white"}}>initial password</strong>, sending a welcome email with login credentials directly to the new member.
        </p>
      </div>

      {/* REGISTRATION CARDS */}
      {registrations.length === 0 ? (
        <div className="admin-section-card" style={{textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
          <div style={{
            background: "rgba(255,255,255,0.02)", width: "80px", height: "80px", 
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.05)"
          }}>
            📋
          </div>
          <h3 style={{color: "white", fontSize: "18px", marginBottom: "8px", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "1px", textTransform: "uppercase"}}>No Pending Registrations</h3>
          <p style={{color: "#888", fontSize: "14px", maxWidth: "300px", margin: "0 auto", lineHeight: "1.5"}}>
            New member sign-ups and their payment proofs will appear here for your review and approval.
          </p>
        </div>
      ) : (
        <div style={{display: "flex", flexDirection: "column", gap: "15px"}}>
          {registrations.map(reg => {
            const isProcessing = processing === reg.id;
            const isExpanded = expandedRow === reg.id;
            
            return (
              <div key={reg.id} className="admin-section-card" style={{padding: 0, overflow: "hidden"}}>
                {/* HEADER ROW */}
                <div style={{
                  padding: "20px 25px",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                  cursor: "pointer"
                }} onClick={() => setExpandedRow(isExpanded ? null : reg.id)}>
                  {/* Status indicator */}
                  <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: "#ffc800", boxShadow: "0 0 8px rgba(255,200,0,0.5)",
                    animation: "pulse 2s infinite"
                  }} />
                  
                  {/* Name */}
                  <div style={{flex: "1 1 200px"}}>
                    <div style={{fontWeight: "bold", fontSize: "16px", color: "white"}}>
                      {reg.user?.firstName} {reg.user?.lastName}
                    </div>
                    <div style={{fontSize: "12px", color: "#888", marginTop: "3px"}}>
                      {new Date(reg.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(reg.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Plan */}
                  <div style={{textAlign: "center", minWidth: "100px"}}>
                    <div style={{fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "1px"}}>Plan</div>
                    <div style={{fontWeight: "bold", color: "#e8001d", marginTop: "2px"}}>{reg.planName || "—"}</div>
                  </div>

                  {/* Amount */}
                  <div style={{textAlign: "center", minWidth: "80px"}}>
                    <div style={{fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "1px"}}>Amount</div>
                    <div style={{fontWeight: "bold", color: "#00ff64", fontSize: "18px", marginTop: "2px"}}>₹{reg.amount}</div>
                  </div>

                  {/* Admission Fee indicator */}
                  {reg.admissionFee > 0 && (
                    <span style={{
                      background: "rgba(0,200,255,0.1)", color: "#00c8ff", 
                      border: "1px solid rgba(0,200,255,0.3)",
                      fontSize: "10px", padding: "4px 10px", borderRadius: "20px",
                      fontWeight: "bold", letterSpacing: "0.5px"
                    }}>
                      +₹{reg.admissionFee} ADMISSION
                    </span>
                  )}

                  {/* Expand arrow */}
                  <div style={{color: "#666", fontSize: "18px", transition: "transform 0.3s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)"}}>▼</div>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div style={{
                    padding: "0 25px 25px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    animation: "fadeIn 0.3s ease"
                  }}>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px"}}>
                      {/* Contact Details */}
                      <div>
                        <h4 style={{fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px"}}>Contact Details</h4>
                        <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                          <div style={{display: "flex", gap: "10px"}}>
                            <span style={{color: "#666", minWidth: "60px"}}>Email:</span>
                            <span style={{color: "#fff"}}>{reg.user?.email}</span>
                          </div>
                          <div style={{display: "flex", gap: "10px"}}>
                            <span style={{color: "#666", minWidth: "60px"}}>Phone:</span>
                            <span style={{color: "#fff"}}>{reg.user?.phone || "Not provided"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Screenshot */}
                      <div>
                        <h4 style={{fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px"}}>Payment Proof</h4>
                        {reg.screenshotUrl ? (
                          <div 
                            style={{
                              width: "120px", height: "120px", borderRadius: "8px", overflow: "hidden",
                              border: "2px solid #333", cursor: "pointer", transition: "border-color 0.3s"
                            }}
                            onClick={(e) => { e.stopPropagation(); setPreviewImg(reg.screenshotUrl); }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#e8001d"}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#333"}
                          >
                            <img 
                              src={reg.screenshotUrl} 
                              alt="Payment proof" 
                              style={{width: "100%", height: "100%", objectFit: "cover"}}
                            />
                          </div>
                        ) : (
                          <p style={{color: "#666", fontSize: "13px"}}>No screenshot uploaded</p>
                        )}
                        {reg.screenshotUrl && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPreviewImg(reg.screenshotUrl); }}
                            style={{
                              marginTop: "8px", background: "none", border: "1px solid #333",
                              color: "#888", padding: "5px 12px", borderRadius: "4px", cursor: "pointer",
                              fontSize: "11px"
                            }}
                          >
                            🔍 View Full Size
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{
                      display: "flex", gap: "12px", marginTop: "25px", 
                      paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction(reg.id, "VERIFIED"); }}
                        disabled={isProcessing}
                        style={{
                          flex: 1, padding: "12px", border: "none", borderRadius: "6px",
                          background: "linear-gradient(135deg, #00a86b, #007a4d)", color: "white",
                          fontWeight: "bold", cursor: "pointer", fontSize: "14px",
                          letterSpacing: "0.5px", opacity: isProcessing ? 0.5 : 1,
                          transition: "opacity 0.3s"
                        }}
                      >
                        {isProcessing ? "PROCESSING..." : "✓ APPROVE & SEND CREDENTIALS"}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction(reg.id, "REJECTED"); }}
                        disabled={isProcessing}
                        style={{
                          padding: "12px 24px", border: "1px solid #ff4444", borderRadius: "6px",
                          background: "rgba(255,68,68,0.1)", color: "#ff4444",
                          fontWeight: "bold", cursor: "pointer", fontSize: "14px",
                          opacity: isProcessing ? 0.5 : 1
                        }}
                      >
                        ✕ REJECT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SCREENSHOT PREVIEW MODAL */}
      {previewImg && (
        <div 
          className="modal-overlay open" 
          onClick={() => setPreviewImg(null)}
          style={{zIndex: 9999}}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: "600px", maxHeight: "80vh", background: "#111", 
              borderRadius: "12px", padding: "15px", position: "relative"
            }}
          >
            <button 
              onClick={() => setPreviewImg(null)} 
              style={{ 
                position: "absolute", top: "10px", right: "15px", 
                background: "none", border: "none", color: "white", 
                fontSize: "24px", cursor: "pointer", zIndex: 10 
              }}
            >×</button>
            <img 
              src={previewImg} 
              alt="Payment Screenshot" 
              style={{ width: "100%", maxHeight: "75vh", objectFit: "contain", borderRadius: "8px" }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
