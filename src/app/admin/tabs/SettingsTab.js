// src/app/admin/tabs/SettingsTab.js
"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

export default function SettingsTab({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [saving, setSaving] = useState(false);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) alert("Site settings updated!");
    } catch (err) {
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  }

  function changeAdminPassword() {
    alert("Change password functionality not implemented yet.");
  }

  return (
    <div className="admin-tab-content active" id="tab-settings">
      <div className="admin-page-title">SETTINGS</div>
      <div className="admin-page-sub">Manage gym branding, information, and admin credentials</div>

      {/* LOGO SECTION */}
      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Gym Logo</span></div>
        <div style={{display:"flex", alignItems:"center", gap:"24px", flexWrap:"wrap"}}>
          <div style={{width:"80px", height:"80px", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0a0a", overflow:"hidden"}}>
            <img src={settings.logoUrl || "/newlogo.png"} alt="Logo" style={{maxWidth:"100%", maxHeight:"100%", objectFit:"contain"}} />
          </div>
          <div>
            <CldUploadWidget uploadPreset="nmegym_preset" onSuccess={(res) => {
                const newSettings = { ...settings, logoUrl: res.info.secure_url };
                setSettings(newSettings);
              }}>
              {({ open }) => (
                <button className="admin-btn-sm" onClick={() => open()}>Upload New Logo</button>
              )}
            </CldUploadWidget>
            <p style={{fontSize:"11px", color:"var(--gray)", marginTop:"8px"}}>Recommended: PNG with transparent background, min 200×200px</p>
          </div>
        </div>
      </div>

      {/* GYM INFO */}
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Gym Information</span>
          <button className="admin-btn-sm" onClick={handleSaveSettings} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label className="admin-label">Gym Name</label><input className="admin-input" type="text" value={settings.gymName || "NME GYM"} onChange={(e) => setSettings({...settings, gymName: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">WhatsApp Number</label><input className="admin-input" type="tel" value={settings.whatsappNumber || ""} onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Email</label><input className="admin-input" type="email" value={settings.email || ""} onChange={(e) => setSettings({...settings, email: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Location</label><input className="admin-input" type="text" value={settings.address || ""} onChange={(e) => setSettings({...settings, address: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Instagram URL</label><input className="admin-input" type="url" value={settings.instagramUrl || ""} onChange={(e) => setSettings({...settings, instagramUrl: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Opening Time</label><input className="admin-input" type="time" value="05:30" readOnly /></div>
          <div className="admin-form-group"><label className="admin-label">Closing Time</label><input className="admin-input" type="time" value="22:00" readOnly /></div>
        </div>
      </div>

      {/* PASSWORD */}
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Change Admin Password</span>
          <button className="admin-btn-sm" onClick={changeAdminPassword}>Update</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label className="admin-label">Current Password</label><input className="admin-input" type="password" placeholder="••••••••" /></div>
          <div className="admin-form-group"><label className="admin-label">New Password</label><input className="admin-input" type="password" placeholder="••••••••" /></div>
        </div>
      </div>
    </div>
  );
}
