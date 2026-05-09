
// ========== PAGE ROUTING ==========
function showPage(p){
  if(p==='main') window.location.href='/';
  else if(p==='auth') window.location.href='/auth.html';
  else if(p==='admin-login') window.location.href='/admin/login.html';
  else if(p==='admin') window.location.href='/admin/index.html';
}

// ========== CURSOR ==========
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
document.querySelectorAll('a,button,.class-card,.blog-card,.plan-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>ring.classList.add('expand'));
  el.addEventListener('mouseleave',()=>ring.classList.remove('expand'));
});
if('ontouchstart' in window){
  cursor.style.display='none';ring.style.display='none';
}

// ========== NAV ==========
const navEl=document.getElementById('nav');
window.addEventListener('scroll',()=>{navEl.classList.toggle('scrolled',window.scrollY>60);});
const ham=document.getElementById('hamburger');
const mob=document.getElementById('mobileMenu');
if(ham)ham.addEventListener('click',()=>{
  ham.classList.toggle('open');
  mob.classList.toggle('open');
});
function closeMobile(){
  if(ham) ham.classList.remove('open');
  if(mob) mob.classList.remove('open');
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
  entries.forEach((e,i)=>{if(e.isIntersecting)setTimeout(()=>e.target.classList.add('visible'),i*80);});
},{threshold:0.1});
reveals.forEach(el=>observer.observe(el));

// ========== AUTH ==========
function switchAuthTab(tab){
  document.getElementById('auth-login-body').style.display=tab==='login'?'block':'none';
  document.getElementById('auth-register-body').style.display=tab==='register'?'block':'none';
  document.getElementById('auth-payment-body').style.display=tab==='payment'?'block':'none';
  
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

async function memberRegister(){
  const firstName = document.getElementById('regFirst').value.trim();
  const lastName = document.getElementById('regLast').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;
  const confirm = document.getElementById('regConfirm').value;
  
  if(!firstName || !phone || !password) { alert('Please fill required fields.'); return; }
  if(password !== confirm) { alert('Passwords do not match!'); return; }

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

// ========== BLOG LOADING ==========
async function loadBlog() {
  const blogGrid = document.getElementById('blogGrid');
  if (!blogGrid) return;

  try {
    const res = await fetch('/api/public/posts');
    const posts = await res.json();
    if (res.ok && posts.length > 0) {
      blogGrid.innerHTML = posts.map((p, i) => `
        <div class="blog-card reveal" style="transition-delay: ${i * 80}ms">
          <div class="blog-img">
            <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80'}" alt="${p.title}">
            <div class="blog-cat">${p.category}</div>
          </div>
          <div class="blog-body">
            <div class="blog-title">${p.title}</div>
            <div class="blog-excerpt">${p.content.substring(0, 120)}...</div>
            <div class="blog-meta">
              <span>🕐 ${Math.ceil(p.content.split(' ').length / 200)} min read</span>
              <a href="#" class="blog-read">Read More →</a>
            </div>
          </div>
        </div>
      `).join('');
      
      // Re-trigger reveal observer for new elements
      const newReveals = blogGrid.querySelectorAll('.reveal');
      newReveals.forEach(el => observer.observe(el));
    }
  } catch (e) {
    console.error('Failed to load blog:', e);
  }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  loadBlog();
});
