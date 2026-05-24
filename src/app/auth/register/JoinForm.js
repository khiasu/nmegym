"use client";
// src/app/auth/register/JoinForm.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";

export default function JoinForm({ settings, plans }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");

  const displayPlans = plans && plans.length > 0 ? plans : [
    { id: 'MONTHLY', name: 'Monthly', price: 999 },
    { id: '3_MONTHS', name: '3 Months', price: 2499 },
    { id: '6_MONTHS', name: '6 Months', price: 4499 },
    { id: 'ANNUAL', name: '1 Year', price: 7999 }
  ];

  const [selectedPlanId, setSelectedPlanId] = useState(displayPlans[0]?.id || "");

  const selectedPlanObj = displayPlans.find(p => p.id === selectedPlanId) || displayPlans[0];
  const planPrice = selectedPlanObj ? Number(selectedPlanObj.price) : 0;
  const admissionFee = Number(settings?.admissionFee) || 1000;
  const totalAmount = planPrice + admissionFee;

  const upiId = settings?.upiId || "nmegym@upi";
  const upiName = settings?.gymName || "NMEGym";
  const upiUri = `upi://pay?pa=${upiId}&pn=${upiName}&am=${totalAmount}&cu=INR`;
  const qrCodeUrl = settings?.upiQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!screenshotUrl) {
      setError("Please upload your payment screenshot");
      return;
    }
    
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.screenshotUrl = screenshotUrl;
    data.plan = selectedPlanId;

    try {
      const res = await fetch("/api/auth/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        const planName = selectedPlanObj?.name || "Membership Plan";
        const waUrl = `https://wa.me/${(settings?.whatsappNumber || "917005310568").replace(/\D/g, "")}?text=${encodeURIComponent(`Hello NME GYM Admin! 👋\n\nI have just submitted a registration payment of ₹${totalAmount} for the ${planName}.\n\n*My Details:*\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nPhone: ${data.phone}\n\nPlease verify my payment. Thank you!`)}`;
        localStorage.setItem("nme_pending_whatsapp_url", waUrl);

        router.push("/auth/register/success");
      } else {
        setError(result.error || "Submission failed");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <img src={settings?.logoUrl || "/newlogo.png"} alt={settings?.gymName || "NME GYM"} />
        </div>

        <h1 className="auth-title">Join {settings?.gymName || "NME GYM"}</h1>
        <p className="auth-subtitle">Pay fees via UPI and upload screenshot to get your Member ID.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            <div className="auth-field">
              <label>First Name</label>
              <input name="firstName" type="text" placeholder="John" required />
            </div>
            <div className="auth-field">
              <label>Last Name</label>
              <input name="lastName" type="text" placeholder="Doe" required />
            </div>
          </div>

          <div className="auth-field">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="john@example.com" required />
          </div>

          <div className="auth-field">
            <label>Phone Number</label>
            <input name="phone" type="tel" placeholder="+91 XXXXX XXXXX" required />
          </div>

          <div className="auth-field">
            <label>Select Plan</label>
            <select name="plan" value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} required>
              {displayPlans.map(p => (
                <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
              ))}
            </select>
          </div>

          {/* QR PAYMENT */}
          <div style={{ textAlign: 'center', margin: '20px 0', padding: '20px', background: 'rgba(232, 0, 29, 0.05)', border: '1px dashed var(--red, #e8001d)', borderRadius: '8px' }}>
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>SCAN TO PAY VIA ANY UPI APP</p>
            <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: '150px', height: '150px', borderRadius: '10px', background: 'white', padding: '10px', display: 'inline-block' }} />
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '15px', fontFamily: 'monospace', color: 'white', marginBottom: '5px' }}>{upiId}</p>
            <p style={{ fontSize: '12px', color: '#ccc', margin: 0 }}>
              Plan Price: ₹{planPrice} + Admission Fee: ₹{admissionFee} = <strong style={{ color: '#00ff64' }}>₹{totalAmount}</strong>
            </p>
          </div>

          <div className="auth-field">
            <label>Payment Screenshot</label>
            {!screenshotUrl ? (
              <CldUploadWidget 
                uploadPreset="nmegym_preset"
                onSuccess={(result) => setScreenshotUrl(result.info.secure_url)}
              >
                {({ open }) => (
                  <button type="button" className="btn-upload" onClick={() => open()} style={{ width: "100%", padding: 12, background: "#333", color: "white", border: "1px dashed #555", borderRadius: 6, cursor: "pointer" }}>
                    Upload Screenshot
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <div style={{ color: "#00ff64", fontSize: 14, textAlign: "center", padding: 10, border: "1px solid #00ff64", borderRadius: 6 }}>
                ✓ Screenshot Uploaded
              </div>
            )}
          </div>

          <div className="auth-field" style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10 }}>
            <input 
              type="checkbox" 
              id="terms" 
              required 
              style={{ width: "auto", marginTop: 4, cursor: "pointer" }}
            />
            <label htmlFor="terms" style={{ fontSize: 13, color: "#888", cursor: "pointer", userSelect: "none" }}>
              I agree to the <Link href="/legal" target="_blank" style={{ color: "var(--red)", textDecoration: "underline" }}>Terms and Conditions</Link> and <Link href="/legal" target="_blank" style={{ color: "var(--red)", textDecoration: "underline" }}>Refund Policy</Link> of {settings?.gymName || "NME GYM"}.
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? "Submitting..." : "Submit Join Request →"}
          </button>
        </form>

        <p className="auth-note">
          Already a member? <Link href="/auth/login" style={{ color: "var(--red)" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
