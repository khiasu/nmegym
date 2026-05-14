// src/app/admin/tabs/BookingsTab.js
"use client";

import { useState } from "react";

export default function BookingsTab({ initialBookings, requestConfirmation }) {
  const [bookings, setBookings] = useState(initialBookings || []);
  const [processing, setProcessing] = useState(null);

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === "PENDING").length;
  const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;

  async function updateStatus(id, status) {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setProcessing(null);
    }
  }

  function deleteBooking(id) {
    if (!requestConfirmation) {
      if (!confirm("Remove this booking?")) return;
      return executeDelete(id);
    }
    requestConfirmation({
      title: "DELETE BOOKING",
      message: "Are you sure you want to remove this booking from the system?",
      isCritical: false,
      onConfirm: async () => {
        await executeDelete(id);
      }
    });
  }

  async function executeDelete(id) {
    try {
      const res = await fetch(`/api/admin/bookings?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setBookings(bookings.filter(b => b.id !== id));
      }
    } catch (err) {
      alert("Failed to delete");
    }
  }

  return (
    <div className="admin-tab-content active" id="tab-bookings">
      <div className="admin-page-title">TRIAL BOOKINGS</div>
      <div className="admin-page-sub">Manage free trial and class bookings</div>
      
      <div className="admin-stat-grid">
        <div className="admin-stat-card"><div className="admin-stat-val">{total}</div><div className="admin-stat-label">Total Leads</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">{confirmed}</div><div className="admin-stat-label">Confirmed</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">{pending}</div><div className="admin-stat-label">Pending</div></div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Recent Requests</span></div>
        <div style={{overflowX: "auto"}}>
          <table className="admin-table" id="bookingsTable">
            <thead>
              <tr><th>Date</th><th>Name</th><th>Phone</th><th>Interest</th><th>Slot</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{new Date(b.preferredDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                  <td><strong>{b.name}</strong></td>
                  <td>{b.phone}</td>
                  <td>{b.interest}</td>
                  <td>{b.preferredTimeSlot}</td>
                  <td>
                    <span className={`status-badge ${b.status === 'CONFIRMED' ? 'status-active' : b.status === 'PENDING' ? 'status-pending' : 'status-expired'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div style={{display: "flex", gap: "6px"}}>
                      {b.status === 'PENDING' && (
                        <button className="admin-btn-sm" onClick={() => updateStatus(b.id, 'CONFIRMED')} disabled={processing === b.id}>
                          {processing === b.id ? "..." : "Confirm"}
                        </button>
                      )}
                      <button className="admin-toggle-btn" onClick={() => deleteBooking(b.id)}>
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="7" style={{textAlign: "center", padding: "40px", color: "var(--gray)"}}>No bookings found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
