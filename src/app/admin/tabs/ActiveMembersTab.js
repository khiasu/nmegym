// src/app/admin/tabs/ActiveMembersTab.js
"use client";

import React, { useState, useMemo } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getMonthLabel(year, month) {
  return `${MONTH_NAMES[month]} ${year}`;
}

function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999); // last ms of last day
  return { start, end };
}

export default function ActiveMembersTab({ members }) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [search, setSearch] = useState("");

  // Filter out session-pass members (daily visitors)
  const registeredMembers = useMemo(
    () => (members || []).filter(m => !m.memberships?.some(ms => ms.planTier?.toLowerCase().includes("session"))),
    [members]
  );

  // Compute available year range from memberships
  const availableYears = useMemo(() => {
    let minYear = now.getFullYear();
    let maxYear = now.getFullYear();
    registeredMembers.forEach(m => {
      (m.memberships || []).forEach(ms => {
        if (ms.startDate) {
          const y = new Date(ms.startDate).getFullYear();
          if (y < minYear) minYear = y;
        }
        if (ms.endDate) {
          const y = new Date(ms.endDate).getFullYear();
          if (y > maxYear) maxYear = y;
        }
      });
    });
    // Always include at least current year ± 1
    minYear = Math.min(minYear, now.getFullYear() - 1);
    maxYear = Math.max(maxYear, now.getFullYear() + 1);
    const years = [];
    for (let y = minYear; y <= maxYear; y++) years.push(y);
    return years;
  }, [registeredMembers, now]);

  // Find members active in the selected month
  const activeInMonth = useMemo(() => {
    const { start: monthStart, end: monthEnd } = getMonthRange(selectedYear, selectedMonth);

    return registeredMembers
      .map(m => {
        // Find the membership that overlaps with selected month
        const activeMembership = (m.memberships || []).find(ms => {
          if (ms.status !== "ACTIVE" && ms.status !== "EXPIRED") return false;
          const msStart = ms.startDate ? new Date(ms.startDate) : null;
          const msEnd = ms.endDate ? new Date(ms.endDate) : null;
          if (!msStart) return false;
          // Overlap: membership starts before month ends AND membership ends after month starts
          const startsBeforeMonthEnd = msStart <= monthEnd;
          const endsAfterMonthStart = msEnd ? msEnd >= monthStart : true; // no end = still active
          return startsBeforeMonthEnd && endsAfterMonthStart;
        });
        if (activeMembership) {
          return { ...m, _activeMembership: activeMembership };
        }
        return null;
      })
      .filter(Boolean);
  }, [registeredMembers, selectedYear, selectedMonth]);

  // Apply search filter
  const filteredActive = useMemo(() => {
    if (!search.trim()) return activeInMonth;
    const q = search.toLowerCase();
    return activeInMonth.filter(m =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.memberId?.toLowerCase().includes(q)
    );
  }, [activeInMonth, search]);

  // Compute monthly counts for the bar chart summary (all 12 months of selected year)
  const monthlyCounts = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const { start: mStart, end: mEnd } = getMonthRange(selectedYear, monthIdx);
      let count = 0;
      registeredMembers.forEach(m => {
        const hasActive = (m.memberships || []).some(ms => {
          if (ms.status !== "ACTIVE" && ms.status !== "EXPIRED") return false;
          const msStart = ms.startDate ? new Date(ms.startDate) : null;
          const msEnd = ms.endDate ? new Date(ms.endDate) : null;
          if (!msStart) return false;
          return msStart <= mEnd && (msEnd ? msEnd >= mStart : true);
        });
        if (hasActive) count++;
      });
      return count;
    });
  }, [registeredMembers, selectedYear]);

  const maxCount = Math.max(...monthlyCounts, 1);

  // Navigate months
  function goToPrevMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  }
  function goToNextMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  }

  return (
    <div className="admin-tab-content active" id="tab-active-members">
      <div className="admin-page-title">ACTIVE MEMBERS BY MONTH</div>
      <div className="admin-page-sub">View which members were active during each month</div>

      {/* Month/Year Selector */}
      <div className="admin-section-card" style={{ marginBottom: "20px" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "16px", padding: "8px 0", flexWrap: "wrap"
        }}>
          <button
            className="admin-btn-sm"
            onClick={goToPrevMonth}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "white", padding: "8px 14px", fontSize: "16px", cursor: "pointer", borderRadius: "6px"
            }}
          >
            ←
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <select
              className="admin-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{ width: "150px", textAlign: "center", fontSize: "14px", fontWeight: "bold" }}
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx}>{name}</option>
              ))}
            </select>
            <select
              className="admin-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ width: "100px", textAlign: "center", fontSize: "14px", fontWeight: "bold" }}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            className="admin-btn-sm"
            onClick={goToNextMonth}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "white", padding: "8px 14px", fontSize: "16px", cursor: "pointer", borderRadius: "6px"
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Annual Overview Bar Chart */}
      <div className="admin-section-card" style={{ marginBottom: "20px" }}>
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Monthly Overview — {selectedYear}</span>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Active member count per month</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "4px 0" }}>
          {monthlyCounts.map((count, idx) => {
            const isSelected = idx === selectedMonth;
            const barWidth = maxCount > 0 ? Math.max((count / maxCount) * 100, 2) : 2;
            return (
              <div
                key={idx}
                onClick={() => setSelectedMonth(idx)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px", cursor: "pointer",
                  padding: "4px 8px", borderRadius: "6px",
                  background: isSelected ? "rgba(232,0,29,0.08)" : "transparent",
                  transition: "background 0.2s"
                }}
              >
                <span style={{
                  width: "35px", fontSize: "11px", fontWeight: isSelected ? "800" : "500",
                  color: isSelected ? "#e8001d" : "rgba(255,255,255,0.5)",
                  textTransform: "uppercase", flexShrink: 0
                }}>
                  {MONTH_NAMES[idx].substring(0, 3)}
                </span>
                <div style={{
                  flex: 1, height: "18px", borderRadius: "4px",
                  background: "rgba(255,255,255,0.04)", overflow: "hidden", position: "relative"
                }}>
                  <div style={{
                    width: `${barWidth}%`, height: "100%", borderRadius: "4px",
                    background: isSelected
                      ? "linear-gradient(90deg, #e8001d, #ff4040)"
                      : "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
                    transition: "width 0.4s ease, background 0.3s"
                  }} />
                </div>
                <span style={{
                  width: "32px", textAlign: "right", fontSize: "12px", fontWeight: "bold",
                  color: isSelected ? "#e8001d" : "rgba(255,255,255,0.6)",
                  fontFamily: "monospace"
                }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Members List for Selected Month */}
      <div className="admin-section-card">
        <div className="admin-section-card-header" style={{ flexWrap: "wrap", gap: "10px" }}>
          <span className="admin-section-card-title">
            {getMonthLabel(selectedYear, selectedMonth)} — {filteredActive.length} Active Member{filteredActive.length !== 1 ? "s" : ""}
          </span>
          <input
            className="admin-input"
            style={{ width: "200px", padding: "6px 10px", fontSize: "12px" }}
            placeholder="Search by name, phone, email..."
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="elite-table-wrapper">
          <table className="admin-table" id="activeMonthlyTable">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Membership Start</th>
                <th>Membership End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredActive.map(m => {
                const ms = m._activeMembership;
                const startDate = ms?.startDate
                  ? new Date(ms.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : "—";
                const endDate = ms?.endDate
                  ? new Date(ms.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : "—";

                // Determine if still currently active (endDate in future or no endDate)
                const isCurrentlyActive = ms?.status === "ACTIVE" && (!ms.endDate || new Date(ms.endDate) >= new Date());

                return (
                  <tr key={m.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--red)', fontSize: '11px' }}>
                        {m.memberId || '—'}
                      </span>
                    </td>
                    <td><strong>{m.firstName} {m.lastName}</strong></td>
                    <td>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                        {m.phone || "—"}
                      </span>
                    </td>
                    <td>{ms?.planTier || "—"}</td>
                    <td>{startDate}</td>
                    <td>{endDate}</td>
                    <td>
                      <span className={`status-badge ${isCurrentlyActive ? 'status-active' : 'status-expired'}`}>
                        {isCurrentlyActive ? 'Active' : ms?.status || 'Expired'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredActive.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.3)" }}>
                    <div style={{ fontSize: "32px", marginBottom: "10px" }}>📭</div>
                    <div style={{ fontSize: "14px", fontWeight: "600" }}>No active members found for {getMonthLabel(selectedYear, selectedMonth)}</div>
                    <div style={{ fontSize: "12px", marginTop: "6px", color: "rgba(255,255,255,0.2)" }}>
                      Try selecting a different month or adjusting your search
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
