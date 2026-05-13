
// ========== ADMIN AUTH CHECK ==========
function checkAuth() {
  const token = localStorage.getItem('nme_token');
  const user = JSON.parse(localStorage.getItem('nme_user') || '{}');
  
  if (!token || user.role !== 'ADMIN') {
    window.location.href = '/admin/login.html';
    return null;
  }
  return token;
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

const TOKEN = checkAuth();

// ========== CRITICAL SAFETY ==========
function doubleConfirm(actionName) {
  const c1 = confirm(`CRITICAL: Are you sure you want to ${actionName}?`);
  if (!c1) return false;
  return confirm(`FINAL CONFIRMATION: Please confirm one last time to ${actionName}. This action may be permanent.`);
}

let lastDeleted = null;
let undoTimer = null;

function showUndo(msg, restoreFn) {
  const existing = document.getElementById('undo-toast');
  if (existing) existing.remove();
  if (undoTimer) clearTimeout(undoTimer);

  const toast = document.createElement('div');
  toast.id = 'undo-toast';
  toast.className = 'undo-toast active';
  toast.innerHTML = `
    <span>${msg}</span>
    <button onclick="triggerUndo()">UNDO</button>
  `;
  document.body.appendChild(toast);

  window.triggerUndo = async () => {
    toast.classList.remove('active');
    await restoreFn();
    clearTimeout(undoTimer);
    setTimeout(() => toast.remove(), 300);
  };

  undoTimer = setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 300);
  }, 8000);
}

// ========== API WRAPPER ==========
async function api(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  };
  if (body) options.body = JSON.stringify(body);
  
  try {
    const res = await fetch(`/api${endpoint}`, options);
    const data = await res.json();
    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      window.location.href = '/admin/login.html';
      return null;
    }
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
  } catch (err) {
    console.error(err);
    alert(err.message);
    return null;
  }
}

// ========== TAB SWITCHING ==========
function switchAdminTab(tab, clickedEl) {
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  const target = document.getElementById('tab-' + tab);
  if (target) target.classList.add('active');
  
  // Desktop sidebar
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
  if (clickedEl && clickedEl.classList && clickedEl.classList.contains('admin-nav-item')) {
    clickedEl.classList.add('active');
  }
  
  // Mobile nav
  document.querySelectorAll('.mobile-admin-nav button').forEach(b => b.classList.remove('active'));
  if (clickedEl && clickedEl.tagName === 'BUTTON') {
    clickedEl.classList.add('active');
  }

  // Load data for the tab
  if (tab === 'dashboard') loadDashboard();
  if (tab === 'members') loadMembers();
  if (tab === 'payments') loadPayments();
  if (tab === 'bookings') loadBookings();
  if (tab === 'trainers') loadTrainers();
  if (tab === 'facilities') loadFacilities();
  if (tab === 'plans') loadPlansAndOffers();
}

// ========== DASHBOARD ==========
async function loadDashboard() {
  const stats = await api('/admin/dashboard');
  if (!stats) return;

  // Update stat cards
  const cards = document.querySelectorAll('.admin-stat-val');
  if (cards.length >= 4) {
    cards[0].textContent = stats.totalMembers;
    cards[1].textContent = stats.activeMemberships;
    cards[2].textContent = `₹${(stats.monthlyRevenue / 100000).toFixed(1)}L`;
    cards[3].textContent = stats.pendingBookings;
  }

  // Update recent members table
  const tbody = document.getElementById('dashRecentMembers');
  if (tbody) {
    tbody.innerHTML = stats.recentMembers.map(m => `
      <tr>
        <td>${m.name}</td>
        <td>${m.plan}</td>
        <td>${new Date(m.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
        <td>${m.expires ? new Date(m.expires).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</td>
        <td><span class="status-badge status-${m.status.toLowerCase()}">${m.status}</span></td>
      </tr>
    `).join('');
  }
}

