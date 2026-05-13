// src/app/admin/tabs/VerificationTab.js
"use client";

import { useState } from "react";

export default function VerificationTab({ initialPayments }) {
  const [payments, setPayments] = useState(initialPayments);
  const [processing, setProcessing] = useState(false);

  async function handleVerify(paymentId, status) {
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });

      if (res.ok) {
        setPayments(payments.filter(p => p.id !== paymentId));
        alert(`Payment ${status === "VERIFIED" ? "Approved" : "Rejected"}. Member notified.`);
      }
    } catch (err) {
      alert("Action failed.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="admin-tab-content active">
      <h2 className="admin-page-title">MEMBER VERIFICATION</h2>
      <p className="admin-page-sub">{payments.length} pending registration requests from the 'Join' form.</p>

      <div className="admin-section-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Contact Info</th>
              <th>Amount Paid</th>
              <th>Screenshot</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(pay => (
              <tr key={pay.id}>
                <td><strong>{pay.user.firstName} {pay.user.lastName}</strong></td>
                <td>{pay.user.email}<br /><span style={{ opacity: 0.5 }}>{pay.user.phone}</span></td>
                <td><span style={{ color: "var(--red)", fontWeight: 700 }}>₹{pay.amount}</span></td>
                <td>
                  <a href={pay.screenshotUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--red)", textDecoration: "none", fontSize: "11px", fontWeight: "bold" }}>
                    VIEW RECEIPT ↗
                  </a>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button 
                      className="admin-btn-sm" 
                      onClick={() => handleVerify(pay.id, "VERIFIED")}
                      disabled={processing}
                    >
                      APPROVE
                    </button>
                    <button 
                      className="admin-btn-sm outline" 
                      onClick={() => handleVerify(pay.id, "REJECTED")}
                      disabled={processing}
                    >
                      REJECT
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#444", fontSize: "14px" }}>
            No pending verifications at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
