
// ========== PAGE ROUTING ==========
function showPage(p, tab = null){
  if(p==='main') window.location.href='/';
  else if(p==='auth') window.location.href = tab ? `/auth.html#${tab}` : '/auth.html';
  else if(p==='admin-login') window.location.href='/admin/login.html';
  else if(p==='admin') window.location.href='/admin/index.html';
}


// ========== NAV ==========
const navEl=document.getElementById('nav');
window.addEventListener('scroll',()=>{navEl.classList.toggle('scrolled',window.scrollY>60);});
const ham=document.getElementById('hamburger');
const mob=document.getElementById('mobileMenu');
if(ham)ham.addEventListener('click',()=>{
  const isOpen = ham.classList.toggle('open');
  mob.classList.toggle('open');
  document.body.classList.toggle('no-scroll', isOpen);
});
function closeMobile(){
  if(ham) ham.classList.remove('open');
  if(mob) mob.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

// ========== MODAL ==========
function openModal(){document.getElementById('bookingModal').classList.add('open');}
function closeModal(){document.getElementById('bookingModal').classList.remove('open');}
document.getElementById('bookingModal').addEventListener('click',e=>{if(e.target.id==='bookingModal')closeModal();});
async function submitTrial(){
  const name = document.getElementById('bookName').value.trim();
  const phone = document.getElementById('bookPhone').value.trim();
  const age = document.getElementById('bookAge').value;
  const interest = document.getElementById('bookInterest').value;
  const date = document.getElementById('bookDate').value;
  const slot = document.getElementById('bookSlot').value;
  const message = document.getElementById('bookMessage').value.trim();

  if(!name || !phone || !interest){
    alert('Please fill in Name, Phone, and Interest.');
    return;
  }

  try {
    const res = await fetch('/api/public/booking', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name, phone, age, interest, preferredDate: date, preferredTimeSlot: slot, message })
    });
    const data = await res.json();
    if(res.ok){
      alert('🎉 Trial Booked!\nWe\'ll confirm via WhatsApp shortly.\nSee you at NME GYM!');
      closeModal();
      // Clear form
      document.getElementById('bookName').value = '';
      document.getElementById('bookPhone').value = '';
      document.getElementById('bookAge').value = '';
      document.getElementById('bookMessage').value = '';
    } else {
      alert(data.error || 'Booking failed. Please try again.');
    }
  } catch(e) {
    console.error(e);
    alert('Server error. Please try again.');
  }
}

// ========== SCROLL REVEAL ==========
const reveals=document.querySelectorAll('.reveal');
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add('visible');
    else e.target.classList.remove('visible');
  });
},{threshold:0.1});
reveals.forEach(el=>observer.observe(el));

// ========== AUTH ==========
function switchAuthTab(tab){
  const loginBody = document.getElementById('auth-login-body');
  const registerBody = document.getElementById('auth-register-body');
  const paymentBody = document.getElementById('auth-payment-body');
  
  if(loginBody) loginBody.style.display = tab==='login'?'block':'none';
  if(registerBody) registerBody.style.display = tab==='register'?'block':'none';
  if(paymentBody) paymentBody.style.display = tab==='payment'?'block':'none';
  
  if(document.getElementById('tab-login')) document.getElementById('tab-login').classList.toggle('active',tab==='login');
  if(document.getElementById('tab-register')) document.getElementById('tab-register').classList.toggle('active',tab==='register'||tab==='payment');
}
async function memberLogin(){
  const phoneOrEmail = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  if(!phoneOrEmail || !password){ alert('Please fill in both fields.'); return; }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ phoneOrEmail, password })
    });
    const data = await res.json();
    if(res.ok){
      localStorage.setItem('nme_token', data.token);
      localStorage.setItem('nme_user', JSON.stringify(data.user));
      alert('Login successful!');
      if(data.user.role === 'ADMIN'){
        window.location.href = '/admin/index.html';
      } else {
        window.location.href = '/';
      }
    } else {
      alert(data.error || 'Login failed');
    }
  } catch(e) {
    console.error(e);
    alert('Server error. Please try again.');
  }
}
async function adminLogin() {
  const phoneOrEmail = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value;
  if(!phoneOrEmail || !password){ alert('Please fill in both fields.'); return; }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ phoneOrEmail, password })
    });
    const data = await res.json();
    if(res.ok){
      if(data.user.role !== 'ADMIN'){
        alert('Access denied. You are not an administrator.');
        return;
      }
      localStorage.setItem('nme_token', data.token);
      localStorage.setItem('nme_user', JSON.stringify(data.user));
      window.location.href = '/admin/index.html';
    } else {
      alert(data.error || 'Login failed');
    }
  } catch(e) {
    console.error(e);
    alert('Server error. Please try again.');
  }
}

async function memberRegister(){
  const firstName = document.getElementById('regFirst').value.trim();
  const lastName = document.getElementById('regLast').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;
  
  if(!firstName || !phone || !password) { alert('Please fill required fields.'); return; }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ firstName, lastName, phone, email, password })
    });
    const data = await res.json();
    if(res.ok){
      alert('✅ Registration successful!');
      switchAuthTab('payment');
    } else {
      alert(data.error || 'Registration failed');
    }
  } catch(e) {
    console.error(e);
    alert('Server error. Please try again.');
  }
}

// ========== GALLERY LOADING ==========
async function loadGallery() {
  const trainerGrid = document.getElementById('trainerGrid');
  if (!trainerGrid) return;

  try {
    const tRes = await fetch('/api/public/trainers');
    const trainers = await tRes.json();
    if (tRes.ok) {
      trainerGrid.innerHTML = trainers.slice(0, 2).map((t, i) => `
        <div class="trainer-card reveal" style="transition-delay: ${i * 80}ms">
          <img src="${t.imageUrl || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80'}" alt="${t.name}" class="trainer-img">
          <div class="trainer-info">
            <div class="trainer-role">${t.role}</div>
            <div class="trainer-name">${t.name}</div>
            <div class="trainer-bio">${t.bio || ''}</div>
          </div>
        </div>
      `).join('');
    }
    
    // Re-trigger reveal observer
    const newReveals = document.querySelectorAll('.reveal');
    newReveals.forEach(el => observer.observe(el));
  } catch (e) {
    console.error('Failed to load trainers:', e);
  }
}

function scrollCarousel(dir) {
  const track = document.getElementById('facilityTrack');
  if (track) {
    track.scrollBy({ left: dir * 320, behavior: 'smooth' });
  }
}

// ========== PROMO BADGE ==========
async function loadPromo() {
  const container = document.getElementById('promoBadge');
  if(!container) return;
  try {
    const res = await fetch('/api/public/offers');
    const offers = await res.json();
    const active = offers.find(o => o.isActive);
    if(active) {
      container.innerHTML = `
        <div class="promo-badge reveal visible">
          <span class="pb-tag">${active.badge || 'OFFER'}</span>
          <span class="pb-text">${active.title} — ${active.discount ? active.discount + '% OFF' : 'CLAIM NOW'}</span>
        </div>
      `;
    }
  } catch(e) { console.error('Promo load fail', e); }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  loadGallery();
  loadPromo();
  
  // Handle Plan Card Glow Position
  document.querySelectorAll('.plan-mini').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--y', (e.clientY - rect.top) + 'px');
    });
  });

  // Handle Auth Tab from Hash
  const handleHash = () => {
    const hash = window.location.hash.substring(1);
    if (hash === 'register' || hash === 'login' || hash === 'payment') {
      setTimeout(() => switchAuthTab(hash), 150);
    }
  };

  handleHash();
  window.addEventListener('hashchange', handleHash);
});