// ========== MEMBERS ==========
async function loadMembers(search = '') {
  const members = await api(`/admin/members?search=${search}`);
  if (!members) return;

  const tbody = document.getElementById('membersBody');
  tbody.innerHTML = members.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.phone}</td>
      <td>${m.plan}</td>
      <td>${new Date(m.joined).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</td>
      <td>${m.expires ? new Date(m.expires).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</td>
      <td><span class="status-badge status-${m.status.toLowerCase()}">${m.status}</span></td>
      <td><button class="admin-toggle-btn" onclick="deleteMember('${m.id}')">🗑</button></td>
    </tr>
  `).join('');
}

async function addMember() {
  const name = document.getElementById('mName').value.trim();
  const phone = document.getElementById('mPhone').value.trim();
  const plan = document.getElementById('mPlan').value;
  const joinDate = document.getElementById('mDate').value;

  if (!name || !phone) return alert('Please fill Name and Phone.');

  const res = await api('/admin/members', 'POST', { name, phone, plan, joinDate });
  if (res) {
    alert('✅ Member added!');
    document.getElementById('mName').value = '';
    document.getElementById('mPhone').value = '';
    loadMembers();
  }
}

async function deleteMember(id) {
  if (!doubleConfirm('DELETE this member')) return;
  
  // Cache for undo
  const rows = document.querySelectorAll('#membersBody tr');
  let memberData = null;
  rows.forEach(row => {
    if (row.querySelector('button').onclick.toString().includes(id)) {
      const cells = row.querySelectorAll('td');
      memberData = { name: cells[0].textContent, phone: cells[1].textContent, plan: cells[2].textContent };
    }
  });

  const res = await api(`/admin/members/${id}`, 'DELETE');
  if (res) {
    loadMembers();
    if (memberData) {
      showUndo(`Member "${memberData.name}" deleted.`, async () => {
        await api('/admin/members', 'POST', memberData);
        loadMembers();
        alert('✅ Action Reverted: Member restored.');
      });
    }
  }
}

function filterMembers(val) {
  loadMembers(val);
}

// ========== PAYMENTS ==========
async function loadPayments() {
  const payments = await api('/admin/payments');
  if (!payments) return;

  const pendingBody = document.getElementById('pendingPaymentsBody');
  const verifiedBody = document.getElementById('verifiedPaymentsBody');

  const pending = payments.filter(p => p.status === 'PENDING_VERIFICATION');
  const verified = payments.filter(p => p.status === 'VERIFIED');

  pendingBody.innerHTML = pending.map(p => `
    <tr>
      <td>${p.member}</td>
      <td>₹${p.amount}</td>
      <td>${p.plan}</td>
      <td>${p.method}</td>
      <td>${new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
      <td><button class="admin-btn-sm" onclick="verifyPayment('${p.id}')">Verify</button></td>
    </tr>
  `).join('');

  verifiedBody.innerHTML = verified.map(p => `
    <tr>
      <td>${p.member}</td>
      <td>₹${p.amount}</td>
      <td>${p.plan}</td>
      <td>${p.method}</td>
      <td>${new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
      <td><span class="status-badge status-active">Verified</span></td>
    </tr>
  `).join('');
}

async function verifyPayment(id) {
  if (!doubleConfirm('VERIFY this payment')) return;
  const res = await api(`/admin/payments/${id}/verify`, 'PUT');
  if (res) {
    alert('✅ Payment verified!');
    loadPayments();
  }
}

// ========== BOOKINGS ==========
async function loadBookings() {
  const bookings = await api('/admin/bookings');
  if (!bookings) return;

  const tbody = document.getElementById('bookingsBody');
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.name}</td>
      <td>${b.phone}</td>
      <td>${new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
      <td>${b.time}</td>
      <td>${b.interest}</td>
      <td><span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span></td>
      <td>
        ${b.status === 'PENDING' ? `<button class="admin-btn-sm" onclick="confirmBooking('${b.id}')">Confirm</button>` : `<button class="admin-btn-sm outline">Done</button>`}
      </td>
    </tr>
  `).join('');
}

async function confirmBooking(id) {
  const res = await api(`/admin/bookings/${id}/confirm`, 'PUT');
  if (res) loadBookings();
}

// ========== TRAINERS ==========
async function loadTrainers() {
  const trainers = await api('/admin/trainers');
  if (!trainers) return;
  const tbody = document.getElementById('trainersBody');
  tbody.innerHTML = trainers.map(t => `
    <tr>
      <td>${t.name}</td>
      <td>${t.role}</td>
      <td>${t.bio || ''}</td>
      <td><button class="admin-toggle-btn" onclick="deleteTrainer('${t.id}')">🗑</button></td>
    </tr>
  `).join('');
}

async function addTrainer() {
  const name = document.getElementById('tName').value.trim();
  const role = document.getElementById('tRole').value.trim();
  const bio = document.getElementById('tBio').value.trim();
  const imageUrl = document.getElementById('tImage').value.trim();
  if (!name || !role) return alert('Name and Role are required.');
  const res = await api('/admin/trainers', 'POST', { name, role, bio, imageUrl });
  if (res) {
    alert('✅ Trainer added!');
    document.getElementById('tName').value = '';
    document.getElementById('tRole').value = '';
    document.getElementById('tBio').value = '';
    document.getElementById('tImage').value = '';
    loadTrainers();
  }
}

async function deleteTrainer(id) {
  if (!doubleConfirm('REMOVE this trainer')) return;
  const res = await api(`/admin/trainers/${id}`, 'DELETE');
  if (res) loadTrainers();
}

async function handleTrainerPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const formData = new FormData();
  formData.append('image', input.files[0]);
  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      body: formData
    });
    const data = await res.json();
    if (data.url) {
      document.getElementById('tImage').value = data.url;
      alert('✅ Photo uploaded!');
    }
  } catch (err) { alert('❌ Upload failed.'); }
}

