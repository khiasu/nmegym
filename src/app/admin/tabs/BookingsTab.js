// src/app/admin/tabs/BookingsTab.js
"use client";

import { useState } from "react";

export default function BookingsTab({ initialBookings }) {
  const [bookings, setBookings] = useState(initialBookings || []);

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === "PENDING").length;
  const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;

  return (
    <div className="admin-tab-content active" id="tab-bookings">
      <div className="admin-page-title">BOOKINGS</div>
      <div className="admin-page-sub">Free trial and class bookings</div>
      
      <div className="admin-stat-grid">
        <div className="admin-stat-card"><div className="admin-stat-val">{total}</div><div className="admin-stat-label">Total (May)</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">3</div><div className="admin-stat-label">Today</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">{confirmed}</div><div className="admin-stat-label">Confirmed</div></div>
        <div className="admin-stat-card"><div className="admin-stat-val">{pending}</div><div className="admin-stat-label">Pending</div></div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Upcoming Bookings</span></div>
        <div style={{overflowX: "auto"}}>
          <table className="admin-table" id="bookingsTable">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Date</th><th>Time</th><th>Interest</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const date = new Date(b.preferredDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                return (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{b.phone}</td>
                    <td>{date}</td>
                    <td>{b.preferredTimeSlot}</td>
                    <td>{b.interest}</td>
                    <td>
                      <span className={`status-badge ${b.status === 'CONFIRMED' ? 'status-active' : 'status-pending'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'PENDING' ? (
                        <button className="admin-btn-sm" onClick={() => {
                          setBookings(bookings.map(book => book.id === b.id ? {...book, status: "CONFIRMED"} : book));
                        }}>Confirm</button>
                      ) : (
                        <button className="admin-btn-sm outline">Done</button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && <tr><td colSpan="7" style={{textAlign: "center", padding: "20px", color: "var(--gray)"}}>No bookings found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
