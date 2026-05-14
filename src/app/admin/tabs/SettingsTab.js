// src/app/admin/tabs/SettingsTab.js
"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

export default function SettingsTab({ initialSettings, requestConfirmation, executeWithUndo }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [saving, setSaving] = useState(false);

  function handleSaveSettings() {
    if (!requestConfirmation || !executeWithUndo) return executeSave();
    
    requestConfirmation({
      title: "SAVE SETTINGS",
      message: "You are about to apply global changes to the gym's public configuration. Proceed?",
      isCritical: false,
      onConfirm: async () => {
        executeWithUndo({
          message: "Settings update scheduled. Writing to database in 10s...",
          executeFunction: async () => await executeSave(),
          revertUI: () => {} // Nothing to revert for settings since we just delayed the save
        });
      }
    });
  }

  async function executeSave() {
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
    if (!requestConfirmation) return alert("Not implemented.");
    requestConfirmation({
      title: "CHANGE PASSWORD",
      message: "Please enter your CURRENT admin password to authorize changing the system password.",
      isCritical: true,
      onConfirm: async (password) => {
        alert("Change password functionality not fully implemented yet. Password captured securely.");
      }
    });
  }

  return (
    <div className="admin-tab-content active" id="tab-settings">
      <div className="admin-page-title">SETTINGS</div>
      <div className="admin-page-sub">Manage gym branding, information, and admin credentials</div>

      {/* LOGO & BRANDING */}
      <div className="elite-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Gym Logo</span></div>
        <div style={{display:"flex", alignItems:"center", gap:"30px", flexWrap:"wrap"}}>
          <div style={{width:"100px", height:"100px", border:"1px solid var(--elite-border)", display:"flex", alignItems:"center", justifyContent:"center", background:"#000", overflow:"hidden", borderRadius: "15px"}}>
            <img src={settings.logoUrl || "/newlogo.png"} alt="Logo" style={{maxWidth:"100%", maxHeight:"100%", objectFit:"contain"}} />
          </div>
          <div>
            <CldUploadWidget 
              uploadPreset="nmegym_preset" 
              options={{ cropping: true, showSkipCropButton: false, croppingAspectRatio: 1 }}
              onSuccess={(res) => setSettings({...settings, logoUrl: res.info.secure_url})}
            >
              {({ open }) => (
                <button className="admin-btn-sm" onClick={() => open()}>Upload New Logo</button>
              )}
            </CldUploadWidget>
            <p style={{fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"10px"}}>SQUARE CROP (1:1) REQUIRED FOR PERFECT ALIGNMENT</p>
          </div>
        </div>
      </div>

      {/* PAYMENT SETTINGS */}
      <div className="elite-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Payment Information</span>
          <button className="admin-btn-sm" onClick={handleSaveSettings} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label className="admin-label">Business UPI ID</label>
            <input className="admin-input" type="text" value={settings.upiId || ""} onChange={(e) => setSettings({...settings, upiId: e.target.value})} placeholder="e.g. nmegym@oksbi" />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">UPI QR Code</label>
            <div style={{display:"flex", gap:"15px", alignItems:"center"}}>
              {settings.upiQrUrl && <img src={settings.upiQrUrl} style={{height:"50px", width:"50px", objectFit:"contain", border:"1px solid var(--elite-border)"}} alt="QR" />}
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ cropping: true, showSkipCropButton: false, croppingAspectRatio: 1 }}
                onSuccess={(res) => setSettings({...settings, upiQrUrl: res.info.secure_url})}
              >
                {({ open }) => <button className="admin-btn-sm outline" onClick={() => open()}>Upload QR</button>}
              </CldUploadWidget>
            </div>
          </div>
        </div>
      </div>

      {/* OPERATIONAL INFO */}
      <div className="elite-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Gym Information & Brand</span>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label className="admin-label">Gym Name</label><input className="admin-input" type="text" value={settings.gymName || ""} onChange={(e) => setSettings({...settings, gymName: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">WhatsApp Number</label><input className="admin-input" type="tel" value={settings.whatsappNumber || ""} onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Email</label><input className="admin-input" type="email" value={settings.email || ""} onChange={(e) => setSettings({...settings, email: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Location</label><input className="admin-input" type="text" value={settings.address || ""} onChange={(e) => setSettings({...settings, address: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Instagram URL</label><input className="admin-input" type="url" value={settings.instagramUrl || ""} onChange={(e) => setSettings({...settings, instagramUrl: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Opening Hours Text</label><input className="admin-input" type="text" value={settings.openingHours || ""} onChange={(e) => setSettings({...settings, openingHours: e.target.value})} /></div>
        </div>
        <div className="admin-form-group" style={{marginTop: "20px"}}>
          <label className="admin-label">About Us Description</label>
          <textarea className="admin-input" style={{height:"120px", width:"100%"}} value={settings.aboutText || ""} onChange={(e) => setSettings({...settings, aboutText: e.target.value})} placeholder="Describe your gym..."></textarea>
        </div>
      </div>

      {/* WEBSITE MEDIA */}
      <div className="elite-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Website Images & Media</span>
          <button className="admin-btn-sm" onClick={handleSaveSettings} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label className="admin-label">Hero Background Image</label>
            <div style={{display:"flex", gap:"15px", alignItems:"center"}}>
              {settings.heroBackgroundUrl && <img src={settings.heroBackgroundUrl} style={{height:"50px", width:"80px", objectFit:"cover", border:"1px solid var(--elite-border)"}} alt="Hero" />}
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ cropping: true, showSkipCropButton: false, croppingAspectRatio: 1.77 }} // 16:9
                onSuccess={(res) => setSettings({...settings, heroBackgroundUrl: res.info.secure_url})}
              >
                {({ open }) => <button className="admin-btn-sm outline" onClick={() => open()}>Upload Hero Background</button>}
              </CldUploadWidget>
            </div>
            <p style={{fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"5px"}}>16:9 Landscape Aspect Ratio</p>
          </div>
          
          <div className="admin-form-group">
            <label className="admin-label">About Us Image 1 (Tall)</label>
            <div style={{display:"flex", gap:"15px", alignItems:"center"}}>
              {settings.aboutImage1Url && <img src={settings.aboutImage1Url} style={{height:"80px", width:"50px", objectFit:"cover", border:"1px solid var(--elite-border)"}} alt="About 1" />}
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ cropping: true, showSkipCropButton: false, croppingAspectRatio: 0.6 }} // Tall portrait
                onSuccess={(res) => setSettings({...settings, aboutImage1Url: res.info.secure_url})}
              >
                {({ open }) => <button className="admin-btn-sm outline" onClick={() => open()}>Upload About Image 1</button>}
              </CldUploadWidget>
            </div>
            <p style={{fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"5px"}}>Portrait Aspect Ratio</p>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">About Us Image 2 (Square)</label>
            <div style={{display:"flex", gap:"15px", alignItems:"center"}}>
              {settings.aboutImage2Url && <img src={settings.aboutImage2Url} style={{height:"50px", width:"50px", objectFit:"cover", border:"1px solid var(--elite-border)"}} alt="About 2" />}
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ cropping: true, showSkipCropButton: false, croppingAspectRatio: 1 }}
                onSuccess={(res) => setSettings({...settings, aboutImage2Url: res.info.secure_url})}
              >
                {({ open }) => <button className="admin-btn-sm outline" onClick={() => open()}>Upload About Image 2</button>}
              </CldUploadWidget>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">About Us Image 3 (Square)</label>
            <div style={{display:"flex", gap:"15px", alignItems:"center"}}>
              {settings.aboutImage3Url && <img src={settings.aboutImage3Url} style={{height:"50px", width:"50px", objectFit:"cover", border:"1px solid var(--elite-border)"}} alt="About 3" />}
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ cropping: true, showSkipCropButton: false, croppingAspectRatio: 1 }}
                onSuccess={(res) => setSettings({...settings, aboutImage3Url: res.info.secure_url})}
              >
                {({ open }) => <button className="admin-btn-sm outline" onClick={() => open()}>Upload About Image 3</button>}
              </CldUploadWidget>
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div className="elite-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Security</span>
          <button className="admin-btn-sm" onClick={changeAdminPassword}>Update Password</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label className="admin-label">Current Password</label><input className="admin-input" type="password" placeholder="••••••••" /></div>
          <div className="admin-form-group"><label className="admin-label">New Password</label><input className="admin-input" type="password" placeholder="••••••••" /></div>
        </div>
      </div>
    </div>
  );
}
