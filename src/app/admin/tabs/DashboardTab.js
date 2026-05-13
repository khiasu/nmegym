// src/app/admin/tabs/DashboardTab.js
"use client";

export default function DashboardTab({ members, verifiedPayments, pendingPayments, bookings, setActiveTab }) {
  const activeMembers = members?.filter(m => m.memberships?.some(ms => ms.status === "ACTIVE"))?.length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "PENDING")?.length || 0;
  
  const totalRevenue = verifiedPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const formattedRevenue = totalRevenue > 100000 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : `₹${totalRevenue.toLocaleString()}`;

  const recentMembers = members?.slice(0, 5) || [];

  return (
    <div className="admin-tab-content active" id="tab-dashboard">
      <div className="admin-page-title">DASHBOARD</div>
      <div className="admin-page-sub">Welcome back, Admin · {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
      
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-val">{members?.length || 0}</div>
          <div className="admin-stat-label">Total Members</div>
          <div className="admin-stat-trend">↑ +18 this month</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-val">{activeMembers}</div>
          <div className="admin-stat-label">Active (May)</div>
          <div className="admin-stat-trend">↑ +6 vs April</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-val">{formattedRevenue}</div>
          <div className="admin-stat-label">Revenue (May)</div>
          <div className="admin-stat-trend">↑ +12% vs last</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-val">{bookings?.length || 0}</div>
          <div className="admin-stat-label">Trial Bookings</div>
          <div className="admin-stat-trend">↑ {pendingBookings} pending</div>
        </div>
      </div>

      <div className="admin-quick-actions">
        <button className="admin-quick-btn" onClick={() => setActiveTab("members")}><span className="qb-icon">➕</span>Add Member</button>
        <button className="admin-quick-btn" onClick={() => setActiveTab("payments")}><span className="qb-icon">✅</span>Verify Payment</button>
        <button className="admin-quick-btn" onClick={() => setActiveTab("blog")}><span className="qb-icon">📝</span>New Post</button>
        <button className="admin-quick-btn" onClick={() => setActiveTab("plans")}><span className="qb-icon">🏷️</span>New Offer</button>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Revenue by Plan (May)</span></div>
        <div className="admin-revenue-bar"><span className="admin-revenue-bar-label">1 Year</span><div className="admin-revenue-bar-track"><div className="admin-revenue-bar-fill" style={{width: "72%"}}></div></div><span className="admin-revenue-bar-val">₹63,992</span></div>
        <div className="admin-revenue-bar"><span className="admin-revenue-bar-label">6 Months</span><div className="admin-revenue-bar-track"><div className="admin-revenue-bar-fill" style={{width: "48%"}}></div></div><span className="admin-revenue-bar-val">₹42,483</span></div>
        <div className="admin-revenue-bar"><span className="admin-revenue-bar-label">3 Months</span><div className="admin-revenue-bar-track"><div className="admin-revenue-bar-fill" style={{width: "35%"}}></div></div><span className="admin-revenue-bar-val">₹31,240</span></div>
        <div className="admin-revenue-bar"><span className="admin-revenue-bar-label">Monthly</span><div className="admin-revenue-bar-track"><div className="admin-revenue-bar-fill" style={{width: "20%"}}></div></div><span className="admin-revenue-bar-val">₹17,982</span></div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Recent Members</span>
          <button className="admin-btn-sm outline" onClick={() => setActiveTab("members")}>View All</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Plan</th><th>Joined</th><th>Expires</th><th>Status</th></tr>
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
                  <td>{m.firstName} {m.lastName}</td>
                  <td>{plan}</td>
                  <td>{joined}</td>
                  <td>{expires}</td>
                  <td>
                    <span className={`status-badge ${isActive ? 'status-active' : 'status-expired'}`}>
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {recentMembers.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "var(--gray)" }}>No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
