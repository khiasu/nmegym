// src/app/admin/tabs/PaymentsTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentsTab({ pendingPayments: initialPending, verifiedPayments, requestConfirmation, executeWithUndo }) {
  const router = useRouter();
  const [pendingPayments, setPendingPayments] = useState(initialPending || []);
  const [processing, setProcessing] = useState(null); // Track which payment is processing
  const [previewImg, setPreviewImg] = useState(null); // Screenshot preview modal

  const sessionPending = pendingPayments.filter(p => p.planName?.toLowerCase().includes("session"));
  const memberPending = pendingPayments.filter(p => !p.planName?.toLowerCase().includes("session"));
  
  const sessionVerified = verifiedPayments?.filter(p => p.planName?.toLowerCase().includes("session")) || [];
  const memberVerified = verifiedPayments?.filter(p => !p.planName?.toLowerCase().includes("session")) || [];

  async function handleVerify(paymentId, status) {
    if (!requestConfirmation || !executeWithUndo) {
      await executeVerify(paymentId, status);
      return;
    }
    
    requestConfirmation({
      title: status === "VERIFIED" ? "VERIFY PAYMENT" : "REJECT PAYMENT",
      message: status === "VERIFIED" 
        ? "Confirm this payment? The member's plan will be activated and they'll receive a confirmation email."
        : "Reject this payment? The member will need to re-submit.",
      isCritical: status === "REJECTED",
      onConfirm: async (password) => {
        executeWithUndo({
          message: status === "VERIFIED" ? "Payment verified." : "Payment rejected.",
          revertUI: () => setPendingPayments(prev => prev.filter(p => p.id !== paymentId)),
          executeFunction: async () => await executeVerify(paymentId, status, password)
        });
      }
    });
  }

  async function executeVerify(paymentId, status, password) {
    setProcessing(paymentId);
    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status, password }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`Payment ${status}: ${data.memberId || ''}`);
        if (status === "VERIFIED" && data.userPhone) {
          const loginUrl = `${window.location.origin}/auth/login`;
          const text = data.isSessionPass
            ? `Hello ${data.userName}! 🎉\n\nYour payment of ₹${data.amount} for the ${data.planName || 'Daily Pass'} has been verified!\n\nYour 1-day pass is now ACTIVE. Enjoy your workout at NME GYM! 💪`
            : (data.isNewMember
              ? `Welcome to NME GYM, ${data.userName}! 🎉\n\nYour payment of ₹${data.amount} for the ${data.planName || 'Monthly'} plan is verified and your membership is ACTIVE.\n\n*Your Login Credentials:*\nMember ID: ${data.memberId}\nInitial Password: ${data.initialPassword}\n\nPlease login here to access your dashboard: ${loginUrl}`
              : `Hello ${data.userName}! 🎉\n\nYour payment of ₹${data.amount} for the ${data.planName || 'Monthly'} plan has been successfully verified!\n\nYour membership is now ACTIVE. You can check your dashboard here: ${loginUrl}`);
          
          // Normalize phone for wa.me: auto-prepend 91 for 10-digit Indian numbers
          const phoneDigits = data.userPhone.replace(/\D/g, '');
          const normalizedPhone = phoneDigits.length === 10 ? '91' + phoneDigits : phoneDigits;
          const waUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
          
          // Add to pending WhatsApp tasks list
          try {
            const pendingTasks = JSON.parse(localStorage.getItem("nme_admin_pending_wa") || "[]");
            if (!pendingTasks.some(t => t.paymentId === paymentId)) {
              pendingTasks.push({
                paymentId,
                memberName: data.userName,
                planName: data.planName || 'Plan',
                waUrl
              });
              localStorage.setItem("nme_admin_pending_wa", JSON.stringify(pendingTasks));
            }
          } catch (e) {
            console.error("Storage error:", e);
          }

          requestConfirmation({
            title: "SEND CONFIRMATION?",
            message: "Payment verified successfully! Would you like to send the confirmation via WhatsApp to the member now?",
            onConfirm: () => {
              try {
                const currentTasks = JSON.parse(localStorage.getItem("nme_admin_pending_wa") || "[]");
                const updatedTasks = currentTasks.filter(t => t.paymentId !== paymentId);
                localStorage.setItem("nme_admin_pending_wa", JSON.stringify(updatedTasks));
                if (window.dispatchEvent) {
                  window.dispatchEvent(new Event("nme_admin_wa_update"));
                }
              } catch (e) {
                console.error("Storage error:", e);
              }
              window.open(waUrl, "_blank");
            }
          });
        }
        router.refresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Verification failed.");
      }
    } catch (err) {
      alert("Action failed. Check console for details.");
      console.error(err);
    } finally {
      setProcessing(null);
    }
  }

  const totalRevenue = verifiedPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const formattedRevenue = totalRevenue > 100000 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : `₹${totalRevenue.toLocaleString()}`;
  const currentMonthName = new Date().toLocaleString('default', { month: 'short' });

  return (
    <div className="admin-tab-content active" id="tab-payments">
      <div className="admin-page-title">PAYMENTS</div>
      <div className="admin-page-sub">Verify renewal payments from existing members</div>
      
      <div className="admin-stat-grid">
        <div className="admin-stat-card"><div className="admin-stat-val">{formattedRevenue}</div><div className="admin-stat-label">{currentMonthName} Revenue</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">{pendingPayments.length}</div><div className="admin-stat-label">Pending Verify</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">{verifiedPayments?.length || 0}</div><div className="admin-stat-label">Paid ({currentMonthName})</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">0</div><div className="admin-stat-label">Overdue</div></div>
      </div>

      {/* PENDING PAYMENTS (MEMBERSHIP PLANS) */}
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Pending Verification (Membership Plans) ({memberPending.length})</span>
        </div>
        <div className="elite-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Promo</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Screenshot</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {memberPending.map(pay => {
                const isProcessingThis = processing === pay.id;
                return (
                  <tr key={pay.id}>
                    <td><strong>{pay.user?.firstName} {pay.user?.lastName}</strong></td>
                    <td>
                      <span style={{fontSize: "11px"}}>{pay.user?.email}</span><br />
                      <span style={{ opacity: 0.5, fontSize: "11px" }}>{pay.user?.phone}</span>
                    </td>
                    <td>{pay.planName || "—"}</td>
                    <td>{pay.promoCode ? <span style={{color: "var(--red)", fontSize: "11px", fontWeight: "bold"}}>{pay.promoCode}</span> : "—"}</td>
                    <td style={{fontWeight: "bold", color: "var(--red)"}}>₹{pay.amount}</td>
                    <td>
                      {pay.isFirstTimer ? (
                        <span className="status-badge" style={{background: "rgba(0,200,255,0.1)", color: "#00c8ff", border: "1px solid #00c8ff", fontSize: "10px", padding: "3px 8px"}}>NEW</span>
                      ) : (
                        <span className="status-badge" style={{background: "rgba(255,255,255,0.05)", color: "#888", fontSize: "10px", padding: "3px 8px"}}>RENEWAL</span>
                      )}
                    </td>
                    <td>
                      {pay.screenshotUrl ? (
                        <img 
                          src={pay.screenshotUrl} 
                          alt="Payment Screenshot" 
                          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: "1px solid #333" }}
                          onClick={() => setPreviewImg(pay.screenshotUrl)}
                        />
                      ) : (
                        <span style={{color: "#666", fontSize: "11px"}}>No image</span>
                      )}
                    </td>
                    <td>{new Date(pay.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td>
                      <div style={{display: "flex", gap: "6px"}}>
                        <button 
                          className="admin-btn-sm" 
                          onClick={() => handleVerify(pay.id, "VERIFIED")} 
                          disabled={isProcessingThis}
                          style={{background: "rgba(0,255,100,0.1)", color: "#00ff64", border: "1px solid #00ff64"}}
                        >
                          {isProcessingThis ? "..." : "✓ Verify"}
                        </button>
                        <button 
                          className="admin-btn-sm" 
                          onClick={() => handleVerify(pay.id, "REJECTED")} 
                          disabled={isProcessingThis}
                          style={{background: "rgba(255,0,0,0.1)", color: "#ff4444", border: "1px solid #ff4444"}}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {memberPending.length === 0 && (
                <tr><td colSpan="9" style={{textAlign: "center", padding: "30px", color: "var(--gray)"}}>No pending member payments.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PENDING PAYMENTS (DAILY SESSION PASSES) */}
      <div className="admin-section-card" style={{ marginTop: "25px" }}>
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Pending Verification (Daily Session Passes) ({sessionPending.length})</span>
        </div>
        <div className="elite-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Contact</th>
                <th>Pass Type</th>
                <th>Amount</th>
                <th>Screenshot</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessionPending.map(pay => {
                const isProcessingThis = processing === pay.id;
                return (
                  <tr key={pay.id}>
                    <td><strong>{pay.user?.firstName} {pay.user?.lastName}</strong></td>
                    <td>
                      <span style={{fontSize: "11px"}}>{pay.user?.email}</span><br />
                      <span style={{ opacity: 0.5, fontSize: "11px" }}>{pay.user?.phone}</span>
                    </td>
                    <td>{pay.planName || "Daily Pass"}</td>
                    <td style={{fontWeight: "bold", color: "var(--red)"}}>₹{pay.amount}</td>
                    <td>
                      {pay.screenshotUrl ? (
                        <img 
                          src={pay.screenshotUrl} 
                          alt="Payment Screenshot" 
                          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", border: "1px solid #333" }}
                          onClick={() => setPreviewImg(pay.screenshotUrl)}
                        />
                      ) : (
                        <span style={{color: "#666", fontSize: "11px"}}>No image</span>
                      )}
                    </td>
                    <td>{new Date(pay.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td>
                      <div style={{display: "flex", gap: "6px"}}>
                        <button 
                          className="admin-btn-sm" 
                          onClick={() => handleVerify(pay.id, "VERIFIED")} 
                          disabled={isProcessingThis}
                          style={{background: "rgba(0,255,100,0.1)", color: "#00ff64", border: "1px solid #00ff64"}}
                        >
                          {isProcessingThis ? "..." : "✓ Verify"}
                        </button>
                        <button 
                          className="admin-btn-sm" 
                          onClick={() => handleVerify(pay.id, "REJECTED")} 
                          disabled={isProcessingThis}
                          style={{background: "rgba(255,0,0,0.1)", color: "#ff4444", border: "1px solid #ff4444"}}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sessionPending.length === 0 && (
                <tr><td colSpan="7" style={{textAlign: "center", padding: "30px", color: "var(--gray)"}}>No pending daily passes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFIED PAYMENTS (MEMBERSHIP PLANS) */}
      <div className="admin-section-card" style={{ marginTop: "30px" }}>
        <div className="admin-section-card-header"><span className="admin-section-card-title">Verified Payments (Membership Plans) ({memberVerified.length})</span></div>
        <div className="elite-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Member</th><th>Plan</th><th>Promo</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {memberVerified.map(pay => {
                return (
                  <tr key={pay.id}>
                    <td>{pay.user?.firstName} {pay.user?.lastName}</td>
                    <td>{pay.planName || pay.user?.memberships?.[0]?.planTier || "Monthly"}</td>
                    <td>{pay.promoCode || "—"}</td>
                    <td>₹{pay.amount}</td>
                    <td>{pay.paymentMethod}</td>
                    <td>{new Date(pay.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span className="status-badge status-active">Verified</span></td>
                  </tr>
                );
              })}
              {memberVerified.length === 0 && (
                <tr><td colSpan="7" style={{textAlign: "center", padding: "20px", color: "var(--gray)"}}>No verified member payments.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFIED PAYMENTS (DAILY SESSION PASSES) */}
      <div className="admin-section-card" style={{ marginTop: "30px" }}>
        <div className="admin-section-card-header"><span className="admin-section-card-title">Verified Daily Session Passes ({sessionVerified.length})</span></div>
        <div className="elite-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>Visitor</th><th>Pass Type</th><th>Amount</th><th>Method</th><th>Date Visited</th><th>Status</th></tr>
            </thead>
            <tbody>
              {sessionVerified.map(pay => {
                return (
                  <tr key={pay.id}>
                    <td>{pay.user?.firstName} {pay.user?.lastName}</td>
                    <td>{pay.planName || "Daily Pass"}</td>
                    <td>₹{pay.amount}</td>
                    <td>{pay.paymentMethod}</td>
                    <td>{new Date(pay.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span className="status-badge status-active">Verified</span></td>
                  </tr>
                );
              })}
              {sessionVerified.length === 0 && (
                <tr><td colSpan="6" style={{textAlign: "center", padding: "20px", color: "var(--gray)"}}>No verified daily session passes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              maxWidth: "600px", 
              maxHeight: "80vh", 
              background: "#111", 
              borderRadius: "12px", 
              padding: "15px",
              position: "relative"
            }}
          >
            <button 
              onClick={() => setPreviewImg(null)} 
              style={{ 
                position: "absolute", top: "10px", right: "15px", 
                background: "none", border: "none", color: "white", 
                fontSize: "24px", cursor: "pointer", zIndex: 10 
              }}
            >
              ×
            </button>
            <img 
              src={previewImg} 
              alt="Payment Screenshot" 
              style={{ width: "100%", maxHeight: "75vh", objectFit: "contain", borderRadius: "8px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
