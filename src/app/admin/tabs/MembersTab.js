// src/app/admin/tabs/MembersTab.js
"use client";

import { useState } from "react";

export default function MembersTab({ members }) {
  const [search, setSearch] = useState("");

  const filteredMembers = members?.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.includes(search) || 
    m.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="admin-tab-content active" id="tab-members">
      <div className="admin-page-title">MEMBERS</div>
      <div className="admin-page-sub">Manage all registered members</div>
      
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Add New Member</span>
          <button className="admin-btn-sm" onClick={() => alert("Add member logic not implemented yet")}>Save Member</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label className="admin-label">Full Name</label><input className="admin-input" type="text" placeholder="Full name" /></div>
          <div className="admin-form-group"><label className="admin-label">Phone</label><input className="admin-input" type="tel" placeholder="+91 XXXXX XXXXX" /></div>
          <div className="admin-form-group"><label className="admin-label">Plan</label><select className="admin-input"><option>Monthly</option><option>3 Months</option><option>6 Months</option><option>1 Year</option></select></div>
          <div className="admin-form-group"><label className="admin-label">Join Date</label><input className="admin-input" type="date" /></div>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">All Members</span>
          <input 
            className="admin-input" 
            style={{width: "180px", padding: "6px 10px", fontSize: "12px"}} 
            placeholder="Search members..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{overflowX: "auto"}}>
          <table className="admin-table" id="membersTable">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Plan</th><th>Joined</th><th>Expires</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => {
                const membership = m.memberships?.[0];
                const plan = membership?.planTier || "Monthly";
                const isActive = membership?.status === "ACTIVE";
                const joinDate = new Date(m.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                const expiresDate = membership?.endDate ? new Date(membership.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : "—";
                return (
                  <tr key={m.id}>
                    <td>{m.firstName} {m.lastName}</td>
                    <td>{m.phone}</td>
                    <td>{plan}</td>
                    <td>{joinDate}</td>
                    <td>{expiresDate}</td>
                    <td>
                      <span className={`status-badge ${isActive ? 'status-active' : 'status-expired'}`}>
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td>
                      <button className="admin-toggle-btn" onClick={() => alert("Delete not implemented yet")}>🗑</button>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr><td colSpan="7" style={{textAlign: "center", padding: "30px", color: "var(--gray)"}}>No members found matching "{search}"</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
