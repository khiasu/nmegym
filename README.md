# NME GYM — Fitness Beyond Limits

This is the custom-built web platform for **NME GYM Nagaland**. It’s designed to be fast, premium, and zero-cost to run. No expensive payment gateways or subscription fees—just a direct, automated system for managing a modern gym.

---

## ⚡ What it Does

### 1. The Membership Flow (Automated)
Instead of paying a 3% fee to Stripe or Razorpay, we use a custom UPI verification system:
- **Join**: New members pick a plan, pay via your UPI QR code, and upload a screenshot.
- **Verify**: You get an email notification, review the screenshot in the Admin Portal, and click "Approve."
- **Onboard**: The system automatically creates their account, generates a Member ID, and emails them their login credentials instantly.

### 2. Pay Per Session (Daily Passes)
Allows guests/non-registered visitors to purchase a 1-day pass:
- **Zero Commitment**: Visitors select the Pay Per Session option on the home page and pay via the QR code.
- **Instant Activation**: Upon admin verification, visitors receive a custom daily pass activation email instead of login credentials.
- **WhatsApp Pre-filled Redirect**: Quick-click button to send pre-filled confirmation messages directly to the visitor's WhatsApp.
- **Isolated Logging**: Daily pass metrics, revenue splits, pending verifications, and history logs are kept completely separate from registered members in the database and admin dashboard.

### 3. Full Admin Control Panel
You don't need to touch the code to update the site. The Admin Portal lets you:
- Change the **Gym Logo** and **Favicon** across the whole site.
- Update your **UPI ID** and **WhatsApp Number** (which dynamically generates payment QR codes with exact checkout amounts and contact links).
- Add/Edit **Trainers**, **Facilities**, and **Offers**.
- Manage **Memberships** (Track expiry, manual renewals, and deletions).
- Edit **About Us** text and **Policies** in real-time.

### 4. Mobile First
The entire admin dashboard and member portal are optimized for mobile. You can manage the whole gym from your phone while you're on the floor.

---

## 🛠 Tech Stack (The "Free" Engine)
- **Framework**: Next.js 16 (App Router)
- **Database**: Neon PostgreSQL (Free Tier)
- **Auth**: NextAuth.js (Secure member logins)
- **Images**: Cloudinary (Free hosting for photos and screenshots)
- **Email**: Resend (Reliable automated emails)
- **Styling**: Hand-written Vanilla CSS (Fast and clean)

---

## 🚀 Quick Start for Developers

1. **Setup Env**: Copy `.env.example` to `.env` and fill in your Neon and Cloudinary keys.
2. **Install**: `npm install`
3. **Sync DB**: `npx prisma db push`
4. **Seed**: `npm run db:seed` (Creates the default admin: `yourgymmailid@gmail.com` / 'password`)
5. **Run**: `npm run dev`

---

## 💡 Important Notes

- **Zero Cost Policy**: The project is built to stay within the free tiers of Vercel, Neon, Cloudinary, and Resend. Don't add paid plugins unless the client explicitly asks.
- **Email Delivery (Resend Sandbox)**: In testing, Resend's default onboarding domain (`onboarding@resend.dev`) will only deliver emails to the email address registered to the Resend account. For production handoff, verify the gym's custom domain (e.g., `nmegym.in`) in the Resend dashboard and update `EMAIL_FROM` in `.env` to route emails to any member's address.

---
**NME GYM — Fitness Beyond Limits.**
