// src/app/admin/tabs/TrainersTab.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

export default function TrainersTab({ initialTrainers, requestConfirmation, executeWithUndo, showToast }) {
  const router = useRouter();
  const [trainers, setTrainers] = useState(initialTrainers || []);
  const [newTrainer, setNewTrainer] = useState({ id: null, name: "", role: "", imageUrl: "", bio: "" });
  const [isEditing, setIsEditing] = useState(false);

  async function handleSaveTrainer() {
    if (!newTrainer.name || !newTrainer.role) return showToast("Name and role are required.");
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
          showToast("Trainer updated!");
        } else {
          setTrainers([saved, ...trainers]);
          showToast("Trainer added!");
        }
        router.refresh();
        resetForm();
      }
    } catch (err) { showToast("Error saving trainer."); }
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
    requestConfirmation({
      title: "DELETE TRAINER",
      message: "Are you sure you want to permanently remove this trainer? This action cannot be undone.",
      isCritical: true,
      onConfirm: async (password) => {
        executeWithUndo({
          message: "Trainer removed. Deleting from database in 7s...",
          revertUI: () => {
            // Optimistic UI update — hide trainer immediately
            setTrainers(prev => prev.filter(t => t.id !== id));
          },
          executeFunction: async () => {
            await executeDelete(id, password);
          }
        });
      }
    });
  }

  async function executeDelete(id, password) {
    try {
      // In production, the backend /api/admin/trainers DELETE route should verify the password from the body
      const res = await fetch(`/api/admin/trainers?id=${id}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }) 
      });
      if (res.ok) {
        setTrainers(trainers.filter(t => t.id !== id));
        router.refresh();
        showToast("Trainer removed from database");
      } else {
        showToast("Failed to delete trainer. Incorrect password or server error.");
      }
    } catch (err) { 
      console.error(err);
      showToast("Error deleting trainer."); 
    }
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
            <label className="admin-label">Profile Image</label>
            <div style={{display:"flex", gap:"15px", alignItems:"center"}}>
              {newTrainer.imageUrl && (
                <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--elite-border)' }}>
                  <img src={newTrainer.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setNewTrainer({...newTrainer, imageUrl: ''})} style={{ position: 'absolute', top: 0, right: 0, background: 'var(--red)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              )}
              
              <CldUploadWidget 
                uploadPreset="nmegym_preset" 
                options={{ cropping: true, showSkipCropButton: false, croppingAspectRatio: 1 }}
                onSuccess={(res) => setNewTrainer(prev => ({ ...prev, imageUrl: res.info.secure_url }))}
              >
                {({ open }) => (
                  <button type="button" onClick={() => open()} className="admin-btn-sm outline">
                    {newTrainer.imageUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Short Bio / Description</label>
            <textarea 
              className="admin-input" 
              style={{height: "80px", width: "100%", padding: "10px"}} 
              placeholder="Brief description of the trainer's expertise and experience..." 
              value={newTrainer.bio} 
              onChange={e => setNewTrainer({...newTrainer, bio: e.target.value})}
            ></textarea>
          </div>
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
                <td className="admin-truncate-text">{t.bio || '—'}</td>
                <td>
                  <div style={{display: "flex", gap: "8px"}}>
                    <button className="admin-toggle-btn" onClick={() => handleEdit(t)} title="Edit">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                    <button className="admin-toggle-btn" onClick={() => deleteTrainer(t.id)} title="Delete">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
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
