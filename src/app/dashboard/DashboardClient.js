// src/app/dashboard/DashboardClient.js — Member Dashboard (Client Component)
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";

export default function DashboardClient({ user, plans }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [uploading, setUploading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastPayment, setLastPayment] = useState({ amount: 0, planName: "" });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState({ text: "", type: "" });

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMessage({ text: "", type: "" });

    if (pwForm.new !== pwForm.confirm) {
      setPwMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }
    if (pwForm.new.length < 6) {
      setPwMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMessage({ text: "Password updated successfully!", type: "success" });
        setPwForm({ current: "", new: "", confirm: "" });
      } else {
        setPwMessage({ text: data.error || "Failed to update password.", type: "error" });
      }
    } catch {
      setPwMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setPwLoading(false);
    }
  }

  const currentMembership = user.memberships[0];
  const memberId = user.memberId || user.id.slice(-6).toUpperCase();

  // UPI details
  const upiId = "coolarentiger-3@oksbi";
  const upiName = "NMEGym";

  // Calculate payment amount (existing members don't pay admission fee)
  const paymentAmount = selectedPlan ? selectedPlan.price : 0;
  const upiUri = selectedPlan
    ? `upi://pay?pa=${upiId}&pn=${upiName}&am=${paymentAmount}&cu=INR`
    : "";
  const qrCodeUrl = selectedPlan
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`
    : "";

  async function handlePaymentSubmit(e) {
    e.preventDefault();
    if (!selectedPlan || !screenshotUrl) {
      alert("Please select a plan and upload your payment screenshot.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          planName: selectedPlan.name,
          planPrice: selectedPlan.price,
          admissionFee: 0, // Existing members don't pay admission
          totalAmount: paymentAmount,
          screenshotUrl,
          isFirstTimer: false,
          userId: user.id,
        }),
      });

      if (res.ok) {
        setLastPayment({ amount: paymentAmount, planName: selectedPlan.name });
        setPaymentSuccess(true);
        setScreenshotUrl("");
        setSelectedPlan(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to submit payment.");
      }
    } catch (err) {
      alert("Error submitting payment.");
    } finally {
      setUploading(false);
    }
  }

  // Calculate membership expiry info
  const isExpired = currentMembership?.endDate
    ? new Date(currentMembership.endDate) < new Date()
    : true;
  const daysLeft = currentMembership?.endDate
    ? Math.max(0, Math.ceil((new Date(currentMembership.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="db-layout">
      {/* Dashboard Sidebar (Desktop Only) */}
      <aside className="db-sidebar">
        <div className="db-brand">
          <img src="/newlogo.png" alt="NME GYM" />
        </div>
        <nav className="db-nav">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={activeTab === "membership" ? "active" : ""} onClick={() => setActiveTab("membership")}>My Membership</button>
          <button className={activeTab === "payments" ? "active" : ""} onClick={() => setActiveTab("payments")}>Payments</button>
          <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>Settings</button>
          <button className={activeTab === "feedback" ? "active" : ""} onClick={() => setActiveTab("feedback")}>Feedback</button>
        </nav>
        <div className="db-footer">
          <Link href="/" style={{display: "block", textAlign: "center", marginBottom: 10, color: "#666", fontSize: 13, textDecoration: "none"}}>← Back to Home</Link>
          <button onClick={() => signOut()} className="btn-logout">Sign Out</button>
        </div>
      </aside>

      {/* MOBILE TOGGLE BUTTON — FIXED ON TOP */}
      <div 
        className={`hamburger dashboard-toggle ${mobileOpen ? "open" : ""}`} 
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* MOBILE MENU — MIRRORING MAIN WEBSITE */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} id="mobileMenu">
        <div className="mm-bg-text">NME</div>
        
        <div className="mm-links">
          {[
            { id: "overview", name: "Overview" },
            { id: "membership", name: "Membership" },
            { id: "payments", name: "Payments" },
            { id: "settings", name: "Settings" },
            { id: "feedback", name: "Feedback" }
          ].map((item, i) => (
            <button 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); setMobileOpen(false); }} 
              className={`mm-link ${activeTab === item.id ? "active" : ""}`}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: 0, cursor: 'pointer' }}
            >
              <span className="mm-num">0{i + 1}</span>
              <span className="mm-text" style={{ color: activeTab === item.id ? 'var(--red)' : 'inherit' }}>{item.name}</span>
            </button>
          ))}
        </div>

        <div className="mm-footer">
          <Link href="/" className="mm-member-link">← BACK TO HOME</Link>
          <button 
            onClick={() => signOut()} 
            className="mm-cta"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
          >
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="db-main">
        <header className="db-header">
          <div className="db-header-top">
            <Link href="/" className="db-mobile-logo">
              <img src="/newlogo.png" alt="NME GYM" style={{ height: '70px', objectFit: 'contain' }} />
            </Link>
            <div className="db-header-text">
              <h1>Welcome back, <span className="red">{user.firstName}</span></h1>
              <p className="gray">Member ID: <strong style={{color: "#e8001d", fontFamily: "monospace"}}>{memberId}</strong></p>
            </div>
          </div>
        </header>

        <section className="db-content">
          {activeTab === "overview" && (
            <div className="db-grid">
              {/* Membership Status Card */}
              <div className="db-card highlight">
                <h3>Current Status</h3>
                <div className="status-badge" data-status={
                  currentMembership?.status === "ACTIVE" && !isExpired ? "ACTIVE" :
                  currentMembership?.status === "ACTIVE" && isExpired ? "EXPIRED" : "NONE"
                }>
                  {currentMembership?.status === "ACTIVE" && !isExpired ? "ACTIVE" :
                   currentMembership ? "EXPIRED" : "NO ACTIVE PLAN"}
                </div>
                {currentMembership && (
                  <div className="db-info">
                    <p>Plan: <strong>{currentMembership.planTier}</strong></p>
                    <p>Expires: <strong>{currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}</strong></p>
                    {!isExpired && daysLeft <= 7 && (
                      <p style={{color: "#ffc800", marginTop: 10, fontSize: 13}}>⚠️ Expiring in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</p>
                    )}
                  </div>
                )}
                <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => setActiveTab("membership")}>
                  {currentMembership && !isExpired ? "RENEW PLAN" : "JOIN NOW"}
                </button>
              </div>


              {/* Pending Payments */}
              {user.payments?.some(p => p.status === "PENDING_VERIFICATION") && (
                <div className="db-card" style={{gridColumn: "span 2", borderLeft: "3px solid #ffc800"}}>
                  <h3 style={{color: "#ffc800"}}>⏳ Pending Verification</h3>
                  <p style={{color: "#888", fontSize: 14}}>
                    You have {user.payments.filter(p => p.status === "PENDING_VERIFICATION").length} payment(s) awaiting admin verification. 
                    You'll receive an email once verified.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "membership" && (
            <div className="db-card full">
              <h3>Membership & Renewal</h3>
              
              {paymentSuccess ? (
                <div style={{textAlign: "center", padding: "40px 0"}}>
                  <div style={{color: "#00ff64", fontSize: "48px", marginBottom: "10px"}}>✓</div>
                  <h4 style={{fontSize: "24px", color: "white", marginBottom: "10px"}}>PAYMENT SUBMITTED</h4>
                  <p style={{color: "#888", fontSize: "14px", marginBottom: "20px"}}>
                    Your payment is pending verification by our team.<br/>
                    You'll receive a confirmation email once approved.
                  </p>
                  
                  <a 
                    href={`https://wa.me/917005310568?text=${encodeURIComponent(`Hello NME GYM Admin! 👋\n\nI have just submitted a payment of ₹${lastPayment.amount} for the ${lastPayment.planName} plan (Renewal).\n\n*My Details:*\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone}\n\nPlease verify my payment. Thank you!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      background: '#25D366',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      marginTop: '10px',
                      boxShadow: '0 4px 15px rgba(37,211,102,0.3)',
                    }}
                  >
                    💬 Notify Admin via WhatsApp
                  </a>
                  <p style={{ fontSize: '11px', color: '#666', marginTop: '15px', marginBottom: '20px' }}>
                    Clicking the button above will open WhatsApp with your details pre-filled.
                  </p>
                  
                  <button 
                    onClick={() => window.location.reload()}
                    className="btn-outline" 
                    style={{marginTop: "20px", display: "inline-block"}}
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  <p className="gray">Choose a plan and pay via UPI. Upload your screenshot below.</p>

                  <div className="plans-selection">
                    {plans.map(plan => (
                      <div 
                        key={plan.id} 
                        className={`plan-option ${selectedPlan?.id === plan.id ? "selected" : ""}`}
                        onClick={() => { setSelectedPlan(plan); setScreenshotUrl(""); }}
                      >
                        <div className="po-name">{plan.name}</div>
                        <div className="po-price">₹{plan.price}</div>
                      </div>
                    ))}
                  </div>

                  {selectedPlan && (
                    <div className="payment-upload-area">
                      {/* Price Summary */}
                      <div style={{background: "rgba(255,255,255,0.03)", padding: "15px 20px", borderRadius: "8px", marginBottom: "25px", textAlign: "left"}}>
                        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "8px"}}>
                          <span style={{color: "#888"}}>Plan: {selectedPlan.name}</span>
                          <span style={{fontWeight: "bold"}}>₹{selectedPlan.price}</span>
                        </div>
                        <div style={{display: "flex", justifyContent: "space-between", borderTop: "1px solid #222", paddingTop: "10px"}}>
                          <span style={{fontWeight: "bold"}}>TOTAL TO PAY</span>
                          <span style={{color: "#e8001d", fontWeight: "bold", fontSize: "20px"}}>₹{paymentAmount}</span>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div style={{ textAlign: "center", marginBottom: "25px", padding: "20px", background: "rgba(232, 0, 29, 0.05)", border: "1px dashed rgba(232,0,29,0.3)", borderRadius: "8px" }}>
                        <p style={{ fontSize: "12px", color: "#888", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>SCAN TO PAY VIA ANY UPI APP</p>
                        <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: "150px", height: "150px", borderRadius: "10px", background: "white", padding: "10px", display: "inline-block" }} />
                        <p style={{ fontSize: "14px", fontWeight: "bold", marginTop: "15px", fontFamily: "monospace", color: "white" }}>{upiId}</p>
                      </div>

                      {/* Upload */}
                      {!screenshotUrl ? (
                        <CldUploadWidget 
                          uploadPreset="nmegym_preset"
                          onSuccess={(result) => setScreenshotUrl(result.info.secure_url)}
                        >
                          {({ open }) => (
                            <button className="btn-upload" onClick={() => open()} style={{width: "100%", padding: "15px", background: "transparent", border: "1px solid #333", color: "white", borderRadius: "6px", cursor: "pointer", fontSize: "14px"}}>
                              + Upload Payment Screenshot
                            </button>
                          )}
                        </CldUploadWidget>
                      ) : (
                        <div style={{textAlign: "center"}}>
                          <div style={{position: "relative", display: "inline-block", marginBottom: "20px"}}>
                            <img src={screenshotUrl} alt="Screenshot" style={{width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "2px solid #00ff64"}} />
                            <button 
                              type="button" 
                              onClick={() => setScreenshotUrl("")} 
                              style={{ position: "absolute", top: -8, right: -8, background: "#e8001d", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontSize: "14px" }}
                            >
                              ×
                            </button>
                          </div>
                          <p style={{color: "#00ff64", marginBottom: "15px"}}>✓ Screenshot uploaded</p>
                          <button className="btn-primary" onClick={handlePaymentSubmit} disabled={uploading} style={{width: "100%", padding: "15px"}}>
                            {uploading ? "SUBMITTING..." : `CONFIRM PAYMENT — ₹${paymentAmount}`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="db-card full">
              <h3>Payment History</h3>
              <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="db-table" style={{ minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.payments.map(pay => (
                      <tr key={pay.id}>
                        <td>{new Date(pay.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td>{pay.planName || "—"}</td>
                        <td>₹{Number(pay.amount)}</td>
                        <td>{pay.paymentMethod}</td>
                        <td>
                          <span className={`tag-${pay.status.toLowerCase().replace(/_/g, '-')}`}>
                            {pay.status === "PENDING_VERIFICATION" ? "⏳ Pending" : 
                             pay.status === "VERIFIED" ? "✓ Verified" : 
                             "✕ Rejected"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {user.payments.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: "center", padding: 40, color: "#666" }}>No payments found. Select a plan to get started.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="db-card full">
              <h3>Account Settings</h3>
              <div style={{maxWidth: "400px"}}>
                <h4 style={{fontSize: "14px", color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px"}}>Change Password</h4>
                <form onSubmit={handlePasswordChange} className="db-form">
                  <div style={{marginBottom: "15px"}}>
                    <label style={{display: "block", color: "#666", fontSize: "12px", marginBottom: "6px", textTransform: "uppercase"}}>Current Password</label>
                    <input type="password" required value={pwForm.current} onChange={e => setPwForm({...pwForm, current: e.target.value})} style={{width: "100%", background: "#1a1a1a", border: "1px solid #333", color: "white", padding: "12px", borderRadius: "6px"}} />
                  </div>
                  <div style={{marginBottom: "15px"}}>
                    <label style={{display: "block", color: "#666", fontSize: "12px", marginBottom: "6px", textTransform: "uppercase"}}>New Password</label>
                    <input type="password" required value={pwForm.new} onChange={e => setPwForm({...pwForm, new: e.target.value})} style={{width: "100%", background: "#1a1a1a", border: "1px solid #333", color: "white", padding: "12px", borderRadius: "6px"}} />
                  </div>
                  <div style={{marginBottom: "20px"}}>
                    <label style={{display: "block", color: "#666", fontSize: "12px", marginBottom: "6px", textTransform: "uppercase"}}>Confirm New Password</label>
                    <input type="password" required value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} style={{width: "100%", background: "#1a1a1a", border: "1px solid #333", color: "white", padding: "12px", borderRadius: "6px"}} />
                  </div>
                  {pwMessage.text && (
                    <p style={{color: pwMessage.type === "success" ? "#00ff64" : "#ff4444", fontSize: "13px", marginBottom: "15px"}}>{pwMessage.text}</p>
                  )}
                  <button type="submit" className="btn-primary" disabled={pwLoading} style={{width: "100%"}}>
                    {pwLoading ? "UPDATING..." : "UPDATE PASSWORD"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="db-card full">
              <h3>Share Your Feedback</h3>
              <p className="gray">We value your input. Let us know how we're doing.</p>
              <form className="db-form" style={{ marginTop: 20 }}>
                <textarea placeholder="Tell us about your experience..." rows="5"></textarea>
                <button type="button" className="btn-primary" style={{ marginTop: 15 }} onClick={() => alert("Feedback sent! Thank you.")}>Send Feedback</button>
              </form>
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .db-layout { display: flex; min-height: 100vh; background: #050505; color: white; font-family: 'Barlow', sans-serif; }
        .db-sidebar { width: 260px; background: #111; border-right: 1px solid #222; padding: 40px 20px; display: flex; flex-direction: column; }
        .db-brand img { height: 40px; margin-bottom: 50px; }
        .db-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .db-nav button { 
          background: none; 
          border: none; 
          color: #888; 
          text-align: left; 
          padding: 14px 20px; 
          font-size: 14px; 
          font-family: 'Barlow Condensed', sans-serif;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
          cursor: pointer; 
          transition: all 0.3s ease; 
          border-left: 3px solid transparent;
        }
        .db-nav button:hover, .db-nav button.active { 
          background: rgba(232,0,29,0.05); 
          color: white; 
          border-left-color: var(--red);
        }
        .db-main { flex: 1; padding: 60px; }
        .db-header { margin-bottom: 40px; }
        .db-mobile-logo { display: none; }
        .db-header h1 { font-family: 'Bebas Neue', sans-serif; font-size: 48px; letter-spacing: 2px; }
        .db-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .db-card { background: #111; border: 1px solid #222; padding: 30px; border-radius: 12px; }
        .db-card.full { grid-column: span 2; }
        .db-card h3 { margin-bottom: 20px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #ccc; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 30px; font-weight: 700; font-size: 14px; margin-bottom: 15px; }
        .status-badge[data-status="ACTIVE"] { background: rgba(0,255,100,0.1); color: #00ff64; border: 1px solid #00ff64; }
        .status-badge[data-status="ACTIVE"] { background: rgba(0,255,100,0.1); color: #00ff64; border: 1px solid #00ff64; }
        .status-badge[data-status="EXPIRED"] { background: rgba(232,0,29,0.1); color: var(--red); border: 1px solid var(--red); }
        .status-badge[data-status="PENDING"] { background: rgba(255,255,255,0.05); color: #888; border: 1px solid #333; }
        .status-badge[data-status="NONE"] { background: #222; color: #888; }
        
        .plans-selection { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .plan-option { background: #1a1a1a; border: 1px solid #333; padding: 20px; text-align: center; cursor: pointer; transition: 0.3s; border-radius: 8px; }
        .plan-option:hover { border-color: var(--red); }
        .plan-option.selected { border-color: var(--red); background: rgba(232,0,29,0.1); }
        .po-name { font-weight: 700; margin-bottom: 5px; }
        .po-price { color: var(--red); font-size: 20px; font-weight: 900; }

        .payment-upload-area { margin-top: 30px; padding-top: 30px; border-top: 1px solid #222; }

        .db-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .db-table th { text-align: left; color: #666; font-size: 12px; text-transform: uppercase; padding: 15px; border-bottom: 1px solid #222; }
        .db-table td { padding: 15px; border-bottom: 1px solid #111; font-size: 14px; }
        
        .tag-pending-verification, .tag-pending_verification { color: #888; }
        .tag-verified { color: #00ff64; }
        .tag-rejected { color: var(--red); }
        
        .db-form textarea { width: 100%; background: #1a1a1a; border: 1px solid #333; color: white; padding: 15px; border-radius: 8px; font-family: inherit; }
        .btn-logout { background: none; border: 1px solid #333; color: #888; padding: 10px; border-radius: 6px; cursor: pointer; margin-top: 10px; width: 100%; }
        .btn-logout:hover { color: var(--red); border-color: var(--red); }
        .db-info p { margin: 5px 0; color: #888; font-size: 14px; }

        @media (max-width: 768px) {
          .db-layout { flex-direction: column; }
          .db-sidebar { display: none; } /* Hide desktop sidebar */
          
          .db-header { 
            position: sticky;
            top: 0;
            background: rgba(5,5,5,0.8);
            backdrop-filter: blur(20px);
            z-index: 1000;
            margin: -20px -20px 30px -20px;
            padding: 20px;
            border-bottom: 1px solid #222;
          }
          .db-header-top { display: flex; justify-content: space-between; align-items: center; gap: 15px; text-align: left; }
          .db-mobile-logo { 
            display: block !important; 
            position: fixed !important;
            top: 5px !important; /* Matches 20px padding - 15px nudge */
            left: 10px !important; /* Matches 15px padding - 5px nudge */
            z-index: 3000 !important;
          }
          .db-mobile-logo img {
            height: 80px !important;
          }
          .db-header-text { flex: 1; margin-left: 90px; } 
          .db-header-text h1 { font-size: 24px !important; margin: 0 !important; line-height: 1.2; }
          .db-header-text p { font-size: 11px !important; margin: 2px 0 0 0 !important; }
          .dashboard-toggle { 
            display: flex !important; 
            position: fixed !important;
            top: 20px !important; 
            right: 15px !important; /* Moved slightly left from 10px */
            z-index: 3000 !important;
          }
          
          .db-main { padding: 30px 20px; }
          .db-header h1 { font-size: 32px; }
          .db-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; }
          .db-card { padding: 30px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 100%; box-sizing: border-box; }
          .db-card .btn-primary { width: 100%; margin-top: 15px; }
          .db-card.full { grid-column: span 1; }
          .plans-selection { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
