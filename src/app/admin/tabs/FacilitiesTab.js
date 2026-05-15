// src/app/admin/tabs/FacilitiesTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

export default function FacilitiesTab({ initialFacilities, requestConfirmation }) {
  const router = useRouter();
  const [facilities, setFacilities] = useState(initialFacilities || []);
  const [editing, setEditing] = useState({ id: null, name: "", description: "", mediaUrl: "", mediaType: "IMAGE" });
  const [loading, setLoading] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!editing.mediaUrl) return alert("Please upload an image or video.");
    if (!editing.name) return alert("Name is required.");
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      
      if (res.ok) {
        const saved = await res.json();
        if (editing.id) setFacilities(facilities.map(f => f.id === saved.id ? saved : f));
        else setFacilities([saved, ...facilities]);
        resetForm();
        router.refresh();
        alert("Facility saved to database!");
      }
    } catch (err) {
      alert("Error saving facility.");
    } finally {
      setLoading(false);
    }
  }


  function handleEdit(f) {
    setEditing(f);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditing({ id: null, name: "", description: "", mediaUrl: "", mediaType: "IMAGE" });
  }

  function handleDelete(id) {
    requestConfirmation({
      title: "DELETE FACILITY",
      message: "Are you sure you want to remove this facility from the database?",
      isCritical: false,
      onConfirm: async () => {
        await executeDelete(id);
      }
    });
  }

  async function executeDelete(id) {
    try {
      const res = await fetch(`/api/admin/facilities?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFacilities(facilities.filter(f => f.id !== id));
        router.refresh();
      }
    } catch (err) {
      alert("Error deleting facility.");
    }
  }

  return (
    <div className="admin-tab-content active" id="tab-facilities">
      <div className="admin-page-title">FACILITIES</div>
      <div className="admin-page-sub">Manage gym facilities gallery</div>
      
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">{editing.id ? "Edit Facility" : "Add to Gallery"}</span>
          <div style={{display: "flex", gap: "10px"}}>
            {editing.id && <button className="admin-btn-sm outline" onClick={resetForm}>Cancel</button>}
            <button className="admin-btn-sm" onClick={(e) => { e.preventDefault(); document.getElementById('facilityForm').requestSubmit(); }}>
              {editing.id ? "Update Facility" : "Save Facility"}
            </button>
          </div>
        </div>
        <form id="facilityForm" className="admin-form-grid" onSubmit={handleSave}>
          <div className="admin-form-group">
            <label className="admin-label">Facility Name</label>
            <input 
              name="name" 
              className="admin-input" 
              type="text" 
              placeholder="e.g. Strength Area" 
              required 
              value={editing.name}
              onChange={e => setEditing({...editing, name: e.target.value})}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Type</label>
            <select 
              name="mediaType" 
              className="admin-input" 
              value={editing.mediaType} 
              onChange={(e) => setEditing({...editing, mediaType: e.target.value})}
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <input 
              name="description" 
              className="admin-input" 
              type="text" 
              placeholder="Brief description..." 
              value={editing.description || ""}
              onChange={e => setEditing({...editing, description: e.target.value})}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Media (Image/Video)</label>
            <div style={{display:"flex", gap:"15px", alignItems:"center"}}>
              {editing.mediaUrl && (
                <div style={{ position: 'relative', width: '80px', height: '50px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--elite-border)' }}>
                  {editing.mediaType === "VIDEO" ? (
                    <video src={editing.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  ) : (
                    <img src={editing.mediaUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <button type="button" onClick={() => setEditing({...editing, mediaUrl: ''})} style={{ position: 'absolute', top: 2, right: 2, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                </div>
              )}
              
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ 
                  cropping: true, 
                  showSkipCropButton: true, 
                  croppingAspectRatio: 1.5,
                  resourceType: editing.mediaType === "VIDEO" ? "video" : "image"
                }}
                onSuccess={(res) => setEditing({ ...editing, mediaUrl: res.info.secure_url })}
              >
                {({ open }) => (
                  <button type="button" onClick={() => open()} className="admin-btn-sm outline">
                    {editing.mediaUrl ? "Change Media" : "Upload File"}
                  </button>
                )}
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
                <td className="admin-truncate-text">{f.description || '—'}</td>
                <td>
                  <div style={{display: "flex", gap: "8px"}}>
                    <button className="admin-toggle-btn" onClick={() => handleEdit(f)} title="Edit">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button className="admin-toggle-btn" onClick={() => handleDelete(f.id)} title="Delete">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {facilities.length === 0 && <tr><td colSpan="4" style={{textAlign: "center", padding: "20px", color: "var(--gray)"}}>No facilities added.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
