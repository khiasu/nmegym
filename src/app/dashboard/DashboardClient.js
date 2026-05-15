// src/app/dashboard/DashboardClient.js — Member Dashboard (Client Component)
"use client";

import { useState, useEffect, Suspense } from "react";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState({ text: "", type: "" });

  // Testimonial State
  const [testiContent, setTestiContent] = useState("");
  const [testiRating, setTestiRating] = useState(5);
  const [testiLoading, setTestiLoading] = useState(false);
  const [testiSuccess, setTestiSuccess] = useState(false);

  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["overview", "membership", "payments", "settings", "testimonials"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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

  // Scroll logic for hiding/showing header
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      
      if (currentScrollY > 100) {
        setHeaderVisible(currentScrollY < lastScrollY);
      } else {
        setHeaderVisible(true);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="db-layout">
      {/* Legacy sidebar removed — Using toggle menu exclusively */}

      {/* Redundant toggle removed — Header toggle is the only one now */}

      {/* MOBILE MENU — MIRRORING MAIN WEBSITE */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} id="mobileMenu">
        <div className="mm-bg-text">NME</div>
        
        <div className="mm-links">
          {[
            { id: "overview", name: "Overview" },
            { id: "membership", name: "Membership" },
            { id: "payments", name: "Payments" },
            { id: "settings", name: "Settings" },
            { id: "testimonials", name: "Testimonials" }
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
        <header className={`db-header ${!headerVisible ? "db-header-hidden" : ""} ${scrolled ? "db-header-scrolled" : ""}`}>
          <div className="db-header-inner">
            <Link href="/" className="db-logo-group">
              <img src="/newlogo.png" alt="NME GYM" className="db-logo-img" />
              <div className="db-header-text" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1 style={{ margin: 0, whiteSpace: 'nowrap' }}>Welcome back, <span className="red">{user.firstName}</span></h1>
                <div style={{ height: '15px', width: '1px', background: '#333' }}></div>
                <p className="gray" style={{ margin: 0, whiteSpace: 'nowrap', fontSize: '11px' }}>Member ID: <strong style={{color: "#e8001d", fontFamily: "monospace"}}>{memberId}</strong></p>
              </div>
            </Link>

            <div
              className={`hamburger dashboard-toggle ${mobileOpen ? "open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
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
              {/* Desktop Table View */}
              <div className="db-table-desktop" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="db-mobile-list">
                {user.payments.map(pay => (
                  <div key={pay.id} className="payment-card" style={{ textAlign: 'center', padding: '25px 15px' }}>
                    <div className="pc-value" style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>{new Date(pay.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="pc-value" style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '1px' }}>{pay.planName || "MEMBERSHIP"}</div>
                    <div className="pc-value red" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '15px' }}>₹{Number(pay.amount)}</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span className={`tag-${pay.status.toLowerCase().replace(/_/g, '-')}`}>
                        {pay.status === "PENDING_VERIFICATION" ? "⏳ Pending" : 
                         pay.status === "VERIFIED" ? "✓ Verified" : 
                         "✕ Rejected"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {user.payments.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#666", fontSize: "14px" }}>
                  No payments found. Select a plan to get started.
                </div>
              )}
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

          {activeTab === "testimonials" && (
            <div className="db-card full">
              <h3>Share Your Story</h3>
              <p className="gray">Your journey inspires others. Share your experience at NME GYM.</p>
              
              {testiSuccess ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ color: "#00ff64", fontSize: "48px", marginBottom: "15px" }}>✓</div>
                  <h4 style={{ color: "white", fontSize: "20px", marginBottom: "10px" }}>SUBMITTED FOR REVIEW</h4>
                  <p style={{ color: "#888", fontSize: "14px" }}>Thank you for sharing! Our team will review and publish your story soon.</p>
                  <button className="btn-primary" onClick={() => setTestiSuccess(false)} style={{ marginTop: "20px" }}>SUBMIT ANOTHER</button>
                </div>
              ) : (
                <form className="db-form" style={{ marginTop: 25, maxWidth: "600px" }} onSubmit={async (e) => {
                  e.preventDefault();
                  setTestiLoading(true);
                  try {
                    const res = await fetch("/api/testimonials", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: testiContent, rating: testiRating })
                    });
                    if (res.ok) setTestiSuccess(true);
                    else alert("Error submitting testimonial");
                  } catch (err) {
                    alert("Submission failed");
                  } finally {
                    setTestiLoading(false);
                  }
                }}>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", color: "#666", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase" }}>Your Experience</label>
                    <textarea 
                      placeholder="Tell us about your transformation, the environment, or the trainers..." 
                      rows="6" 
                      required
                      value={testiContent}
                      onChange={e => setTestiContent(e.target.value)}
                      style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", color: "white", padding: "15px", borderRadius: "8px", fontFamily: "inherit" }}
                    ></textarea>
                  </div>
                  <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", color: "#666", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase" }}>Rating</label>
                    <select 
                      value={testiRating} 
                      onChange={e => setTestiRating(e.target.value)}
                      style={{ width: "100%", background: "#1a1a1a", border: "1px solid #333", color: "white", padding: "12px", borderRadius: "8px" }}
                    >
                      <option value="5">★★★★★ (Excellent)</option>
                      <option value="4">★★★★☆ (Great)</option>
                      <option value="3">★★★☆☆ (Good)</option>
                      <option value="2">★★☆☆☆ (Fair)</option>
                      <option value="1">★☆☆☆☆ (Poor)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary" disabled={testiLoading} style={{ width: "100%", maxWidth: "200px" }}>
                    {testiLoading ? "SUBMITTING..." : "POST TESTIMONIAL →"}
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .db-layout { display: flex; min-height: 100vh; background: #050505; color: white; font-family: 'Barlow', sans-serif; }
        .db-sidebar { display: none !important; }
        .db-main { flex: 1; padding: 100px 20px 40px 20px; }
        .db-header { 
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background: transparent; 
          z-index: 5000;
          padding: 10px 20px;
          box-sizing: border-box;
          transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .db-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .db-logo-group {
          display: flex;
          align-items: center;
          gap: 15px;
          text-decoration: none;
        }
        .db-logo-img {
          height: 50px !important;
          object-fit: contain;
          margin-top: 0px;
        }
        .db-header-text h1 { font-family: 'Bebas Neue', sans-serif; font-size: 20px !important; margin: 0 !important; color: white; line-height: 1.1; letter-spacing: 1px; }
        .db-header-text p { font-size: 10px !important; margin: 0 !important; color: #888; }
        
        .db-header-hidden { transform: translateY(-100%); }
        .db-header-scrolled { background: rgba(5,5,5,0.8); backdrop-filter: blur(10px); }

        .dashboard-toggle { display: flex !important; position: relative !important; margin-top: 0px; }
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

        .db-mobile-list { display: none; }
        .payment-card { 
          background: #1a1a1a; 
          border: 1px solid #222; 
          border-radius: 8px; 
          padding: 15px; 
          margin-bottom: 12px; 
        }
        .pc-row { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 8px 0; 
          border-bottom: 1px solid rgba(255,255,255,0.05); 
        }
        .pc-row:last-child { border-bottom: none; }
        .pc-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .pc-value { font-size: 14px; color: white; }

        @media (max-width: 1024px) {
          .db-table-desktop { display: none; }
          .db-mobile-list { display: block; width: 100%; }
          .db-grid { display: flex; flex-direction: column; align-items: center; gap: 20px; width: 100%; }
          .db-card { width: 100% !important; padding: 40px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
          .db-card h3 { font-size: 28px !important; margin-bottom: 20px !important; }
          .db-card .btn-primary { width: 100%; max-width: 300px; margin-top: 20px; }
          .db-card.full { grid-column: span 1; text-align: center; align-items: center; }
          .plans-selection { grid-template-columns: 1fr 1fr !important; }
          .payment-card { width: 100% !important; box-sizing: border-box; }
        }
      `}</style>
    </div>
  );
}
