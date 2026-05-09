
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
  if (tab === 'blog') loadPosts();
}

// ========== DASHBOARD ==========
async function loadDashboard() {
  const stats = await api('/admin/dashboard');
  if (!stats) return;

  // Update stat cards
  const cards = document.querySelectorAll('.admin-stat-val');
  cards[0].textContent = stats.totalMembers;
  cards[1].textContent = stats.activeMemberships;
  cards[2].textContent = `₹${(stats.monthlyRevenue / 100000).toFixed(1)}L`;
  cards[3].textContent = stats.pendingBookings;

  // Update recent members table
  const tbody = document.getElementById('dashRecentMembers');
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
  if (!confirm('Are you sure you want to delete this member?')) return;
  const res = await api(`/admin/members/${id}`, 'DELETE');
  if (res) loadMembers();
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

// ========== BLOG ==========
async function loadPosts() {
  const posts = await api('/admin/posts');
  if (!posts) return;

  const tbody = document.getElementById('postsBody');
  tbody.innerHTML = posts.map(p => `
    <tr>
      <td>${p.title}</td>
      <td>${p.category}</td>
      <td>${new Date(p.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
      <td><button class="admin-toggle-btn" onclick="deletePost('${p.id}')">🗑</button></td>
    </tr>
  `).join('');
}

async function publishPost() {
  const title = document.getElementById('postTitle').value.trim();
  const category = document.getElementById('postCat').value;
  const content = document.getElementById('postContent').value.trim();

  if (!title) return alert('Enter a post title.');

  const res = await api('/admin/posts', 'POST', { title, category, content });
  if (res) {
    alert('✅ Post published!');
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    loadPosts();
  }
}

async function deletePost(id) {
  if (!confirm('Are you sure?')) return;
  const res = await api(`/admin/posts/${id}`, 'DELETE');
  if (res) loadPosts();
}

// ========== INIT ==========
if (TOKEN) {
  loadDashboard();
}

// ========== CURSOR (Reusable from main.js) ==========
const cursor=document.getElementById('cursor');
const ring=document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cursor.style.left=mx-5+'px';cursor.style.top=my-5+'px';
});
function animateRing(){
  rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;
  ring.style.left=rx+'px';ring.style.top=ry+'px';
  requestAnimationFrame(animateRing);
}animateRing();
document.querySelectorAll('a,button,.admin-nav-item').forEach(el=>{
  el.addEventListener('mouseenter',()=>ring.classList.add('expand'));
  el.addEventListener('mouseleave',()=>ring.classList.remove('expand'));
});
