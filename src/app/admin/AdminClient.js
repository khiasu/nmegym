// src/app/admin/AdminClient.js
"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import DashboardTab from "./tabs/DashboardTab";
import MembersTab from "./tabs/MembersTab";
import RegistrationsTab from "./tabs/RegistrationsTab";
import PaymentsTab from "./tabs/PaymentsTab";
import PlansOffersTab from "./tabs/PlansOffersTab";
import TrainersTab from "./tabs/TrainersTab";
import FacilitiesTab from "./tabs/FacilitiesTab";
import BookingsTab from "./tabs/BookingsTab";
import SettingsTab from "./tabs/SettingsTab";
import TestimonialsTab from "./tabs/TestimonialsTab";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import AlertModal from "@/components/ui/AlertModal";
import ToastNotification from "@/components/ui/ToastNotification";

export default function AdminClient(props) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // GLOBAL CUSTOM ALERT STATE
  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });
  
  // GLOBAL TOAST / UNDO STATE
  const [toastState, setToastState] = useState(null); // { message, executeData, timerId }

  const executeWithUndo = ({ message, executeFunction, revertUI }) => {
    // 1. Immediately revert the UI to simulate completion
    revertUI();
    
    // 2. Set a 10-second timer to actually execute the backend API
    const timerId = setTimeout(() => {
      executeFunction();
      setToastState(null);
    }, 10000);

    // 3. Show the toast with the Undo callback
    setToastState({
      message,
      onUndo: () => {
        clearTimeout(timerId); // Stop the API from firing
        setToastState(null);
        // We do not need a reverse API call because it never hit the database!
        // But we would need to refresh the tab data or pass a reverse UI function.
        // For now, reloading the page or fetching data works, but ideally revertUI handles it.
        window.location.reload(); 
      },
      onClose: () => {
        // If it naturally closes, the timer has already fired the API
        setToastState(null);
      }
    });
  };

  useEffect(() => {
    // Intercept all native alerts across the entire portal
    const originalAlert = window.alert;
    window.alert = (message) => {
      setAlertState({ isOpen: true, message });
    };
    return () => {
      window.alert = originalAlert; // Cleanup on unmount
    };
  }, []);

  // GLOBAL SECURE CONFIRMATION STATE
  const [modalState, setModalState] = useState({ 
    isOpen: false, title: "", message: "", isCritical: false, onConfirm: null, loading: false 
  });

  const requestConfirmation = ({ title, message, isCritical, onConfirm }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      isCritical,
      loading: false,
      onConfirm: async (password) => {
        setModalState(s => ({ ...s, loading: true }));
        try {
          await onConfirm(password);
        } catch (e) {
          console.error(e);
        } finally {
          setModalState(s => ({ ...s, isOpen: false, loading: false }));
        }
      }
    });
  };

  const regCount = props.newRegistrations?.length || 0;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
    { id: "registrations", label: "New Registrations", badge: regCount, icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> },
    { id: "members", label: "Members", icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { id: "payments", label: "Payments", icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> },
    { id: "plans", label: "Plans & Offers", icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> },
    { id: "trainers", label: "Trainers", icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v8H2z"></path><line x1="6" y1="20" x2="6" y2="4"></line><line x1="14" y1="20" x2="14" y2="4"></line></svg> },
    { id: "facilities", label: "Facilities", icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    { id: "bookings", label: "Bookings", icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    { id: "testimonials", label: "Testimonials", icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> },
    { id: "settings", label: "Settings", icon: <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
  ];

  return (
    <div id="page-admin">
      {/* GLOBAL BRAND ANCHOR & MOBILE HEADER */}
      <div className="admin-global-header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <img 
            src={props.settings?.logoUrl || "/newlogo.png"} 
            alt="NME GYM" 
            className="nav-logo-img" 
          />
          <span className="admin-portal-title">ADMIN</span>
        </div>
        
        {/* HAMBURGER TOGGLE (Mobile Only) */}
        <div 
          className={`hamburger admin-hamburger ${mobileMenuOpen ? "open" : ""}`} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="admin-body-elite">
        {/* COMPACT GLASSMORPHIC SIDEBAR (Toggleable on Mobile) */}
        <div className={`admin-sidebar-elite ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <div className="admin-nav-stack">
            {navItems.map(item => (
              <div 
                key={item.id}
                className={`nav-item-elite ${activeTab === item.id ? "active" : ""}`} 
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false); // Auto-close on mobile selection
                }}
                style={{position: "relative"}}
              >
                <span className="nav-icon-elite">{item.icon}</span>
                {item.label}
                {/* Badge for new registrations count */}
                {item.badge > 0 && (
                  <span style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    background: "#e8001d", color: "white", borderRadius: "10px",
                    padding: "2px 7px", fontSize: "10px", fontWeight: "bold",
                    minWidth: "18px", textAlign: "center", lineHeight: "14px",
                    animation: "pulse 2s infinite"
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <div className="admin-sidebar-footer">
            <button className="admin-logout-btn-sidebar" onClick={() => signOut()}>LOGOUT</button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="admin-main-elite" key={activeTab}>
          {activeTab === "dashboard" && <DashboardTab {...props} setActiveTab={setActiveTab} />}
          {activeTab === "registrations" && <RegistrationsTab newRegistrations={props.newRegistrations} requestConfirmation={requestConfirmation} executeWithUndo={executeWithUndo} />}
          {activeTab === "members" && <MembersTab members={props.members} requestConfirmation={requestConfirmation} executeWithUndo={executeWithUndo} />}
          {activeTab === "payments" && <PaymentsTab pendingPayments={props.pendingPayments} verifiedPayments={props.verifiedPayments} requestConfirmation={requestConfirmation} executeWithUndo={executeWithUndo} />}
          {activeTab === "plans" && <PlansOffersTab plans={props.plans} offers={props.offers} requestConfirmation={requestConfirmation} executeWithUndo={executeWithUndo} />}
          {activeTab === "trainers" && <TrainersTab initialTrainers={props.trainers} requestConfirmation={requestConfirmation} executeWithUndo={executeWithUndo} />}
          {activeTab === "facilities" && <FacilitiesTab initialFacilities={props.facilities} requestConfirmation={requestConfirmation} executeWithUndo={executeWithUndo} />}
          {activeTab === "bookings" && <BookingsTab initialBookings={props.bookings} requestConfirmation={requestConfirmation} executeWithUndo={executeWithUndo} />}
          {activeTab === "settings" && <SettingsTab initialSettings={props.settings} requestConfirmation={requestConfirmation} executeWithUndo={executeWithUndo} />}
          {activeTab === "testimonials" && <TestimonialsTab requestConfirmation={requestConfirmation} executeWithUndo={executeWithUndo} />}
        </div>
      </div>

      <ConfirmationModal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        isCritical={modalState.isCritical}
        loading={modalState.loading}
        onConfirm={modalState.onConfirm}
        onCancel={() => setModalState(s => ({ ...s, isOpen: false }))}
      />

      <AlertModal 
        isOpen={alertState.isOpen} 
        message={alertState.message} 
        onClose={() => setAlertState({ isOpen: false, message: "" })} 
      />

      {toastState && (
        <ToastNotification 
          message={toastState.message}
          onUndo={toastState.onUndo}
          onClose={toastState.onClose}
          duration={10000}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
