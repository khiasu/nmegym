// src/app/admin/tabs/PaymentsTab.js
"use client";

import { useState } from "react";

export default function PaymentsTab({ pendingPayments: initialPending, verifiedPayments }) {
  const [pendingPayments, setPendingPayments] = useState(initialPending || []);
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
        setPendingPayments(pendingPayments.filter(p => p.id !== paymentId));
        alert(`Payment verified!`);
      }
    } catch (err) {
      alert("Action failed.");
    } finally {
      setProcessing(false);
    }
  }

  const totalRevenue = verifiedPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const formattedRevenue = totalRevenue > 100000 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : `₹${totalRevenue.toLocaleString()}`;

  const currentMonthName = new Date().toLocaleString('default', { month: 'short' });

  return (
    <div className="admin-tab-content active" id="tab-payments">
      <div className="admin-page-title">PAYMENTS</div>
      <div className="admin-page-sub">Verify and track all membership payments</div>
      
      <div className="admin-stat-grid">
        <div className="admin-stat-card"><div className="admin-stat-val">{formattedRevenue}</div><div className="admin-stat-label">{currentMonthName} Revenue</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">{pendingPayments.length}</div><div className="admin-stat-label">Pending Verify</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">{verifiedPayments?.length || 0}</div><div className="admin-stat-label">Paid ({currentMonthName})</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">0</div><div className="admin-stat-label">Overdue</div></div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Pending Verification</span></div>
        <div style={{overflowX: "auto"}}>
          <table className="admin-table">
            <thead>
              <tr><th>Member</th><th>Amount</th><th>Plan</th><th>Method</th><th>Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {pendingPayments.map(pay => {
                const planName = pay.user?.memberships?.[0]?.planTier || "Monthly";
                return (
                  <tr key={pay.id}>
                    <td>{pay.user.firstName} {pay.user.lastName}</td>
                    <td>₹{pay.amount}</td>
                    <td>{planName}</td>
                    <td>{pay.paymentMethod}</td>
                    <td>{new Date(pay.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td>
                      <button className="admin-btn-sm" onClick={() => handleVerify(pay.id, "VERIFIED")} disabled={processing}>Verify</button>
                    </td>
                  </tr>
                );
              })}
              {pendingPayments.length === 0 && (
                <tr><td colSpan="6" style={{textAlign: "center", padding: "20px", color: "var(--gray)"}}>No pending verifications.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Verified Payments</span></div>
        <div style={{overflowX: "auto"}}>
          <table className="admin-table">
            <thead>
              <tr><th>Member</th><th>Amount</th><th>Plan</th><th>Method</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {verifiedPayments?.map(pay => {
                const planName = pay.user?.memberships?.[0]?.planTier || "Monthly";
                return (
                  <tr key={pay.id}>
                    <td>{pay.user.firstName} {pay.user.lastName}</td>
                    <td>₹{pay.amount}</td>
                    <td>{planName}</td>
                    <td>{pay.paymentMethod}</td>
                    <td>{new Date(pay.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                    <td><span className="status-badge status-active">Verified</span></td>
                  </tr>
                );
              })}
              {(!verifiedPayments || verifiedPayments.length === 0) && (
                <tr><td colSpan="6" style={{textAlign: "center", padding: "20px", color: "var(--gray)"}}>No verified payments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
