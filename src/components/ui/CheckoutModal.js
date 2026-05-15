"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

export default function CheckoutModal({ isOpen, onClose, selectedPlan, session, settings, offers }) {
  const [isFirstTimer, setIsFirstTimer] = useState(!session);
  const [formData, setFormData] = useState({
    firstName: session?.user?.firstName || "",
    lastName: session?.user?.lastName || "",
    email: session?.user?.email || "",
    phone: session?.user?.phone || "",
  });
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [promoError, setPromoError] = useState("");

  if (!isOpen || !selectedPlan) return null;

  const admissionFee = 1000;
  const planPrice = Number(selectedPlan.price);
  
  // Calculate discount
  const discountAmount = appliedOffer ? Math.floor(planPrice * (appliedOffer.discount / 100)) : 0;
  const finalPlanPrice = planPrice - discountAmount;
  const totalAmount = isFirstTimer ? finalPlanPrice + admissionFee : finalPlanPrice;

  // Generate UPI URI
  const upiId = settings?.upiId || "nmegym@upi";
  const upiName = settings?.gymName || "NMEGym";
  const upiUri = `upi://pay?pa=${upiId}&pn=${upiName}&am=${totalAmount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  const handleApplyPromo = () => {
    setPromoError("");
    if (!promoCode) return;
    
    const offer = offers?.find(o => o.promoCode?.toLowerCase() === promoCode.toLowerCase() && o.isActive);
    if (offer) {
      setAppliedOffer(offer);
      setPromoError("");
    } else {
      setAppliedOffer(null);
      setPromoError("Invalid or expired code");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshotUrl) return setError("Please upload your payment screenshot.");
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          planName: selectedPlan.name,
          planPrice,
          admissionFee: isFirstTimer ? admissionFee : 0,
          totalAmount,
          screenshotUrl,
          isFirstTimer,
          userId: session?.user?.id,
          promoCode: appliedOffer ? promoCode : null
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      setSuccess(true);
      setScreenshotUrl("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay open`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '0' }}>
        <div className="modal-header" style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '24px', margin: 0 }}>SECURE CHECKOUT</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body" style={{ padding: '30px', maxHeight: '70vh', overflowY: 'auto' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ color: 'var(--red)', fontSize: '48px', marginBottom: '10px' }}>✓</div>
              <h4 style={{ fontFamily: 'Bebas Neue', fontSize: '28px' }}>PAYMENT SUBMITTED</h4>
              <p style={{ color: 'var(--gray)', fontSize: '14px', marginTop: '10px', marginBottom: '20px' }}>
                Your payment is pending verification by our team. <br/>
                {isFirstTimer && "Once verified, your login credentials will be emailed to you."}
              </p>
              
              <a 
                href={`https://wa.me/919863765861?text=${encodeURIComponent(`Hello NME GYM Admin! 👋\n\nI have just submitted a payment of ₹${totalAmount} for the ${selectedPlan.name} plan.\n\n*My Details:*\nName: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nPlease verify my payment. Thank you!`)}`}
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
                onClick={(e) => {
                  // Don't auto-close if they click the WhatsApp button
                  e.stopPropagation();
                }}
              >
                💬 Notify Admin via WhatsApp
              </a>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '15px' }}>
                Clicking the button above will open WhatsApp with your details pre-filled.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              
              {/* PLAN SUMMARY */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--gray)' }}>Plan: {selectedPlan.name}</span>
                  <span style={{ fontWeight: 'bold' }}>₹{planPrice}</span>
                </div>

                {appliedOffer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#00ff64' }}>
                    <span>Discount ({appliedOffer.discount}%):</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <label style={{ color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isFirstTimer} 
                      onChange={(e) => setIsFirstTimer(e.target.checked)}
                    />
                    First-Time Admission Fee
                  </label>
                  <span style={{ fontWeight: 'bold' }}>+ ₹{admissionFee}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>TOTAL TO PAY</span>
                  <span style={{ color: 'var(--red)', fontWeight: 'bold', fontSize: '20px' }}>₹{totalAmount}</span>
                </div>
              </div>

              {/* PROMO CODE */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{ fontSize: '11px', color: 'var(--gray)', marginBottom: '8px', display: 'block' }}>PROMO CODE</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    value={promoCode} 
                    onChange={e => setPromoCode(e.target.value)} 
                    className="admin-input" 
                    style={{ flex: 1, margin: 0 }}
                  />
                  <button 
                    type="button" 
                    onClick={handleApplyPromo}
                    className="admin-btn-sm outline" 
                    style={{ padding: '0 20px', border: '1px solid var(--elite-red)', color: 'var(--elite-red)' }}
                  >
                    APPLY
                  </button>
                </div>
                {promoError && <p style={{ color: 'var(--red)', fontSize: '11px', marginTop: '5px' }}>{promoError}</p>}
                {appliedOffer && <p style={{ color: '#00ff64', fontSize: '11px', marginTop: '5px' }}>✓ Code applied! You save ₹{discountAmount}</p>}
              </div>

              {/* USER DETAILS */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>FIRST NAME</label>
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="admin-input" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>LAST NAME</label>
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="admin-input" />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>EMAIL</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="admin-input" />
              </div>
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label>PHONE (WHATSAPP PREFERRED)</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="admin-input" />
              </div>

              {/* QR PAYMENT */}
              <div style={{ textAlign: 'center', marginBottom: '25px', padding: '20px', background: 'rgba(232, 0, 29, 0.05)', border: '1px dashed var(--red)', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '15px' }}>SCAN TO PAY VIA ANY UPI APP</p>
                <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: '150px', height: '150px', borderRadius: '10px', background: 'white', padding: '10px', display: 'inline-block' }} />
                <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '15px' }}>{upiId}</p>
              </div>

              {/* SCREENSHOT UPLOAD */}
              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label>UPLOAD PAYMENT SCREENSHOT *</label>
                {!screenshotUrl ? (
                  <CldUploadWidget uploadPreset="nmegym_preset" onSuccess={(res) => setScreenshotUrl(res.info.secure_url)}>
                    {({ open }) => (
                      <button type="button" onClick={() => open()} style={{ width: '100%', padding: '15px', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '4px', cursor: 'pointer', transition: '0.3s' }}>
                        + Click to Upload Screenshot
                      </button>
                    )}
                  </CldUploadWidget>
                ) : (
                  <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={screenshotUrl} alt="Screenshot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setScreenshotUrl("")} style={{ position: 'absolute', top: 5, right: 5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                  </div>
                )}
              </div>

              {error && <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
              
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? "SUBMITTING..." : "CONFIRM PAYMENT"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
