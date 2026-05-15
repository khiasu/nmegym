// src/app/admin/tabs/SettingsTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

export default function SettingsTab({ initialSettings, requestConfirmation, executeWithUndo }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings || {});
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
      if (res.ok) {
        router.refresh();
        alert("Site settings updated!");
      }
    } catch (err) {
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  }

  async function changeAdminPassword() {
    if (!passwords.current || !passwords.new) return alert("Please fill both password fields.");
    
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
        alert("Admin password updated successfully! Use the new password for next login.");
        setPasswords({ current: "", new: "" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update password.");
      }
    } catch (err) {
      alert("Error updating password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-tab-content active" id="tab-settings">
      <div className="admin-page-title">SETTINGS</div>
      <div className="admin-page-sub">Manage gym branding, information, and admin credentials</div>

      {/* LOGO & BRANDING */}
      <div className="elite-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Gym Logo</span></div>
        <div style={{display:"flex", alignItems:"center", gap:"30px", flexWrap:"wrap"}}>
          <div style={{width:"100px", height:"100px", border:"1px solid var(--elite-border)", display:"flex", alignItems:"center", justifyContent:"center", background:"#000", overflow:"hidden", borderRadius: "15px", position: "relative"}}>
            <img src={settings.logoUrl || "/newlogo.png"} alt="Logo" style={{maxWidth:"100%", maxHeight:"100%", objectFit:"contain"}} />
            {settings.logoUrl && (
              <button type="button" onClick={() => setSettings({...settings, logoUrl: ''})} style={{ position: 'absolute', top: 5, right: 5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            )}
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

        {/* HERO BACKGROUND */}
        <div style={{marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px"}}>
          <div className="admin-section-card-title" style={{fontSize: "14px", marginBottom: "15px"}}>Hero Background Image</div>
          <div style={{display:"flex", alignItems:"center", gap:"30px", flexWrap:"wrap"}}>
            <div style={{width:"200px", height:"112px", border:"1px solid var(--elite-border)", display:"flex", alignItems:"center", justifyContent:"center", background:"#000", overflow:"hidden", borderRadius: "8px", position: "relative"}}>
              {settings.heroBackgroundUrl ? (
                <img src={settings.heroBackgroundUrl} alt="Hero Background" style={{width:"100%", height:"100%", objectFit:"cover"}} />
              ) : (
                <span style={{fontSize: "10px", color: "rgba(255,255,255,0.3)"}}>No Image Set</span>
              )}
              {settings.heroBackgroundUrl && (
                <button type="button" onClick={() => setSettings({...settings, heroBackgroundUrl: ''})} style={{ position: 'absolute', top: 5, right: 5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              )}
            </div>
            <div>
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ cropping: false }}
                onSuccess={(res) => setSettings({...settings, heroBackgroundUrl: res.info.secure_url})}
              >
                {({ open }) => (
                  <button className="admin-btn-sm" onClick={() => open()}>Upload Hero Image</button>
                )}
              </CldUploadWidget>
              <p style={{fontSize:"11px", color:"rgba(255,255,255,0.3)", marginTop:"10px"}}>RECOMMENDED: 1920x1080 (16:9) HIGH QUALITY IMAGE</p>
            </div>
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
            <label className="admin-label">Payment Instruction</label>
            <p style={{fontSize:"12px", color:"var(--elite-red)", fontWeight:"bold", margin:"10px 0"}}>DYNAMIC QR GENERATION ACTIVE</p>
            <p style={{fontSize:"11px", color:"#888"}}>The payment page will automatically generate a unique QR code for each transaction based on the UPI ID above.</p>
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

        </div>
        <div className="admin-form-group" style={{marginTop: "20px"}}>
          <label className="admin-label">About Us Description</label>
          <textarea className="admin-input" style={{height:"120px", width:"100%"}} value={settings.aboutText || ""} onChange={(e) => setSettings({...settings, aboutText: e.target.value})} placeholder="Describe your gym..."></textarea>
        </div>

        {/* ABOUT IMAGES */}
        <div style={{marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px"}}>
          <div className="admin-section-card-title" style={{fontSize: "14px", marginBottom: "15px"}}>About Section Images</div>
          <p style={{fontSize:"11px", color:"rgba(255,255,255,0.4)", marginBottom:"15px"}}>Upload 3 images to showcase your gym in the About section.</p>
          
          <div style={{display:"flex", gap:"15px", flexWrap:"wrap"}}>
            {/* About Image 1 */}
            <div style={{flex: 1, minWidth: "150px"}}>
              <div style={{width:"100%", height:"100px", border:"1px solid var(--elite-border)", display:"flex", alignItems:"center", justifyContent:"center", background:"#000", overflow:"hidden", borderRadius: "8px", position: "relative", marginBottom: "10px"}}>
                {settings.aboutImage1Url ? (
                  <img src={settings.aboutImage1Url} alt="About 1" style={{width:"100%", height:"100%", objectFit:"cover"}} />
                ) : (
                  <span style={{fontSize: "10px", color: "rgba(255,255,255,0.3)"}}>Image 1 (Tall)</span>
                )}
                {settings.aboutImage1Url && (
                  <button type="button" onClick={() => setSettings({...settings, aboutImage1Url: ''})} style={{ position: 'absolute', top: 5, right: 5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                )}
              </div>
              <CldUploadWidget uploadPreset="nmegym_preset" onSuccess={(res) => setSettings({...settings, aboutImage1Url: res.info.secure_url})}>
                {({ open }) => <button className="admin-btn-sm" style={{width:"100%"}} onClick={() => open()}>Upload Image 1</button>}
              </CldUploadWidget>
            </div>

            {/* About Image 2 */}
            <div style={{flex: 1, minWidth: "150px"}}>
              <div style={{width:"100%", height:"100px", border:"1px solid var(--elite-border)", display:"flex", alignItems:"center", justifyContent:"center", background:"#000", overflow:"hidden", borderRadius: "8px", position: "relative", marginBottom: "10px"}}>
                {settings.aboutImage2Url ? (
                  <img src={settings.aboutImage2Url} alt="About 2" style={{width:"100%", height:"100%", objectFit:"cover"}} />
                ) : (
                  <span style={{fontSize: "10px", color: "rgba(255,255,255,0.3)"}}>Image 2 (Square)</span>
                )}
                {settings.aboutImage2Url && (
                  <button type="button" onClick={() => setSettings({...settings, aboutImage2Url: ''})} style={{ position: 'absolute', top: 5, right: 5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                )}
              </div>
              <CldUploadWidget uploadPreset="nmegym_preset" onSuccess={(res) => setSettings({...settings, aboutImage2Url: res.info.secure_url})}>
                {({ open }) => <button className="admin-btn-sm" style={{width:"100%"}} onClick={() => open()}>Upload Image 2</button>}
              </CldUploadWidget>
            </div>

            {/* About Image 3 */}
            <div style={{flex: 1, minWidth: "150px"}}>
              <div style={{width:"100%", height:"100px", border:"1px solid var(--elite-border)", display:"flex", alignItems:"center", justifyContent:"center", background:"#000", overflow:"hidden", borderRadius: "8px", position: "relative", marginBottom: "10px"}}>
                {settings.aboutImage3Url ? (
                  <img src={settings.aboutImage3Url} alt="About 3" style={{width:"100%", height:"100%", objectFit:"cover"}} />
                ) : (
                  <span style={{fontSize: "10px", color: "rgba(255,255,255,0.3)"}}>Image 3 (Square)</span>
                )}
                {settings.aboutImage3Url && (
                  <button type="button" onClick={() => setSettings({...settings, aboutImage3Url: ''})} style={{ position: 'absolute', top: 5, right: 5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                )}
              </div>
              <CldUploadWidget uploadPreset="nmegym_preset" onSuccess={(res) => setSettings({...settings, aboutImage3Url: res.info.secure_url})}>
                {({ open }) => <button className="admin-btn-sm" style={{width:"100%"}} onClick={() => open()}>Upload Image 3</button>}
              </CldUploadWidget>
            </div>
          </div>
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
              {settings.heroBackgroundUrl && (
                <div style={{ position: 'relative', height: '50px', width: '80px' }}>
                  <img src={settings.heroBackgroundUrl} style={{height:"100%", width:"100%", objectFit:"cover", border:"1px solid var(--elite-border)"}} alt="Hero" />
                  <button type="button" onClick={() => setSettings({...settings, heroBackgroundUrl: ''})} style={{ position: 'absolute', top: -5, right: -5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              )}
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
              {settings.aboutImage1Url && (
                <div style={{ position: 'relative', height: '80px', width: '50px' }}>
                  <img src={settings.aboutImage1Url} style={{height:"100%", width:"100%", objectFit:"cover", border:"1px solid var(--elite-border)"}} alt="About 1" />
                  <button type="button" onClick={() => setSettings({...settings, aboutImage1Url: ''})} style={{ position: 'absolute', top: -5, right: -5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              )}
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
              {settings.aboutImage2Url && (
                <div style={{ position: 'relative', height: '50px', width: '50px' }}>
                  <img src={settings.aboutImage2Url} style={{height:"100%", width:"100%", objectFit:"cover", border:"1px solid var(--elite-border)"}} alt="About 2" />
                  <button type="button" onClick={() => setSettings({...settings, aboutImage2Url: ''})} style={{ position: 'absolute', top: -5, right: -5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              )}
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
              {settings.aboutImage3Url && (
                <div style={{ position: 'relative', height: '50px', width: '50px' }}>
                  <img src={settings.aboutImage3Url} style={{height:"100%", width:"100%", objectFit:"cover", border:"1px solid var(--elite-border)"}} alt="About 3" />
                  <button type="button" onClick={() => setSettings({...settings, aboutImage3Url: ''})} style={{ position: 'absolute', top: -5, right: -5, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              )}
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
