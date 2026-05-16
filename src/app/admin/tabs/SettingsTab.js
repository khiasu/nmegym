// src/app/admin/tabs/SettingsTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

export default function SettingsTab({ initialSettings: settings, setSettings, requestConfirmation, executeWithUndo, showToast }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "" });

  function handleSaveSettings() {
    if (!requestConfirmation || !executeWithUndo) return executeSave();
    
    requestConfirmation({
      title: "SAVE SETTINGS",
      message: "You are about to apply global changes to the gym's public configuration. Proceed?",
      isCritical: false,
      onConfirm: async () => {
        executeWithUndo({
          message: "Settings update scheduled. Writing to database in 7s...",
          executeFunction: async () => await executeSave(),
          revertUI: () => {} 
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
      if (res.ok) {
        router.refresh();
        showToast("Site settings updated!");
      }
    } catch (err) {
      showToast("Error saving settings.");
    } finally {
      setSaving(false);
    }
  }

  async function changeAdminPassword() {
    if (!passwords.current || !passwords.new) return showToast("Please fill both password fields.");
    
    setSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword: passwords.current, 
          newPassword: passwords.new 
        }),
      });

      if (res.ok) {
        showToast("Admin password updated successfully!");
        setPasswords({ current: "", new: "" });
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update password.");
      }
    } catch (err) {
      showToast("Error updating password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-tab-content active" id="tab-settings">
      <div className="admin-page-title">SETTINGS</div>
      <div className="admin-page-sub">Manage gym branding, information, and admin credentials</div>

      {/* SECTION 1: BRANDING & HERO */}
      <div className="elite-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Branding & Hero</span>
          <button className="admin-btn-sm" onClick={handleSaveSettings} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </div>
        
        <div className="admin-form-grid">
          {/* Logo Upload */}
          <div className="admin-form-group">
            <label className="admin-label">Gym Logo</label>
            <div style={{display:"flex", alignItems:"center", gap:"20px", flexWrap:"wrap"}}>
              <div style={{width:"180px", height:"90px", border:"1px solid var(--elite-border)", display:"flex", alignItems:"center", justifyContent:"center", background:"#000", overflow:"hidden", borderRadius: "12px", position: "relative"}}>
                <img src={settings.logoUrl || "/newlogo.png"} alt="Logo" style={{maxWidth:"100%", maxHeight:"100%", objectFit:"contain"}} />
                {settings.logoUrl && (
                  <button type="button" onClick={() => setSettings({...settings, logoUrl: ''})} style={{ position: 'absolute', top: 5, right: 5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                )}
              </div>
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ cropping: false }}
                onSuccess={(res) => setSettings({...settings, logoUrl: res.info.secure_url})}
              >
                {({ open }) => (
                  <button className="admin-btn-sm outline" onClick={() => open()}>Upload Logo</button>
                )}
              </CldUploadWidget>
            </div>
            <p style={{fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:"8px"}}>TRANSPARENT PNG RECOMMENDED</p>
          </div>

          {/* Hero Background */}
          <div className="admin-form-group">
            <label className="admin-label">Hero Background Image</label>
            <div style={{display:"flex", alignItems:"center", gap:"20px", flexWrap:"wrap"}}>
              <div style={{width:"180px", height:"90px", border:"1px solid var(--elite-border)", display:"flex", alignItems:"center", justifyContent:"center", background:"#000", overflow:"hidden", borderRadius: "8px", position: "relative"}}>
                {settings.heroBackgroundUrl ? (
                  <img src={settings.heroBackgroundUrl} alt="Hero" style={{width:"100%", height:"100%", objectFit:"cover"}} />
                ) : (
                  <span style={{fontSize: "10px", color: "rgba(255,255,255,0.3)"}}>No Image</span>
                )}
                {settings.heroBackgroundUrl && (
                  <button type="button" onClick={() => setSettings({...settings, heroBackgroundUrl: ''})} style={{ position: 'absolute', top: 5, right: 5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                )}
              </div>
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ cropping: true, croppingAspectRatio: 1.77 }}
                onSuccess={(res) => setSettings({...settings, heroBackgroundUrl: res.info.secure_url})}
              >
                {({ open }) => (
                  <button className="admin-btn-sm outline" onClick={() => open()}>Upload Hero</button>
                )}
              </CldUploadWidget>
            </div>
            <p style={{fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:"8px"}}>16:9 ASPECT RATIO RECOMMENDED</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: CONTACT & INFO */}
      <div className="elite-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Contact & Information</span>
          <button className="admin-btn-sm" onClick={handleSaveSettings} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label className="admin-label">Gym Name</label><input className="admin-input" type="text" value={settings.gymName || ""} onChange={(e) => setSettings({...settings, gymName: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">WhatsApp Number</label><input className="admin-input" type="tel" value={settings.whatsappNumber || ""} onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Email Address</label><input className="admin-input" type="email" value={settings.email || ""} onChange={(e) => setSettings({...settings, email: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Gym Address</label><input className="admin-input" type="text" value={settings.address || ""} onChange={(e) => setSettings({...settings, address: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Instagram URL</label><input className="admin-input" type="url" value={settings.instagramUrl || ""} onChange={(e) => setSettings({...settings, instagramUrl: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Opening Hours</label><input className="admin-input" type="text" value={settings.openingHours || ""} onChange={(e) => setSettings({...settings, openingHours: e.target.value})} /></div>
        </div>
      </div>

      {/* SECTION 3: ABOUT US CONTENT */}
      <div className="elite-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">About Us Section</span>
          <button className="admin-btn-sm" onClick={handleSaveSettings} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </div>
        
        {/* About Paragraphs */}
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label className="admin-label">About Paragraph 1 (Intro)</label>
            <textarea 
              className="admin-input" 
              style={{height:"120px", width:"100%"}} 
              value={settings.aboutText || ""} 
              onChange={(e) => setSettings({...settings, aboutText: e.target.value})} 
              placeholder="Intro paragraph..."
            ></textarea>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">About Paragraph 2 (Mission)</label>
            <textarea 
              className="admin-input" 
              style={{height:"120px", width:"100%"}} 
              value={settings.aboutText2 || ""} 
              onChange={(e) => setSettings({...settings, aboutText2: e.target.value})} 
              placeholder="Mission paragraph..."
            ></textarea>
          </div>
        </div>

        {/* About Images */}
        <div style={{marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px"}}>
          <label className="admin-label" style={{marginBottom: "15px"}}>About Section Photo Gallery</label>
          <div style={{display:"grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap:"20px"}}>
            {/* Image 1 */}
            <div>
              <div style={{width:"100%", height:"120px", border:"1px solid var(--elite-border)", background:"#000", borderRadius: "8px", position: "relative", marginBottom: "10px", overflow: "hidden"}}>
                {settings.aboutImage1Url ? <img src={settings.aboutImage1Url} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : <div style={{height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#444"}}>Photo 1 (Tall)</div>}
                {settings.aboutImage1Url && <button onClick={() => setSettings({...settings, aboutImage1Url: ''})} style={{position:'absolute', top:5, right:5, background:'var(--red)', color:'white', border:'none', borderRadius:'50%', width:20, height:20, cursor:'pointer'}}>×</button>}
              </div>
              <CldUploadWidget uploadPreset="nmegym_preset" options={{cropping: true, croppingAspectRatio: 0.6}} onSuccess={(res) => setSettings({...settings, aboutImage1Url: res.info.secure_url})}>
                {({ open }) => <button className="admin-btn-sm outline" style={{width:"100%"}} onClick={() => open()}>Upload 1</button>}
              </CldUploadWidget>
            </div>
            {/* Image 2 */}
            <div>
              <div style={{width:"100%", height:"120px", border:"1px solid var(--elite-border)", background:"#000", borderRadius: "8px", position: "relative", marginBottom: "10px", overflow: "hidden"}}>
                {settings.aboutImage2Url ? <img src={settings.aboutImage2Url} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : <div style={{height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#444"}}>Photo 2 (Square)</div>}
                {settings.aboutImage2Url && <button onClick={() => setSettings({...settings, aboutImage2Url: ''})} style={{position:'absolute', top:5, right:5, background:'var(--red)', color:'white', border:'none', borderRadius:'50%', width:20, height:20, cursor:'pointer'}}>×</button>}
              </div>
              <CldUploadWidget uploadPreset="nmegym_preset" options={{cropping: true, croppingAspectRatio: 1}} onSuccess={(res) => setSettings({...settings, aboutImage2Url: res.info.secure_url})}>
                {({ open }) => <button className="admin-btn-sm outline" style={{width:"100%"}} onClick={() => open()}>Upload 2</button>}
              </CldUploadWidget>
            </div>
            {/* Image 3 */}
            <div>
              <div style={{width:"100%", height:"120px", border:"1px solid var(--elite-border)", background:"#000", borderRadius: "8px", position: "relative", marginBottom: "10px", overflow: "hidden"}}>
                {settings.aboutImage3Url ? <img src={settings.aboutImage3Url} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : <div style={{height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#444"}}>Photo 3 (Square)</div>}
                {settings.aboutImage3Url && <button onClick={() => setSettings({...settings, aboutImage3Url: ''})} style={{position:'absolute', top:5, right:5, background:'var(--red)', color:'white', border:'none', borderRadius:'50%', width:20, height:20, cursor:'pointer'}}>×</button>}
              </div>
              <CldUploadWidget uploadPreset="nmegym_preset" options={{cropping: true, croppingAspectRatio: 1}} onSuccess={(res) => setSettings({...settings, aboutImage3Url: res.info.secure_url})}>
                {({ open }) => <button className="admin-btn-sm outline" style={{width:"100%"}} onClick={() => open()}>Upload 3</button>}
              </CldUploadWidget>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: PAYMENT SETTINGS */}
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
            <label className="admin-label">QR Configuration</label>
            <div style={{background: "rgba(232,0,29,0.05)", padding: "15px", borderLeft: "3px solid var(--red)", borderRadius: "4px"}}>
              <p style={{fontSize:"12px", color:"var(--red)", fontWeight:"bold", marginBottom: "5px"}}>DYNAMIC UPI QR ACTIVE</p>
              <p style={{fontSize:"11px", color:"rgba(255,255,255,0.5)", lineHeight: "1.4"}}>QR codes are automatically generated for users using the UPI ID provided above. No manual QR upload needed.</p>
            </div>
          </div>
        </div>
      </div>


      {/* SECURITY */}
      <div className="elite-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Security</span>
          <button className="admin-btn-sm" onClick={changeAdminPassword} disabled={saving}>{saving ? "Updating..." : "Update Password"}</button>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label className="admin-label">Current Password</label>
            <input 
              className="admin-input" 
              type="password" 
              placeholder="••••••••" 
              value={passwords.current}
              onChange={e => setPasswords({...passwords, current: e.target.value})}
              autoComplete="new-password"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">New Password</label>
            <input 
              className="admin-input" 
              type="password" 
              placeholder="••••••••" 
              value={passwords.new}
              onChange={e => setPasswords({...passwords, new: e.target.value})}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
