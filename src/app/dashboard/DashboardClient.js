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

  const currentMembership = user.memberships[0];

  async function handlePaymentSubmit(e) {
    e.preventDefault();
    if (!selectedPlan || !screenshotUrl) {
      alert("Please select a plan and upload your payment screenshot.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          amount: selectedPlan.price,
          screenshotUrl,
          paymentMethod: "UPI",
        }),
      });

      if (res.ok) {
        alert("Payment submitted successfully! Admin will verify it shortly.");
        window.location.reload();
      } else {
        alert("Failed to submit payment.");
      }
    } catch (err) {
      alert("Error submitting payment.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="db-layout">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-brand">
          <img src="/newlogo.png" alt="NME GYM" />
        </div>
        <nav className="db-nav">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={activeTab === "membership" ? "active" : ""} onClick={() => setActiveTab("membership")}>My Membership</button>
          <button className={activeTab === "payments" ? "active" : ""} onClick={() => setActiveTab("payments")}>Payments</button>
          <button className={activeTab === "feedback" ? "active" : ""} onClick={() => setActiveTab("feedback")}>Feedback</button>
        </nav>
        <div className="db-footer">
          <button onClick={() => signOut()} className="btn-logout">Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="db-main">
        <header className="db-header">
          <h1>Welcome back, <span className="red">{user.firstName}</span></h1>
          <p className="gray">Member ID: {user.id.slice(-6).toUpperCase()}</p>
        </header>

        <section className="db-content">
          {activeTab === "overview" && (
            <div className="db-grid">
              {/* Membership Card */}
              <div className="db-card highlight">
                <h3>Current Status</h3>
                <div className="status-badge" data-status={currentMembership?.status || "NONE"}>
                  {currentMembership?.status || "NO ACTIVE PLAN"}
                </div>
                {currentMembership && (
                  <p className="db-info">
                    Plan: <strong>{currentMembership.planTier}</strong><br />
                    Expires: <strong>{currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString() : "N/A"}</strong>
                  </p>
                )}
                {!currentMembership && (
                  <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => setActiveTab("membership")}>Join Now</button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="db-card">
                <h3>Quick Actions</h3>
                <div className="db-actions">
                  <button className="btn-outline" onClick={() => setActiveTab("membership")}>Renew Plan</button>
                  <button className="btn-outline" onClick={() => setActiveTab("feedback")}>Send Feedback</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "membership" && (
            <div className="db-card full">
              <h3>Membership & Renewal</h3>
              <p className="gray">Choose a plan and pay via UPI. Upload your screenshot below.</p>

              <div className="plans-selection">
                {plans.map(plan => (
                  <div 
                    key={plan.id} 
                    className={`plan-option ${selectedPlan?.id === plan.id ? "selected" : ""}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <div className="po-name">{plan.name}</div>
                    <div className="po-price">₹{plan.price}</div>
                  </div>
                ))}
              </div>

              {selectedPlan && (
                <div className="payment-upload-area">
                  <div className="upi-details">
                    <p>Pay <strong>₹{selectedPlan.price}</strong> to:</p>
                    <div className="upi-id">nmegym@upi</div>
                  </div>

                  {!screenshotUrl ? (
                    <CldUploadWidget 
                      uploadPreset="nmegym_preset"
                      onSuccess={(result) => setScreenshotUrl(result.info.secure_url)}
                    >
                      {({ open }) => (
                        <button className="btn-upload" onClick={() => open()}>
                          Upload Payment Screenshot
                        </button>
                      )}
                    </CldUploadWidget>
                  ) : (
                    <div className="screenshot-preview">
                      <p className="green">✓ Screenshot Uploaded</p>
                      <button className="btn-primary" onClick={handlePaymentSubmit} disabled={uploading}>
                        {uploading ? "Submitting..." : `Confirm Payment for ${selectedPlan.name} →`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="db-card full">
              <h3>Payment History</h3>
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.payments.map(pay => (
                    <tr key={pay.id}>
                      <td>{new Date(pay.createdAt).toLocaleDateString()}</td>
                      <td>₹{pay.amount}</td>
                      <td>{pay.paymentMethod}</td>
                      <td>
                        <span className={`tag-${pay.status.toLowerCase()}`}>{pay.status.replace("_", " ")}</span>
                      </td>
                    </tr>
                  ))}
                  {user.payments.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: "center", padding: 40 }}>No payments found.</td></tr>
                  )}
                </tbody>
              </table>
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
        .db-nav { display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .db-nav button { background: none; border: none; color: #888; text-align: left; padding: 12px 15px; font-size: 16px; cursor: pointer; transition: 0.3s; border-radius: 6px; }
        .db-nav button:hover, .db-nav button.active { background: rgba(232,0,29,0.1); color: var(--red); }
        .db-main { flex: 1; padding: 60px; }
        .db-header { margin-bottom: 40px; }
        .db-header h1 { font-family: 'Bebas Neue', sans-serif; font-size: 48px; letter-spacing: 2px; }
        .db-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .db-card { background: #111; border: 1px solid #222; padding: 30px; border-radius: 12px; }
        .db-card.full { grid-column: span 2; }
        .db-card h3 { margin-bottom: 20px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #ccc; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 30px; font-weight: 700; font-size: 14px; margin-bottom: 15px; }
        .status-badge[data-status="ACTIVE"] { background: rgba(0,255,100,0.1); color: #00ff64; border: 1px solid #00ff64; }
        .status-badge[data-status="PENDING"] { background: rgba(255,200,0,0.1); color: #ffc800; border: 1px solid #ffc800; }
        .status-badge[data-status="NONE"] { background: #222; color: #888; }
        
        .plans-selection { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .plan-option { background: #1a1a1a; border: 1px solid #333; padding: 20px; text-align: center; cursor: pointer; transition: 0.3s; border-radius: 8px; }
        .plan-option:hover { border-color: var(--red); }
        .plan-option.selected { border-color: var(--red); background: rgba(232,0,29,0.1); }
        .po-name { font-weight: 700; margin-bottom: 5px; }
        .po-price { color: var(--red); font-size: 20px; font-weight: 900; }

        .payment-upload-area { margin-top: 30px; padding-top: 30px; border-top: 1px solid #222; text-align: center; }
        .upi-details { margin-bottom: 20px; }
        .upi-id { font-size: 24px; font-weight: 900; color: white; margin-top: 5px; letter-spacing: 1px; }
        .btn-upload { background: white; color: black; border: none; padding: 12px 30px; border-radius: 30px; font-weight: 700; cursor: pointer; }
        
        .db-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .db-table th { text-align: left; color: #666; font-size: 12px; text-transform: uppercase; padding: 15px; border-bottom: 1px solid #222; }
        .db-table td { padding: 15px; border-bottom: 1px solid #111; font-size: 14px; }
        
        .tag-pending_verification { color: #ffc800; }
        .tag-verified { color: #00ff64; }
        .tag-rejected { color: var(--red); }
        
        .db-form textarea { width: 100%; background: #1a1a1a; border: 1px solid #333; color: white; padding: 15px; border-radius: 8px; font-family: inherit; }
        .btn-logout { background: none; border: 1px solid #333; color: #888; padding: 10px; border-radius: 6px; cursor: pointer; margin-top: 20px; width: 100%; }
        .btn-logout:hover { color: var(--red); border-color: var(--red); }
      `}</style>
    </div>
  );
}