// ========== FACILITIES ==========
async function loadFacilities() {
  const facilities = await api('/admin/facilities');
  if (!facilities) return;
  const tbody = document.getElementById('facilitiesBody');
  tbody.innerHTML = facilities.map(f => `
    <tr>
      <td>${f.name}</td>
      <td>${f.mediaType}</td>
      <td>${f.description || ''}</td>
      <td>
        <button class="admin-toggle-btn" onclick="deleteFacility('${f.id}')">🗑</button>
      </td>
    </tr>
  `).join('');
}

async function handleFacilityMedia(input) {
  if (!input.files || !input.files[0]) return;
  const formData = new FormData();
  formData.append('image', input.files[0]);
  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      body: formData
    });
    const data = await res.json();
    if (data.url) {
      document.getElementById('fUrl').value = data.url;
      alert('✅ Media uploaded!');
    }
  } catch (err) { alert('❌ Upload failed.'); }
}

async function addFacility() {
  const name = document.getElementById('fName').value.trim();
  const mediaType = document.getElementById('fType').value;
  const description = document.getElementById('fDesc').value.trim();
  const mediaUrl = document.getElementById('fUrl').value.trim();
  if (!name || !mediaUrl) return alert('Name and Media URL are required.');
  const res = await api('/admin/facilities', 'POST', { name, mediaType, description, mediaUrl });
  if (res) {
    alert('✅ Facility saved!');
    document.getElementById('fName').value = '';
    document.getElementById('fUrl').value = '';
    document.getElementById('fDesc').value = '';
    loadFacilities();
  }
}

async function deleteFacility(id) {
  if (!doubleConfirm('DELETE this facility')) return;
  const res = await api(`/admin/facilities/${id}`, 'DELETE');
  if (res) loadFacilities();
}

