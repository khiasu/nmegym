// src/app/admin/tabs/TrainersTab.js
"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

export default function TrainersTab({ initialTrainers }) {
  const [trainers, setTrainers] = useState(initialTrainers || []);
  const [newTrainer, setNewTrainer] = useState({ id: null, name: "", role: "", imageUrl: "", bio: "" });
  const [isEditing, setIsEditing] = useState(false);

  async function handleSaveTrainer() {
    if (!newTrainer.name || !newTrainer.role) return alert("Name and role are required.");
    try {
      const res = await fetch("/api/admin/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrainer),
      });
      if (res.ok) {
        const saved = await res.json();
        if (newTrainer.id) {
          setTrainers(trainers.map(t => t.id === saved.id ? saved : t));
          alert("Trainer updated!");
        } else {
          setTrainers([saved, ...trainers]);
          alert("Trainer added!");
        }
        resetForm();
      }
    } catch (err) { alert("Error saving trainer."); }
  }

  function resetForm() {
    setNewTrainer({ id: null, name: "", role: "", imageUrl: "", bio: "" });
    setIsEditing(false);
  }

  function handleEdit(t) {
    setNewTrainer(t);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteTrainer(id) {
    if (!confirm("Delete this trainer?")) return;
    try {
      const res = await fetch(`/api/admin/trainers?id=${id}`, { method: "DELETE" });
      if (res.ok) setTrainers(trainers.filter(t => t.id !== id));
    } catch (err) { alert("Error deleting trainer."); }
  }

  return (
    <div className="admin-tab-content active" id="tab-trainers">
      <div className="admin-page-title">SQUAD (TRAINERS)</div>
      <div className="admin-page-sub">Manage gym instructors and staff profiles</div>
      
      <div className="admin-section-card">
        <div className="admin-section-card-header">
          <span className="admin-section-card-title">{isEditing ? "Edit Trainer" : "Add New Trainer"}</span>
          <div style={{display: "flex", gap: "10px"}}>
            {isEditing && <button className="admin-btn-sm outline" onClick={resetForm}>Cancel</button>}
            <button className="admin-btn-sm" onClick={handleSaveTrainer}>{isEditing ? "Update Changes" : "Save Trainer"}</button>
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group"><label className="admin-label">Trainer Name</label><input className="admin-input" type="text" placeholder="e.g. John Doe" value={newTrainer.name} onChange={e => setNewTrainer({...newTrainer, name: e.target.value})} /></div>
          <div className="admin-form-group"><label className="admin-label">Role / Speciality</label><input className="admin-input" type="text" placeholder="e.g. Head Coach, CrossFit" value={newTrainer.role} onChange={e => setNewTrainer({...newTrainer, role: e.target.value})} /></div>
          <div className="admin-form-group">
            <label className="admin-label">Profile Image URL</label>
            <div style={{display:"flex", gap:"10px"}}>
              <input className="admin-input" type="text" placeholder="https://..." value={newTrainer.imageUrl} onChange={e => setNewTrainer({...newTrainer, imageUrl: e.target.value})} />
              <CldUploadWidget uploadPreset="nmegym_preset" onSuccess={(res) => setNewTrainer({ ...newTrainer, imageUrl: res.info.secure_url })}>
                {({ open }) => (<button className="admin-btn-sm outline" onClick={() => open()}>Upload</button>)}
              </CldUploadWidget>
            </div>
          </div>
          <div className="admin-form-group"><label className="admin-label">Short Bio</label><input className="admin-input" type="text" placeholder="Brief description..." value={newTrainer.bio} onChange={e => setNewTrainer({...newTrainer, bio: e.target.value})} /></div>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-card-header"><span className="admin-section-card-title">Current Squad</span></div>
        <table className="admin-table">
          <thead><tr><th>Image</th><th>Name</th><th>Role</th><th>Bio</th><th>Action</th></tr></thead>
          <tbody id="squadAdminBody">
            {trainers.map(t => (
              <tr key={t.id}>
                <td><img src={t.imageUrl || "/newlogo.png"} style={{width: "40px", height: "40px", objectFit: "cover", borderRadius: "2px", filter: "grayscale(100%)"}} alt={t.name} /></td>
                <td>{t.name}</td>
                <td><span className="status-badge status-active">{t.role}</span></td>
                <td style={{maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{t.bio || '—'}</td>
                <td>
                  <div style={{display: "flex", gap: "8px"}}>
                    <button className="admin-toggle-btn" onClick={() => handleEdit(t)} title="Edit">✏️</button>
                    <button className="admin-toggle-btn" onClick={() => deleteTrainer(t.id)} title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {trainers.length === 0 && (
              <tr><td colSpan="5" style={{textAlign: "center", padding: "20px", color: "var(--gray)"}}>No trainers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
