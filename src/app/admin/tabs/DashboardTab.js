// src/app/admin/tabs/DashboardTab.js
"use client";

export default function DashboardTab({ members, verifiedPayments, pendingPayments, newRegistrations, bookings, setActiveTab }) {
  const activeMembers = members?.filter(m => m.memberships?.some(ms => ms.status === "ACTIVE"))?.length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "PENDING")?.length || 0;
  const regCount = newRegistrations?.length || 0;
  
  const totalRevenue = verifiedPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const formattedRevenue = totalRevenue > 100000 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : `₹${totalRevenue.toLocaleString()}`;

  const recentMembers = members?.slice(0, 5) || [];

  return (
    <div className="admin-tab-content active">
      <div className="admin-page-title">DASHBOARD</div>
      <div className="admin-page-sub">Live metrics, network status, and high-level gym operations</div>
      <div className="elite-stat-grid">
        <div className="elite-stat-card">
          <div className="elite-stat-val">{members?.length || 0}</div>
          <div className="elite-stat-label">TOTAL MEMBERS</div>
          <div style={{ color: "var(--elite-red)", fontSize: "10px", marginTop: "10px", fontWeight: "700" }}>↑ +18 THIS MONTH</div>
        </div>
        <div className="elite-stat-card">
          <div className="elite-stat-val">{activeMembers}</div>
          <div className="elite-stat-label">ACTIVE MEMBERS</div>
          <div style={{ color: "var(--elite-red)", fontSize: "10px", marginTop: "10px", fontWeight: "700" }}>↑ +6 vs LAST</div>
        </div>
        <div className="elite-stat-card">
          <div className="elite-stat-val">{formattedRevenue}</div>
          <div className="elite-stat-label">TOTAL REVENUE</div>
          <div style={{ color: "var(--elite-red)", fontSize: "10px", marginTop: "10px", fontWeight: "700" }}>↑ +12.4% GROWTH</div>
        </div>
        <div className="elite-stat-card">
          <div className="elite-stat-val">{bookings?.length || 0}</div>
          <div className="elite-stat-label">TRIAL BOOKINGS</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", marginTop: "10px", fontWeight: "700" }}>{pendingBookings} PENDING</div>
        </div>
      </div>

      {/* NEW REGISTRATIONS ALERT BANNER */}
      {regCount > 0 && (
        <div 
          style={{
            background: "linear-gradient(135deg, rgba(0,200,255,0.08), rgba(232,0,29,0.08))",
            border: "1px solid rgba(0,200,255,0.3)",
            borderRadius: "10px",
            padding: "20px 25px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "border-color 0.3s"
          }}
          onClick={() => setActiveTab("registrations")}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "#e8001d"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(0,200,255,0.3)"}
        >
          <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
            <div style={{
              width: "45px", height: "45px", borderRadius: "50%",
              background: "rgba(0,200,255,0.15)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "20px"
            }}>🆕</div>
            <div>
              <div style={{fontWeight: "bold", fontSize: "16px", color: "white"}}>
                {regCount} New Registration{regCount !== 1 ? "s" : ""} Pending
              </div>
              <div style={{fontSize: "13px", color: "#888", marginTop: "3px"}}>
                New members are waiting for your approval
              </div>
            </div>
          </div>
          <button 
            className="admin-btn-sm" 
            style={{background: "rgba(0,200,255,0.15)", color: "#00c8ff", border: "1px solid rgba(0,200,255,0.4)", padding: "8px 20px"}}
          >
            REVIEW NOW →
          </button>
        </div>
      )}

      <div className="admin-quick-actions">
        <button className="admin-quick-btn" onClick={() => setActiveTab("registrations")} style={{position: "relative"}}>
          <span className="qb-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          </span>
          New Registrations
          {regCount > 0 && (
            <span style={{
              position: "absolute", top: "8px", right: "8px",
              background: "#e8001d", color: "white", borderRadius: "10px",
              padding: "2px 6px", fontSize: "10px", fontWeight: "bold"
            }}>{regCount}</span>
          )}
        </button>
        <button className="admin-quick-btn" onClick={() => setActiveTab("payments")}>
          <span className="qb-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </span>
          Verify Payments
        </button>
        <button className="admin-quick-btn" onClick={() => setActiveTab("plans")}>
          <span className="qb-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </span>
          Manage Plans
        </button>
        <button className="admin-quick-btn" onClick={() => setActiveTab("settings")}>
          <span className="qb-icon">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </span>
          Settings
        </button>
      </div>

      <div className="elite-responsive-grid" style={{ gridTemplateColumns: "1fr" }}>
        <div className="elite-card">
          <div className="admin-section-card-header">
            <span className="admin-section-card-title">Revenue Distribution</span>
          </div>
          <div className="admin-revenue-bar">
            <span className="admin-revenue-bar-label">1 Year</span>
            <div className="admin-revenue-bar-track"><div className="admin-revenue-bar-fill" style={{width: "72%"}}></div></div>
            <span className="admin-revenue-bar-val">₹63.9k</span>
          </div>
          <div className="admin-revenue-bar">
            <span className="admin-revenue-bar-label">6 Months</span>
            <div className="admin-revenue-bar-track"><div className="admin-revenue-bar-fill" style={{width: "48%"}}></div></div>
            <span className="admin-revenue-bar-val">₹42.4k</span>
          </div>
          <div className="admin-revenue-bar">
            <span className="admin-revenue-bar-label">3 Months</span>
            <div className="admin-revenue-bar-track"><div className="admin-revenue-bar-fill" style={{width: "35%"}}></div></div>
            <span className="admin-revenue-bar-val">₹31.2k</span>
          </div>
        </div>
      </div>

      <div className="elite-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Recent Members</span>
          <button className="admin-btn-sm outline" onClick={() => setActiveTab("members")}>Expand All</button>
        </div>
        <div className="elite-table-wrapper">
          <table className="elite-table">
            <thead>
              <tr><th>Name</th><th>Plan</th><th>Joined</th><th>Expiry</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentMembers.map(m => {
                const membership = m.memberships?.[0];
                const plan = membership?.planTier || "Monthly";
                const isActive = membership?.status === "ACTIVE";
                const joined = new Date(m.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                const expires = membership?.endDate ? new Date(membership.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : "—";
                
                return (
                  <tr key={m.id}>
                    <td style={{ color: "#fff", fontWeight: "700" }}>{m.firstName} {m.lastName}</td>
                    <td>{plan}</td>
                    <td>{joined}</td>
                    <td>{expires}</td>
                    <td>
                      <span className={`status-badge ${isActive ? 'status-active' : 'status-expired'}`}>
                        {isActive ? 'Active' : 'Offline'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
