// src/app/admin/tabs/FacilitiesTab.js
"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

export default function FacilitiesTab({ initialFacilities }) {
  const [facilities, setFacilities] = useState(initialFacilities || []);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(false);

  // Since we might not have a dedicated API yet, we'll just mock it or handle gracefully
  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (editing?.mediaUrl) data.mediaUrl = editing.mediaUrl;

    try {
      // Mock save for now since API might not exist yet
      const saved = { ...data, id: editing?.id || Date.now().toString() };
      if (editing?.id) setFacilities(facilities.map(f => f.id === saved.id ? saved : f));
      else setFacilities([saved, ...facilities]);
      setEditing({});
      alert("Facility saved successfully!");
    } catch (err) {
      alert("Error saving facility.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-tab-content active" id="tab-facilities">
      <div className="admin-page-title">FACILITIES</div>
      <div className="admin-page-sub">Manage gym facilities gallery</div>
      
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">Add to Gallery</span>
          <button className="admin-btn-sm" onClick={(e) => { e.preventDefault(); document.getElementById('facilityForm').requestSubmit(); }}>Save Facility</button>
        </div>
        <form id="facilityForm" className="admin-form-grid" onSubmit={handleSave}>
          <div className="admin-form-group">
            <label className="admin-label">Facility Name</label>
            <input name="name" className="admin-input" type="text" placeholder="e.g. Strength Area" required />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Type</label>
            <select name="mediaType" className="admin-input" defaultValue="IMAGE">
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <input name="description" className="admin-input" type="text" placeholder="Brief description..." />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Media (Image/Video)</label>
            <div style={{display:"flex", gap:"10px"}}>
              <input name="mediaUrl" className="admin-input" type="text" value={editing.mediaUrl || ''} onChange={(e) => setEditing({...editing, mediaUrl: e.target.value})} placeholder="https://..." readOnly />
              <CldUploadWidget uploadPreset="nmegym_preset" onSuccess={(res) => setEditing({ ...editing, mediaUrl: res.info.secure_url })}>
                {({ open }) => (<button type="button" onClick={() => open()} className="admin-btn-sm outline">Upload</button>)}
              </CldUploadWidget>
            </div>
          </div>
        </form>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Gallery Items</span></div>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Description</th><th>Action</th></tr>
          </thead>
          <tbody>
            {facilities.map(f => (
              <tr key={f.id}>
                <td>
                  <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                    {f.mediaType === "VIDEO" ? (
                      <video src={f.mediaUrl} style={{width:"40px", height:"40px", objectFit:"cover", borderRadius: "2px"}} muted />
                    ) : (
                      <img src={f.mediaUrl || "/newlogo.png"} style={{width:"40px", height:"40px", objectFit:"cover", borderRadius: "2px"}} alt={f.name} />
                    )}
                    {f.name}
                  </div>
                </td>
                <td><span className={`status-badge ${f.mediaType === 'VIDEO' ? 'status-pending' : 'status-active'}`}>{f.mediaType}</span></td>
                <td style={{maxWidth: "300px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{f.description || '—'}</td>
                <td><button className="admin-toggle-btn" onClick={() => setFacilities(facilities.filter(item => item.id !== f.id))}>🗑</button></td>
              </tr>
            ))}
            {facilities.length === 0 && <tr><td colSpan="4" style={{textAlign: "center", padding: "20px", color: "var(--gray)"}}>No facilities added.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
