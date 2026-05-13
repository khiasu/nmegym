// src/app/admin/AdminClient.js
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import DashboardTab from "./tabs/DashboardTab";
import MembersTab from "./tabs/MembersTab";
import PaymentsTab from "./tabs/PaymentsTab";
import PlansOffersTab from "./tabs/PlansOffersTab";
import TrainersTab from "./tabs/TrainersTab";
import FacilitiesTab from "./tabs/FacilitiesTab";
import BookingsTab from "./tabs/BookingsTab";
import SettingsTab from "./tabs/SettingsTab";
import TestimonialsTab from "./tabs/TestimonialsTab";

export default function AdminClient(props) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div id="page-admin">
      <div className="admin-top-bar">
        <div className="brand">
          <img src={props.settings?.logoUrl || "/newlogo.png"} alt="NME GYM" style={{ height: "34px", width: "auto" }} />
          <span>ADMIN</span>
        </div>
        <div className="admin-top-actions">
          <span className="admin-badge">Chumoukedima, Nagaland</span>
          <button className="admin-logout" onClick={() => signOut()}>← Logout</button>
        </div>
      </div>

      <div className="mobile-admin-nav">
        <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>📊 Dashboard</button>
        <button className={activeTab === "members" ? "active" : ""} onClick={() => setActiveTab("members")}>👥 Members</button>
        <button className={activeTab === "payments" ? "active" : ""} onClick={() => setActiveTab("payments")}>💳 Payments</button>
        <button className={activeTab === "plans" ? "active" : ""} onClick={() => setActiveTab("plans")}>🏷️ Plans & Offers</button>
        <button className={activeTab === "trainers" ? "active" : ""} onClick={() => setActiveTab("trainers")}>🏋️ Trainers</button>
        <button className={activeTab === "facilities" ? "active" : ""} onClick={() => setActiveTab("facilities")}>🏟️ Facilities</button>
        <button className={activeTab === "bookings" ? "active" : ""} onClick={() => setActiveTab("bookings")}>📅 Bookings</button>
        <button className={activeTab === "reviews" ? "active" : ""} onClick={() => setActiveTab("reviews")}>⭐ Reviews</button>
        <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>⚙️ Settings</button>
      </div>

      <div className="admin-body">
        <div className="admin-sidebar">
          <div className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <span className="nav-icon">📊</span>Dashboard
          </div>
          <div className={`admin-nav-item ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>
            <span className="nav-icon">👥</span>Members
          </div>
          <div className={`admin-nav-item ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>
            <span className="nav-icon">💳</span>Payments
          </div>
          <div className={`admin-nav-item ${activeTab === "plans" ? "active" : ""}`} onClick={() => setActiveTab("plans")}>
            <span className="nav-icon">🏷️</span>Plans & Offers
          </div>
          <div className={`admin-nav-item ${activeTab === "trainers" ? "active" : ""}`} onClick={() => setActiveTab("trainers")}>
            <span className="nav-icon">🏋️</span>Trainers
          </div>
          <div className={`admin-nav-item ${activeTab === "facilities" ? "active" : ""}`} onClick={() => setActiveTab("facilities")}>
            <span className="nav-icon">🏟️</span>Facilities
          </div>
          <div className={`admin-nav-item ${activeTab === "bookings" ? "active" : ""}`} onClick={() => setActiveTab("bookings")}>
            <span className="nav-icon">📅</span>Bookings
          </div>
          <div className={`admin-nav-item ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>
            <span className="nav-icon">⭐</span>Reviews
          </div>
          <div className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
            <span className="nav-icon">⚙️</span>Settings
          </div>
          
          <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)" }}>
            <a href="/" className="admin-nav-item" style={{ textDecoration: "none" }}>
              <span className="nav-icon">←</span>Back to Site
            </a>
          </div>
        </div>

        <div className="admin-main-content">
          <div style={{ display: activeTab === "dashboard" ? "block" : "none" }}>
            <DashboardTab {...props} setActiveTab={setActiveTab} />
          </div>
          <div style={{ display: activeTab === "members" ? "block" : "none" }}>
            <MembersTab members={props.members} />
          </div>
          <div style={{ display: activeTab === "payments" ? "block" : "none" }}>
            <PaymentsTab pendingPayments={props.pendingPayments} verifiedPayments={props.verifiedPayments} />
          </div>
          <div style={{ display: activeTab === "plans" ? "block" : "none" }}>
            <PlansOffersTab plans={props.plans} offers={props.offers} />
          </div>
          <div style={{ display: activeTab === "trainers" ? "block" : "none" }}>
            <TrainersTab initialTrainers={props.trainers} />
          </div>
          <div style={{ display: activeTab === "facilities" ? "block" : "none" }}>
            <FacilitiesTab initialFacilities={props.facilities} />
          </div>
          <div style={{ display: activeTab === "bookings" ? "block" : "none" }}>
            <BookingsTab initialBookings={props.bookings} />
          </div>
          <div style={{ display: activeTab === "settings" ? "block" : "none" }}>
            <SettingsTab initialSettings={props.settings} />
          </div>
          <div style={{ display: activeTab === "reviews" ? "block" : "none" }}>
            <TestimonialsTab />
          </div>
        </div>
      </div>
    </div>
  );
}
