// src/app/admin/members/[id]/page.js
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({ params }) {
  const session = await auth();

  // Protect route: Redirect to login if not authenticated
  if (!session) {
    return redirect("/auth/login?callbackUrl=/admin");
  }

  // Redirect to home if not an ADMIN
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  // Fetch the specific member with ALL their memberships and payments
  const member = await prisma.user.findUnique({
    where: { id },
    include: {
      memberships: {
        orderBy: { createdAt: "desc" }
      },
      payments: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!member || member.role !== "MEMBER") {
    return (
      <div className="admin-container" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "white" }}>Member Not Found</h2>
        <Link href="/admin?tab=members" className="admin-btn-sm" style={{ display: "inline-block", marginTop: "20px" }}>
          Back to Admin Portal
        </Link>
      </div>
    );
  }

  const latestMembership = member.memberships[0];
  const isActive = latestMembership?.status === "ACTIVE";
  
  // Format dates
  const joinDate = new Date(member.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  // WhatsApp Link generation
  const cleanPhone = (member.phone || "").replace(/\D/g, "");
  let waLink = null;

  if (cleanPhone) {
    const gymName = "NME GYM"; // Could fetch from settings, hardcoded for simplicity as in other places
    const statusText = isActive ? "ACTIVE" : "EXPIRED";
    const expiresDate = latestMembership?.endDate 
      ? new Date(latestMembership.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : "N/A";
    const planName = latestMembership?.planTier || "N/A";

    let message = `Hi ${member.firstName}, this is an update from ${gymName}.\n\n`;
    message += `*Your Membership Details:*\n`;
    message += `Member ID: ${member.memberId || "N/A"}\n`;
    message += `Status: ${statusText}\n`;
    message += `Plan: ${planName}\n`;
    if (isActive) {
      message += `Valid Until: ${expiresDate}\n\n`;
    } else {
      message += `Expired On: ${expiresDate}\n\n`;
      message += `Please renew your membership to continue your fitness journey!\n\n`;
    }
    message += `Let's grind! 🏋️‍♂️`;

    const encodedMessage = encodeURIComponent(message);
    waLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  return (
    <div className="admin-container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <div className="admin-page-title">MEMBER PROFILE</div>
          <div className="admin-page-sub">Detailed history and records for {member.firstName} {member.lastName}</div>
        </div>
        <Link 
          href="/admin?tab=members" 
          className="admin-btn-sm outline" 
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}
        >
          ← Back to Members
        </Link>
      </div>

      <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginBottom: "30px" }}>
        {/* Profile Card */}
        <div className="admin-section-card" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ color: "white", fontSize: "24px", margin: "0 0 5px 0" }}>{member.firstName} {member.lastName}</h2>
              <div style={{ color: "var(--red)", fontFamily: "monospace", fontSize: "16px", fontWeight: "bold" }}>
                {member.memberId || "No ID"}
              </div>
            </div>
            <span className={`status-badge ${isActive ? 'status-active' : 'status-expired'}`} style={{ fontSize: "14px", padding: "6px 12px" }}>
              {isActive ? 'ACTIVE' : 'EXPIRED'}
            </span>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "gray", fontSize: "12px", textTransform: "uppercase" }}>Phone</span>
                <span style={{ color: "white", fontSize: "14px" }}>{member.phone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "gray", fontSize: "12px", textTransform: "uppercase" }}>Email</span>
                <span style={{ color: "white", fontSize: "14px" }}>{member.email || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "gray", fontSize: "12px", textTransform: "uppercase" }}>Joined Since</span>
                <span style={{ color: "white", fontSize: "14px" }}>{joinDate}</span>
              </div>
            </div>
          </div>

          {waLink ? (
             <a 
               href={waLink} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="admin-btn-sm" 
               style={{ 
                 background: "#25D366", 
                 borderColor: "#25D366", 
                 color: "white", 
                 fontWeight: "bold",
                 textDecoration: "none",
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 gap: "8px",
                 padding: "12px",
                 marginTop: "auto"
               }}
             >
               <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.364a9.92 9.92 0 0 0 4.804 1.232h.006c5.505 0 9.99-4.478 9.99-9.985a9.97 9.97 0 0 0-2.927-7.062A9.92 9.92 0 0 0 12.012 2zm5.772 14.195c-.32.9-1.84 1.76-2.54 1.87-.6.09-1.38.16-3.89-.87-3.21-1.32-5.24-4.57-5.4-4.78-.17-.22-1.35-1.78-1.35-3.4 0-1.62.83-2.42 1.13-2.73.25-.26.66-.38.96-.38.1 0 .21 0 .3.01.27.01.41.03.6.48.24.58.83 2.01.9 2.16.07.15.12.33.02.53-.1.2-.15.33-.3.49-.15.17-.32.38-.45.51-.15.15-.31.32-.13.63.18.3.8 1.32 1.72 2.14 1.19 1.06 2.19 1.39 2.5 1.54.31.15.49.12.68-.09.19-.22.82-.95 1.04-1.28.22-.33.44-.27.75-.15.31.12 1.96.93 2.3 1.09.34.16.57.24.65.38.09.14.09.81-.23 1.71z"/>
               </svg>
               SEND DETAILS VIA WHATSAPP
             </a>
          ) : (
            <div style={{ padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", textAlign: "center", color: "gray", fontSize: "12px", marginTop: "auto" }}>
              No valid WhatsApp number available
            </div>
          )}
        </div>

        {/* Current Membership Snapshot */}
        <div className="admin-section-card">
          <div className="admin-section-card-header">
            <span className="admin-section-card-title">Latest Membership</span>
          </div>
          {latestMembership ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "gray", textTransform: "uppercase" }}>Plan Tier</div>
                <div style={{ fontSize: "20px", color: "white", fontWeight: "bold" }}>{latestMembership.planTier}</div>
              </div>
              <div style={{ display: "flex", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "gray", textTransform: "uppercase" }}>Start Date</div>
                  <div style={{ fontSize: "15px", color: "white" }}>
                    {latestMembership.startDate ? new Date(latestMembership.startDate).toLocaleDateString('en-GB') : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "gray", textTransform: "uppercase" }}>End Date</div>
                  <div style={{ fontSize: "15px", color: isActive ? "#00ff64" : "var(--red)", fontWeight: "bold" }}>
                    {latestMembership.endDate ? new Date(latestMembership.endDate).toLocaleDateString('en-GB') : "—"}
                  </div>
                </div>
              </div>
              {latestMembership.notes && (
                <div style={{ marginTop: "10px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", borderLeft: "3px solid var(--red)" }}>
                  <div style={{ fontSize: "11px", color: "gray", marginBottom: "4px" }}>NOTES</div>
                  <div style={{ fontSize: "13px", color: "#ccc" }}>{latestMembership.notes}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: "gray", fontSize: "14px", fontStyle: "italic" }}>No membership records found.</div>
          )}
        </div>
      </div>

      {/* Complete Membership History */}
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Complete Membership History</span>
          <span style={{ fontSize: "12px", color: "gray" }}>{member.memberships.length} Records</span>
        </div>
        
        {member.memberships.length > 0 ? (
          <div className="elite-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Plan Tier</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Recorded On</th>
                </tr>
              </thead>
              <tbody>
                {member.memberships.map((ms, index) => {
                  const isCurrent = index === 0;
                  return (
                    <tr key={ms.id} style={{ background: isCurrent ? "rgba(232,0,29,0.05)" : "transparent" }}>
                      <td>
                        <strong>{ms.planTier}</strong>
                        {isCurrent && <span style={{ marginLeft: "8px", fontSize: "10px", background: "var(--red)", color: "white", padding: "2px 6px", borderRadius: "10px" }}>LATEST</span>}
                      </td>
                      <td>{ms.startDate ? new Date(ms.startDate).toLocaleDateString('en-GB') : "—"}</td>
                      <td>{ms.endDate ? new Date(ms.endDate).toLocaleDateString('en-GB') : "—"}</td>
                      <td>
                        <span className={`status-badge ${ms.status === "ACTIVE" ? 'status-active' : 'status-expired'}`}>
                          {ms.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={ms.notes || ""}>
                        {ms.notes || <span style={{ opacity: 0.3 }}>—</span>}
                      </td>
                      <td style={{ color: "gray", fontSize: "12px" }}>
                        {new Date(ms.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "30px", textAlign: "center", color: "gray" }}>
            No membership history available for this member.
          </div>
        )}
      </div>

    </div>
  );
}