// ========== PLANS & OFFERS ==========
async function loadPlansAndOffers() {
  const plans = await api('/admin/plans');
  const offers = await api('/admin/offers');

  if (plans) {
    const pBody = document.getElementById('plansAdminBody');
    pBody.innerHTML = plans.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td><input type="number" class="admin-input-sm" value="${p.price}" id="pPrice-${p.id}"></td>
        <td><input type="text" class="admin-input-sm" value="${p.period}" id="pPeriod-${p.id}"></td>
        <td><input type="text" class="admin-input-sm" value="${p.features}" id="pFeatures-${p.id}"></td>
        <td><button class="admin-btn-sm" onclick="savePlan('${p.id}')">Save</button></td>
      </tr>
    `).join('');
  }

  if (offers) {
    const oBody = document.getElementById('offersAdminBody');
    oBody.innerHTML = offers.map(o => `
      <tr>
        <td>${o.title}</td>
        <td><span class="status-badge status-active">${o.badge || '—'}</span></td>
        <td>${o.discount ? o.discount + '%' : '—'}</td>
        <td>${o.isActive ? 'Active' : 'Hidden'}</td>
        <td><button class="admin-toggle-btn" onclick="deleteOffer('${o.id}')">🗑</button></td>
      </tr>
    `).join('');
  }
}

async function savePlan(id) {
  const price = document.getElementById(`pPrice-${id}`).value;
  const period = document.getElementById(`pPeriod-${id}`).value;
  const features = document.getElementById(`pFeatures-${id}`).value;
  const res = await api(`/admin/plans/${id}`, 'PUT', { price, period, features });
  if (res) alert('✅ Plan updated!');
}

async function handleOfferPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const formData = new FormData();
  formData.append('image', input.files[0]);
  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      body: formData
    });
    const data = await res.json();
    if (data.url) {
      document.getElementById('oImage').value = data.url;
      alert('✅ Offer image uploaded!');
    }
  } catch (err) { alert('❌ Upload failed.'); }
}

async function addOffer() {
  const title = document.getElementById('oTitle').value.trim();
  const badge = document.getElementById('oBadge').value.trim();
  const discount = document.getElementById('oDiscount').value;
  const promoImage = document.getElementById('oImage').value.trim();
  const description = document.getElementById('oDesc').value.trim();

  if (!title) return alert('Title is required.');
  const res = await api('/admin/offers', 'POST', { title, badge, discount, promoImage, description });
  if (res) {
    alert('✅ Offer created!');
    loadPlansAndOffers();
  }
}

async function deleteOffer(id) {
  if (!confirm('Delete this offer?')) return;
  const res = await api(`/admin/offers/${id}`, 'DELETE');
  if (res) loadPlansAndOffers();
}

// ========== SETTINGS ==========
async function loadSettings() {
  try {
    const res = await api('/admin/settings', 'GET');
    if (res) {
      if (res.gymName) document.getElementById('settingsGymName').value = res.gymName;
      if (res.whatsappNumber) document.getElementById('settingsWhatsapp').value = res.whatsappNumber;
      if (res.email) document.getElementById('settingsEmail').value = res.email;
      if (res.address) document.getElementById('settingsAddress').value = res.address;
      if (res.instagramUrl) document.getElementById('settingsInstagram').value = res.instagramUrl;
      if (res.logoUrl) document.getElementById('logoPreview').src = res.logoUrl;
    }
  } catch (e) {
    console.log('Settings not yet configured');
  }
}

async function saveSettings() {
  const data = {
    gymName: document.getElementById('settingsGymName').value,
    whatsappNumber: document.getElementById('settingsWhatsapp').value,
    email: document.getElementById('settingsEmail').value,
    address: document.getElementById('settingsAddress').value,
    instagramUrl: document.getElementById('settingsInstagram').value,
    logoUrl: document.getElementById('logoPreview').src
  };

  const res = await api('/admin/settings', 'PUT', data);
  if (res) alert('✅ Settings saved successfully!');
}

async function handleLogoUpload(input) {
  if (!input.files || !input.files[0]) return;

  const formData = new FormData();
  formData.append('image', input.files[0]);

  try {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      body: formData
    });
    const data = await res.json();
    if (data.url) {
      document.getElementById('logoPreview').src = data.url;
      // Auto-save the logo URL
      await api('/admin/settings', 'PUT', { logoUrl: data.url });
      alert('✅ Logo uploaded and saved!');
    }
  } catch (err) {
    console.error('Upload failed:', err);
    alert('❌ Upload failed. Please try again.');
  }
}

async function changeAdminPassword() {
  const current = document.getElementById('settingsCurrentPass').value;
  const newPass = document.getElementById('settingsNewPass').value;
  if (!current || !newPass) return alert('Please fill both password fields.');
  if (newPass.length < 6) return alert('New password must be at least 6 characters.');
  alert('✅ Password change functionality will be available in the next update.');
}

// ========== INIT ==========
if (TOKEN) {
  loadDashboard();
  loadSettings();
}

